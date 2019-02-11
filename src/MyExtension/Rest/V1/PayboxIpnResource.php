<?php
namespace MyExtension\Rest\V1;
use Rubedo\Collection\AbstractCollection;
use Rubedo\Services\Manager;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use RubedoAPI\Rest\V1\AbstractResource;
use RubedoAPI\Exceptions\APIControllerException;
use WebTales\MongoFilters\Filter;


class PayboxIpnResource extends AbstractResource {
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
                    ->setDescription('Get info de paiement Paybox')
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
                    ->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription("message d'erreur de l'envoi de mail")
                            ->setKey('errors')
                    );
            });
    }
    function getAction($params) {
        error_log ('DEBUG PayboxIpnResource.php getAction just entered : '.json_encode($params) . '\n', 3);
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
            //pour inscription, on récupère le contenu inscription et on change le statut
            $commande = explode("|", $params['commande']); // $codeCompta . "|" .$idInscription . "|" . $proposition . "|" . $prenom . "|" . $nom . "|" . $email; 
            $codeCompta = $commande[0];
            $idInscription = $commande[1];
            $proposition = $commande[2];
            $prenom = $commande[3];
            $nom = $commande[4];
            $montant = (int)$params['montant']/100;

            $wasFiltered = AbstractCollection::disableUserFilter(true);

            $this->_dataService = Manager::getService('MongoDataAccess');
            $this->_dataService->init("Contents");
            $content = $this->_dataService->findByName($idInscription);
            $contentId = $content['id'];
            
            $contentsService = Manager::getService("ContentsCcn");
            $inscription = $contentsService->findById($contentId,false,false);
            if($inscription) {
                //si on est sur un premier paiement par carte
                if($inscription['fields']['statut']=='attente_paiement_carte') {
                    $inscription['fields']['montantAPayerMaintenant'] = $montant;
                    $inscription['fields']['statut'] = "paiement_carte_valide" ;
                }                
                //si on est en paiement complémentaire après un premier paiement par carte :
                else if($inscription['fields']['statut']=='paiement_carte_valide') {
                    $inscription['fields']['montantAPayerMaintenant'] = $montant + (int)$inscription['fields']['montantAPayerMaintenant'];
                }
                //dans les autres cas
                else {
                    $inscription['fields']['montantAPayerMaintenant'] = $montant;
                    $inscription['fields']['statut'] = "paiement_carte_valide" ;
                }
                 $mailSecretariat = $inscription['fields']['mailSecretariat'];
                 
                $inscription['i18n'] = array(
                    $inscription['locale'] =>array(
                        "fields" => array("text"=>$inscription["text"])
                    )
                );
                $result = $contentsService->update($inscription, array(),false);

             }
            else $erreurMessage .="Le payement ".$idInscription." n'a pas été retrouvé";
            AbstractCollection::disableUserFilter(false);
 
        }    

        $siteConfig = Manager::getService("SitesConfigCcn")->getConfig();
        $mailCompta = $siteConfig['paymentConfig']['nativePMConfig']['email_compta'] ; 
        if(!isset($mailCompta)) $mailCompta="web@chemin-neuf.org";
        $mailerService = Manager::getService('Mailer');

        $mailerObject = $mailerService->getNewMessage();
        if($mailSecretariat) $destinataires=array($mailCompta,$mailSecretariat);
        else if(!isset($mailSecretariat) && $erreur == "00000") $destinataires=array($mailCompta,"web@chemin-neuf.org");
        else if(!isset($mailSecretariat) && $erreur != "00000") $destinataires=array($mailCompta);
        $replyTo="web@chemin-neuf.org";
        $from="web@chemin-neuf.org";
        
        $erreur = $params['erreur'];
        if ($erreur == "00000") {
            $sujet = "Réception d'un paiement en ligne - ".$prenom.' '. $nom;
        }
        else {
            $sujet = "Échec paiement en ligne";
        }
        if ($erreur == "00000") {
            $body = "Montant payé : " . $params['montant']/100 . " euros.\n" ;
            $body.=$inscription['content']['fields']['propositionTitre'];
            $body .= "Proposition : " . $inscription['fields']['propositionTitre']."\n";
            $body .= "Code Onesime : " . $inscription['fields']['codeOnesime']."\n";
            $body .= "Code Compta : " . $codeCompta."\n";
            $body .= "Id Inscription : " . $inscription['fields']['text']."\n";
            $body .= "Nom : " . $inscription['fields']['nom']."\n";
            $body .= "Prénom : " . $inscription['fields']['surname']."\n";
            $body .= "Email : " . $inscription['fields']['email']."\n";
             if($inscription['fields']['public_type'] == "couple" || $inscription['fields']['public_type'] == "fiances" || $inscription['fields']['public_type'] == "famille") {
                if(isset($inscription['fields']['nomPers2'])) $body .= "Nom 2e personne : " . $inscription['fields']['nomPers2']."\n";
                if(isset($inscription['fields']['prenomPers2'])) $body .= "Prénom 2e personne : " . $inscription['fields']['prenomPers2']."\n";
                if(isset($inscription['fields']['emailPers2'])) $body .= "Email 2e personne: " . $inscription['fields']['emailPers2']."\n";
             }
            if($erreurMessage!="") $body.="\n\n Message : " . $erreurMessage;
            
            
            /*CONFIRM PAYMENT FOR USER*/
            if($inscription['fields']['email']){
                 $mailUser = $mailerService->getNewMessage();
                 $mailUser->setTo(array($inscription['fields']['email']));
                 $mailUser->setFrom(array("web@chemin-neuf.org" => "Communauté du Chemin Neuf"));
                 $mailUser->setReplyTo($mailSecretariat);
                 $mailUser->setSubject("Accusé de réception payement en ligne");
                 $messageUser="Bonjour,\n";
                 $messageUser.="Nous vous confirmons la réception de votre payement en ligne de ".$params['montant']/100  . " euros suite à votre inscription à : ".$inscription['fields']['propositionTitre']."\n";
                 $messageUser.= "Merci de votre confiance.";
                 $mailUser->setBody($body);
                 $mailerService->sendMessage($mailUser, $errors);
            }
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
                'message' => $body,
                'errors' =>$_SERVER
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Error encountered, more details in "errors"',
                'errors' => $erreurMessage
            ];
        }
    }


    protected function writeLog($title, $msg) {
        if (gettype($msg) != 'string') $msg = json_encode($msg);
        $msg = $title.' :: '.$msg;
        file_put_contents('/var/www/html/rubedo/log/custom_debug_paybox_ipn.log', date("Y-m-d H:i") . $msg . "\n", FILE_APPEND | LOCK_EX);
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
