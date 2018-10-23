<?php
namespace MyExtension\Rest\V1;
use RubedoAPI\Rest\V1\AbstractResource;
use Rubedo\Services\Manager;
use Rubedo\Collection\AbstractLocalizableCollection;
use Rubedo\Collection\AbstractCollection;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use WebTales\MongoFilters\Filter;
use RubedoAPI\Rest\V1\DonationResource;
class PaypalIpnCcnResource extends AbstractResource
{
    /**
     * native config for this payment means
     *
     * @var array
     */
    //protected $nativePMConfig;
        protected $_dataService;

    public function __construct()
    {
        parent::__construct();
        //$pmConfig=Manager::getService("PaymentConfigs")->getConfigForPM("paypal");
        //$this->nativePMConfig=$pmConfig['data']['nativePMConfig'];
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
        $ch = curl_init("https://www.paypal.com/cgi-bin/webscr"); //https://www.paypal.com/cgi-bin/webscr
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
        $errors = "";
// STEP 3: Inspect IPN validation result and act accordingly
        if (strcmp ($res, "VERIFIED") == 0) {
            // The IPN is verified, process it:
            // check whether the payment_status is Completed
            if($_POST['payment_status']=="Completed") {
                $wasFiltered = AbstractCollection::disableUserFilter(true);
                // check that receiver_email is your Primary PayPal email
                $donationName = $_POST['item_number'];
                //get donation infos
                $this->_dataService = Manager::getService('MongoDataAccess');
                $this->_dataService->init("Contents");
                $donation = $this->_dataService->findByName($donationName);
                //get the fiscal condition used
                $contentsService = Manager::getService("ContentsCcn");
                $conditionId = $donation['live']['fields']['conditionId'];
                $conditionFiscale = $contentsService->findById($conditionId,false,false);
                //get the configuration de payement content
                if($donation["live"]["fields"]["isInternational"]) {
                    //$paymentConfig = Manager::getService("PaymentConfigs")->getConfigForPM($conditionFiscale["fields"]["config_hors_pays"]);
                    $paymentConfig = $contentsService->findById($conditionFiscale["fields"]["config_int_id"],false,false);
                }
                else {
                    //$paymentConfig = Manager::getService("PaymentConfigs")->getConfigForPM($conditionFiscale["fields"]["config_pays"]);
                    $paymentConfig = $contentsService->findById($conditionFiscale["fields"]["config_pays_id"],false,false);
                }
                
                if($paymentConfig['fields']['paypal'] == $_POST['receiver_email'] && $donation["live"]["fields"]["montant"] == $_POST['mc_gross']) {
                    //mettre à jour le statut de payement dans le contenu don
                    //récupérer le contenu don avec le bon format :-)
                    $contentToUpdate = $contentsService->findById($donation["id"],false,false);
                    
                    $contentToUpdate["i18n"] = $donation["live"]["i18n"];
                    $contentToUpdate["fields"]["etat"]="paiement_paypal_valide";
                    //update payement status
                    $result = $contentsService->update($contentToUpdate, array(),false);
                    AbstractCollection::disableUserFilter(false);
                    $projectDetail = $contentsService->findById($donation["live"]["fields"]["projetId"],false,false);
                    DonationResource::envoyerMailsDon($contentToUpdate["fields"],$projectDetail,$paymentConfig["fields"],$donation['live']['nativeLanguage'], false);
                }
            }  
            else {
                $mailerService = Manager::getService('Mailer');
                $mailerObject = $mailerService->getNewMessage();
                $destinataires=array("web@chemin-neuf.org");
                $replyTo="web@chemin-neuf.org";
                $from="web@chemin-neuf.org";
                $sujet = "Test";
                $body="retour de paypal : payement status unconfirmed\n";
                foreach ($_POST as $key => $value) {
                    $body .= $key . " : " . $value . "\n";
                }
                $mailerObject->setTo($destinataires);
                $mailerObject->setFrom($from);
                $mailerObject->setSubject($sujet);
                $mailerObject->setReplyTo($replyTo);
                $mailerObject->setBody($body);
                $mailerService->sendMessage($mailerObject, $errors);
            }
            
            // check that payment_amount/payment_currency are correct
            // process the notification
            
            return array("success" => true);
        } 
        else if (strcmp ($res, "INVALID") == 0) {
            $mailerService = Manager::getService('Mailer');
            $mailerObject = $mailerService->getNewMessage();
            $destinataires=array("nicolas.rhone@chemin-neuf.org", "web@chemin-neuf.org");
            $replyTo="web@chemin-neuf.org";
            $from="web@chemin-neuf.org";
            $sujet = "Test";
            $body="retour de paypal : payement non vérifié\n";
            foreach ($_POST as $key => $value) {
                
                $body .= $key . " : " . $value . "\n";
            }
            $mailerObject->setTo($destinataires);
            $mailerObject->setFrom($from);
            $mailerObject->setSubject($sujet);
            $mailerObject->setReplyTo($replyTo);
            $mailerObject->setBody($body);
            $mailerService->sendMessage($mailerObject, $errors);
            // IPN invalid
            return array("success"=>false);
        }
   


    }
    public function translate($string,$toReplaceArray,$toReplaceWithArray)
    {
        return str_replace($toReplaceArray,$toReplaceWithArray,$string);
    } 
    public function addLine($titre, $reponse, $reponse2){
        if(isset($reponse2)) return "<tr><td bgcolor='#8CACBB' width=33%><i>" .$titre . "</i></td><td width=33%>" . $reponse . "</td><td width=33%>".$reponse2 ."</td></tr>";
        else return "<tr><td bgcolor='#8CACBB' width=33%><i>" .$titre . "</i></td><td width=67% colspan=2>" . $reponse . "</td></tr>";
    }
}
