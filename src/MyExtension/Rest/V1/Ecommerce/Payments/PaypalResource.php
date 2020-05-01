<?php
namespace RubedoAPI\Rest\V1\Ecommerce\Payments;
use RubedoAPI\Rest\V1\AbstractResource;
use Rubedo\Services\Manager;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use WebTales\MongoFilters\Filter;
class PaypalResource extends AbstractResource
{
    /**
     * native config for this payment means
     *
     * @var array
     */
    protected $nativePMConfig;
    public function __construct()
    {
        parent::__construct();
        $pmConfig=Manager::getService("PaymentConfigs")->getConfigForPM("paypal");
        $this->nativePMConfig=$pmConfig['data']['nativePMConfig'];
        $this
            ->definition
            ->setName('Paypal')
            ->setDescription('Deal with Paypal IPN')
            ->editVerb('post', function (VerbDefinitionEntity &$entity) {
                $entity
                    ->setDescription('Process IPN');
            });
    }
    public function postAction($params)
    {
// STEP 1: read POST data
// Reading POSTed data directly from $_POST causes serialization issues with array data in the POST.
// Instead, read raw POST data from the input stream.
        $raw_post_data = file_get_contents('php://input');
        $raw_post_array = explode('&', $raw_post_data);
        $myPost = array();
        foreach ($raw_post_array as $keyval) {
            $keyval = explode ('=', $keyval);
            if (count($keyval) == 2)
                $myPost[$keyval[0]] = urldecode($keyval[1]);
        }
// read the IPN message sent from PayPal and prepend 'cmd=_notify-validate'
        $req = 'cmd=_notify-validate';
        if(function_exists('get_magic_quotes_gpc')) {
            $get_magic_quotes_exists = true;
        }
        foreach ($myPost as $key => $value) {
            if($get_magic_quotes_exists == true && get_magic_quotes_gpc() == 1) {
                $value = urlencode(stripslashes($value));
            } else {
                $value = urlencode($value);
            }
            $req .= "&$key=$value";
        }
// STEP 2: POST IPN data back to PayPal to validate
        $ch = curl_init($this->nativePMConfig['customerRedirect']);
        curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $req);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        curl_setopt($ch, CURLOPT_FORBID_REUSE, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Connection: Close'));
// In wamp-like environments that do not come bundled with root authority certificates,
// please download 'cacert.pem' from "http://curl.haxx.se/docs/caextract.html" and set
// the directory path of the certificate as shown below:
// curl_setopt($ch, CURLOPT_CAINFO, dirname(__FILE__) . '/cacert.pem');
        if( !($res = curl_exec($ch)) ) {
            // error_log("Got " . curl_error($ch) . " when processing IPN data");
            curl_close($ch);
            exit;
        }
        curl_close($ch);
// STEP 3: Inspect IPN validation result and act accordingly
        if (strcmp ($res, "VERIFIED") == 0) {
            // The IPN is verified, process it:
            // check whether the payment_status is Completed
            // check that txn_id has not been previously processed
            // check that receiver_email is your Primary PayPal email
            // check that payment_amount/payment_currency are correct
            // process the notification
            Manager::getService("PaypalIPN")->create(array(
                "postData"=>$_POST,
                "source"=>"paypal",
                "verified"=>true
            ));
            // assign posted variables to local variables
            $payment_status = $_POST['status'];
            $orderPayKey=$_POST['pay_key'];
            if ($payment_status!="COMPLETED"){
                return array("success"=>false);
            }
            $filter = Filter::factory()->addFilter(Filter::factory('Value')->setName('paypalPayKey')->setValue($orderPayKey));
            $order=Manager::getService("Orders")->findOne($filter);
            if (!$order){
                return array("success"=>false);
            }
            if($order['status']!='pendingPayment'){
                return array("success"=>false);
            }
												
            $order['status']="payed";
            $updatedOrder=Manager::getService("Orders")->update($order);
            if (!$updatedOrder['success']){
                return array("success"=>false);
            }
												//HERE SEND EMAIL
												$mailerService = Manager::getService('Mailer');
             //mail de confirmation pour le client
            $mailerObject2 = $mailerService->getNewMessage();
            $bodyClient = "";
            $mailerObject2->setTo(array($order['userEmail'] => $order['userName']));
            $mailerObject2->setReplyTo(array("acnenligne@gmail.com" => "Les Ateliers du Chemin Neuf"));
            $mailerObject2->setFrom(array("ame@chemin-neuf.org" => "Les Ateliers du Chemin Neuf"));
            $mailerObject2->setCharset('utf-8');
            $mailerObject2->setSubject("Votre commande aux Ateliers du Chemin Neuf : " . $order["orderNumber"]);
            $mailerObject2->setBody($this->getMailConfirmation($order), 'text/html', 'utf-8');
            $mailerService->sendMessage($mailerObject2,$errors);
												
            return array("success"=>true);
        } else if (strcmp ($res, "INVALID") == 0) {
            // IPN invalid
            return array("success"=>false);
        }
    }
    
    
    private function getMailConfirmation($order) {
        $body = '<table cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0;padding:0;font-family:Lucida Grande,Arial,Helvetica,sans-serif;font-size:11px;min-width:690px">';
        $body.="<tr><td bgcolor='#f3eeea' align='center'><table cellspacing='10' cellpadding='0' border='0' width='670'>";
        //header
        $body .= '<tr><td style="padding-top:11px;padding-bottom:7px;color:#ffffff"><img height="100" src="https://www.laboutique-chemin-neuf.com/dam?media-id=56c49b78c445ecc9008b6574&mode=boxed&height=150" alt="La Boutiques des Ateliers du Chemin Neuf"/></td></tr>';
        //texte d'intro
        $body .= '<tr><td bgcolor="white"><table cellspacing="10" cellpadding="0" border="0" width="650">';
        //Bonjour Nicolas,
        $body .= '<tr><td valign="top"><h1>Bonjour '. $order['userName'].',</h1>';
        //Confirmation de commande
        $body .= '<p style="font-size:12px;">Nous vous confirmons que nous avons bien enregistré votre commande  n°' .$order["orderNumber"] . ' en date du ' . substr($order['dateCode'],6,2).'/'.substr($order['dateCode'],4,2) . '/' . substr($order['dateCode'],0,4) . '.<br/> ';
        $body .= 'Votre paiement en ligne par Paypal a bien été pris en compte.<br/>';
        //$body .= 'Vous pourrez suivre l\'avancement de votre commande <a href="https://www.laboutique-chemin-neuf.com/fr/mes-commandes/detail-commande?order='.$order['id'] .'">en vous connectant sur le site</a> ()</p></td></tr>';
        $body .= 'Vous pourrez suivre l\'avancement de votre commande <a href="https://www.laboutique-chemin-neuf.com/fr/mes-commandes/">en vous connectant sur le site</a> (pour voir vos commandes, vous devrez vous connecter si vous ne l\'êtes pas)</p></td></tr>';
        //Récapitulatif de commande
        $body .= '<tr><td><h3>Récapitulatif de votre commande</h3></td></tr>';
        $body .= '<tr><td><table cellspacing="0" cellpadding="0" border="0" width="650" style="border:1px solid #eaeaea">';
        $body .= '<thead><tr><th align="left" bgcolor="#EAEAEA" style="font-size:13px;padding:3px 9px">Article</th> <th align="center" bgcolor="#EAEAEA" style="font-size:13px;padding:3px 9px">Qté</th><th align="right" bgcolor="#EAEAEA" style="font-size:13px;padding:3px 9px">Sous-total</th></tr></thead>'; 
        foreach($order['detailedCart']['cart'] as $item) {
            $body .= '<tr><td align="left" valign="top" style="font-size:11px;padding:6px 9px;border-bottom:1px dotted #cccccc"><strong>' . $item['title'] .'</strong></td>';
            $body .= '<td align="center" valign="top" style="font-size:11px;padding:6px 9px;border-bottom:1px dotted #cccccc">' . $item['amount']. '</td>';
            $body .= '<td align="right" valign="top" style="font-size:11px;padding:6px 9px;border-bottom:1px dotted #cccccc">' . $item['taxedPrice']. ' €</td></tr>';
        }
        $body .='<tr bgcolor="white"><td colspan="2" align="right" style="padding:3px 9px;font-family:Arial,Helvetica,sans-serif;font-size:11px">Total produits (HT)</td><td align="right" style="padding:3px 9px;font-family:Arial,Helvetica,sans-serif;font-size:11px">' . $order['detailedCart']['totalPrice']. ' €</td></tr>';
        $body .='<tr bgcolor="white"><td colspan="2" align="right" style="padding:3px 9px;font-family:Arial,Helvetica,sans-serif;font-size:11px">Total produits (TTC)</td><td align="right" style="padding:3px 9px;font-family:Arial,Helvetica,sans-serif;font-size:11px">' . $order['detailedCart']['totalTaxedPrice']. ' €</td></tr>';
        $body .='<tr bgcolor="white"><td colspan="2" align="right" style="padding:3px 9px;font-family:Arial,Helvetica,sans-serif;font-size:11px">Frais d\'expédition <small>('.$order['shipper']['name'] . ')</small></td><td align="right" style="padding:3px 9px;font-family:Arial,Helvetica,sans-serif;font-size:11px">' . round($order['shippingTaxedPrice'],2). ' €</td></tr>';
        $totalPrice = $order['detailedCart']['totalTaxedPrice'] + round($order['shippingTaxedPrice'],2);
        $body .='<tr bgcolor="white"><td colspan="2" align="right" style="padding:3px 9px;font-family:Arial,Helvetica,sans-serif;font-size:11px"><strong>Prix total</strong></td><td align="right" style="padding:3px 9px;font-family:Arial,Helvetica,sans-serif;font-size:11px">' .  $totalPrice . ' €</td></tr></table><br>';
        $body .= '<table cellspacing="0" cellpadding="0" border="0" width="650">';
        $body .= '<thead><tr><th align="left" width="320" bgcolor="#EAEAEA" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;padding:5px 9px 6px 9px;line-height:1em">Adresse de facturation :</th><th width="10"></th>';
        $body .= '   <th align="left" width="320" bgcolor="#EAEAEA" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;padding:5px 9px 6px 9px;line-height:1em">Adresse d\'expédition :</th></tr></thead>';
        $body .= '<tr><td valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;padding:7px 9px 9px 9px;border-left:1px solid #eaeaea;border-bottom:1px solid #eaeaea;border-right:1px solid #eaeaea;width:319px">';
        $body .= '<p>';
        if(isset($order['billingAddress']['company'])) $body .= '<strong>'.$order['billingAddress']['company'].'</strong><br/>';
         $body .= $order['billingAddress']['surname'] . ' ' . $order['billingAddress']['name'] . '<br/>';
        if(isset($order['billingAddress']['address1'])) $body .= $order['billingAddress']['address1'] . '<br/>' ;
        if(isset($order['billingAddress']['address2'])) $body .= $order['billingAddress']['address2'] . '<br/>' ;
        if(isset($order['billingAddress']['postCode'])) $body .= $order['billingAddress']['postCode'] . ' - ' . $order['billingAddress']['city'] . '<br/>' ;
        $body .= $order['billingAddress']['country'];
        $body .= '</p></td><td>&nbsp;</td><td valign="top" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;padding:7px 9px 9px 9px;border-left:1px solid #eaeaea;border-bottom:1px solid #eaeaea;border-right:1px solid #eaeaea;width:319px">';
        $body .= '<p>';
        if(isset($order['shippingAddress']['company'])) $body .= '<strong>'.$order['shippingAddress']['company'].'</strong><br/>';
         $body .= $order['shippingAddress']['surname'] . ' ' . $order['shippingAddress']['name'] . '<br/>';
        if(isset($order['shippingAddress']['address1'])) $body .= $order['shippingAddress']['address1'] . '<br/>' ;
        if(isset($order['shippingAddress']['address2'])) $body .= $order['shippingAddress']['address2'] . '<br/>' ;
        if(isset($order['shippingAddress']['postCode'])) $body .= $order['shippingAddress']['postCode'] . ' - ' . $order['shippingAddress']['city'] . '<br/>' ;
        $body .= $order['shippingAddress']['country'];
        $body .= '</p>';

        
        $body .='</td></tr></table></td></tr>';
        $body .= '<tr><td><pstyle="font-size:12px;">Merci de votre confiance et à bientôt <a href="https://www.laboutique-chemin-neuf.com">sur notre site</a>.</p><p>Les Ateliers du Chemin Neuf</p></td></tr>';
        $body .='</table></td></tr>';
        $body .="</table></td></tr></table>";
        return $body;
    }
    
}
