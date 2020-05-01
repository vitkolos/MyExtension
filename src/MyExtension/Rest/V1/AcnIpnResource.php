<?php
namespace MyExtension\Rest\V1;
use RubedoAPI\Rest\V1\AbstractResource;
use Rubedo\Services\Manager;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use WebTales\MongoFilters\Filter;


class AcnIpnResource extends AbstractResource {
    protected $returnedEntityFields = array(
        'fields'
    );
    protected $_dataService;
    protected $_collectionName;
    function __construct()
    {
        parent::__construct();
        $this
            ->definition
            ->setName('PayboxIpn')
            ->setDescription('Paybox IPN')
            ->editVerb('get', function (VerbDefinitionEntity &$verbDefinitionEntity) {
                $verbDefinitionEntity
                    ->setDescription('Get info de paiement Paybox pour les ACN')
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('referencePaybox')
                            ->setKey('referencePaybox')
                            ->setFilter('string')
                            ->setRequired()
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('montant')
                            ->setKey('montant')
                            ->setFilter('string')
                            ->setRequired()
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('commande')
                            ->setKey('commande')
                            ->setFilter('string')
                            ->setRequired()
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Autorisation')
                            ->setKey('autorisation')
                            ->setFilter('string')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Pays')
                            ->setKey('pays')
                            ->setFilter('string')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('erreur')
                            ->setKey('erreur')
                            ->setFilter('string')
                            ->setRequired()
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Signature')
                            ->setKey('signature')
                            ->setFilter('string')
                            ->setRequired()
                    )
                   ->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('message general')
                            ->setKey('message')
                    )
                    /*->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription("message d'erreur de l'envoi de mail")
                            ->setKey('errors')
                    )*/
                    ;
            });
    }
    function getAction($params) {
        $mailerService = Manager::getService('Mailer');
        $securite = true; $autorisation = false;$erreurStatus = true; $erreurMessage=""; 
        //VERIFICATIONS PAYBOX
        //code d'erreur
        if($params['erreur'] == "00000") $erreurStatus = false;
        else $erreurMessage = $this->getErrorMessage($params['erreur']);
          
        //autorisation
       if($params['autorisation'] && $params['autorisation']!="") $autorisation = true;
        else $erreurMessage .= " Pas d'autorisation de Paybox. ";


        if(!($erreurStatus) && $securite && $autorisation) {
            // ENREGISTRER LE PAIEMENT DANS LA BASE DE DONNEES
            
            $orderNumber = $params['commande']; // on récupère le numéro de commande
           //on récupère la commande
            $filter = Filter::factory()->addFilter(Filter::factory('Value')->setName('orderNumber')->setValue($orderNumber));
            
            $order=Manager::getService("Orders")->findOne($filter);
        // véfifier si le montant de la commande est bien le montant payé  et update order
        /*$finalPrice = ((float)$order['finalPrice']) * 100;
                    $receivedPrice = (float)$postParams['vads_amount'];
                    if (round($finalPrice, 2) != round($receivedPrice, 2)){*/
        
            if(round((float)$order['finalPrice'], 2) == round((((int)$params['montant'])/100),2 ) ){
                $paymentValide = true;
                $order['status']="payed";
                $updatedOrder=Manager::getService("Orders")->update($order);
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
         
            }

            
        }    


        
        $mailAcn ="acnenligne@gmail.com";
        

        $mailerObject = $mailerService->getNewMessage();
        $destinataires=array($mailAcn);
        $replyTo="web@chemin-neuf.org";
        $from="web@chemin-neuf.org";
        
        $erreur = $params['erreur'];
        if ($erreur == "00000") {
            $sujet = "Réception d'un paiement en ligne - ".$order['userName'];
        }
        else {
            $sujet = "Échec paiement en ligne";
        }
        if ($erreur == "00000") {
            $body = "";
            if(!$paymentValide) {
                $body .= "Attention ! Le montant payé n'est pas le montant de la commande ! Vérifier si le payement a bien été reçu, il pourrait s'agir d'une escroquerie." . "\n";
                $body.="Montant de la commande : " . $order['finalPrice']."\n";
                $body.="Montant payé : " . number_format($params['montant']/100,2)  ."\n";
            }
            foreach ($order as $name => $content) {
                $body .= $name . ' : ' . $content."\n";
            }
            
            if($erreurMessage!="") $body.="\n\n Message : " . $erreurMessage;
        }
        else {
            $body = "Montant non payé : " . $params['montant']/100  . " euros." ;
            $body.="\n\n Raisons de l'échec : ".$erreurMessage;
        }
        $body = $body . " \n\n " . $params['commande'];
        $mailerObject->setTo($destinataires);
        $mailerObject->setFrom($from);
        $mailerObject->setSubject($sujet);
        $mailerObject->setReplyTo($replyTo);
        $mailerObject->setBody($body);

											
        
        
        
        // Send e-mail
        if ($mailerService->sendMessage($mailerObject, $errors)) {
            return [
                'success' => true,
                'message' => $body
            ];
        } else {
            return [
                'success' => false,
                'message' => $body
            ];           
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
        $body .= 'Votre paiement en ligne par carte bancaire a bien été pris en compte.<br/>';
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
    

    public function getErrorMessage($error) {
        $message="";
        switch($error) {
            case "00001" : $message = "La connexion au centre d’autorisation a échoué ou une erreur interne est survenue. Dans ce cas, il est souhaitable de faire une tentative sur le site secondaire : tpeweb1.paybox.com."; break;
            case "00003" : $message = "Erreur Paybox. Dans ce cas, il est souhaitable de faire une tentative sur le site secondaire FQDN tpeweb1.paybox.com."; break;
            case "00004" : $message = "Numéro de porteur ou cryptogramme visuel invalide."; break;
            case "00006" : $message = "Accès refusé ou site/rang/identifiant incorrect."; break;
            case "00008" : $message = "Date de fin de validité incorrecte."; break;
            case "00009" : $message = "Erreur de création d’un abonnement."; break;
            case "00010" : $message = "Devise inconnue."; break;
            case "00011" : $message = "Montant incorrect."; break;
            case "00015" : $message = "Paiement déjà effectué."; break;
            case "00016" : $message = "Abonné déjà existant (inscription nouvel abonné). Valeur ‘U’ de la variable PBX_RETOUR."; break;
            case "00021" : $message = "Carte non autorisée."; break;
            case "00029" : $message = "Carte non conforme. Code erreur renvoyé lors de la documentation de la variable « PBX_EMPREINTE »."; break;
            case "00030" : $message = "Temps d’attente > 15 mn par l’internaute/acheteur au niveau de la page de paiements."; break;
            case "00031" : $message = "Réservé."; break;
            case "00032" : $message = "Réservé."; break;
            case "00033" : $message = "Code pays de l’adresse IP du navigateur de l’acheteur non autorisé."; break;
            case "00040" : $message = "Opération sans authentification 3-DSecure, bloquée par le filtre."; break;
            case "99999" : $message = "Opération en attente de validation par l’émetteur du moyen de paiement."; break;
            case "00032" : $message = "Réservé."; break;
            case "00032" : $message = "Réservé."; break;
            case "00032" : $message = "Réservé."; break;
            case "00100": $message = "Transaction approuvée ou traitée avec succès"; break;
            case "00101": $message =  "Contacter l’émetteur de carte"; break;
            case "00102": $message = "Contacter l’émetteur de carte"; break;
            case "00103": $message = "Commerçant invalide"; break;
            case "00104": $message = "Conserver la carte"; break;
             case "00105": $message = "Ne pas honorer"; break;
            case "00107": $message = "Conserver la carte, conditions spéciales"; break;
            case "00108": $message = "Approuver après identelification du porteur"; break;
            case "00112": $message = "Transaction invalide"; break;
            case "00113": $message = "Montant invalide"; break;
            case "00114": $message = "Numéro de porteur invalide"; break;
            case "00115": $message = "Emetteur de carte inconnu"; break;
            case "00117": $message = "Annulation client"; break;
            case "00119": $message = "Répéter la transaction ultérieurement"; break;
            case "00120": $message = "Réponse erronée (erreur dans le domaine serveur)"; break;
            case "00124": $message = "Mise à jour de fichier non supportée"; break;
            case "00125": $message = "Impossible de localiser l’enregistrement dans le fichier"; break;
            case "00126": $message = "Enregistrement dupliqué, ancien enregistrement remplacé"; break;
            case "00127": $message = "Erreur en « edit » sur champ de mise à jour fichier"; break;
            case "00128": $message = "Accès interdit au fichier"; break;
            case "00129": $message = "Mise à jour de fichier impossible"; break;
            case "00130": $message = "Erreur de format"; break;
            case "00133": $message = "Carte expirée"; break;
            case "00138": $message =  "Nombre d’essais code confidentiel dépassé"; break;
            case "00141": $message =  "Carte perdue"; break;
            case "00143": $message =  "Carte volée"; break;
            case "00151": $message =  "Provision insuffisante ou crédit dépassé"; break;
            case "00154": $message =  "Date de validité de la carte dépassée"; break;
            case "00155": $message =  "Code confidentiel erroné"; break;
            case "00156": $message =  "Carte absente du fichier"; break;
            case "00157": $message =  "Transaction non permise à ce porteur"; break;
            case "00158": $message =  "Transaction interdite au terminal"; break;
            case "00159": $message =  "Suspicion de fraude"; break;
            case "00160": $message =  "L’accepteur de carte doit contacter l’acquéreur"; break;
            case "00161": $message =  "Dépasse la limite du montant de retrait"; break;
            case "00163": $message =  "Règles de sécurité non respectées"; break;
            case "00168": $message =  "Réponse non parvenue ou reçue trop tard"; break;
            case "00175": $message =  "Nombre d’essais code confidentiel dépassé"; break;
            case "00176": $message =  "Porteur déjà en opposition, ancien enregistrement conservé"; break;
            case "00189": $message =  "Echec de l’authentelification"; break;
            case "00190": $message =  "Arrêt momentané du système"; break;
            case "00191": $message =  "Emetteur de cartes inaccessible"; break;
            case "00194": $message =  "Demande dupliquée"; break;
            case "00196": $message =  "Mauvais fonctionnement du système"; break;
            case "00197": $message =  "Echéance de la temporisation de surveillance globale"; break;
            default : $message = "Erreur non documentée";
        }
        return $message;
    }
    
    protected function subTokenFilter(&$token)
    {
        return array_intersect_key($token, array_flip(array('access_token', 'refresh_token', 'lifetime', 'createTime')));
    }
    
    public function getContentIdByName($name){
        $contentId = (string)$id;
        $className = (string)get_class($this);

        $this->_dataService = Manager::getService('MongoDataAccess');
        $this->_dataService->init("Contents");
        $content = $this->_dataService->findByName($name);
        if (empty($content)) {
            throw new APIEntityException('Content not found', 404);
        }
        return $content['id'];
    }    
} 
