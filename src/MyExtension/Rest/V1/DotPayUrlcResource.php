<?php
namespace MyExtension\Rest\V1;
use Rubedo\Collection\AbstractCollection;
use Rubedo\Services\Manager;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use RubedoAPI\Rest\V1\AbstractResource;
use RubedoAPI\Exceptions\APIControllerException;
use WebTales\MongoFilters\Filter;


class DotPayUrlcResource extends AbstractResource {
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
            ->setName('DotPayUrlc')
            ->setDescription('Retour de DotPay')
            ->editVerb('post', function (VerbDefinitionEntity &$verbDefinitionEntity) {
                $verbDefinitionEntity
                    ->setDescription('Get info de paiement Dotpay')
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('ID du compte dotpay')
                            ->setKey('id')
                            ->setFilter('string')
                            //->setRequired()
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Transaction status')
                            ->setKey('operation_status')
                            ->setFilter('string')
                            //->setRequired()
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Transaction amount')
                            ->setKey('operation_amount')
                            ->setFilter('string')
                            //->setRequired()
                    )
                    
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Currency of transaction')
                            ->setKey('operation_currency')
                            ->setFilter('string')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Description of transaction  = inscription number')
                            ->setKey('description')
                            ->setFilter('string')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Email of the person making the payment')
                            ->setKey('email')
                            ->setFilter('string')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Signature (for security)')
                            ->setKey('signature')
                            ->setFilter('string')
                            //->setRequired()
                    )
                    
                    ->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('message general')
                            ->setKey('message')
                    );
            });
    }
    function postAction($params) {
        //vérifier si le payement est réussi
        $erreur = true;
        if($params["operation_status"]=='completed') $erreur=false;

        if(!$erreur) {
            $commande = explode("|",$params["description"]); //$codeCompta . "|" . $idInscription . "|" . urlencode($prenom) . "|" . urlencode($nom)
            var_dump($commande);
            $codeCompta = $commande[0];
            $idInscription = $commande[1];
            $prenom = $commande[2];
            $nom = $commande[3];
            $montant = $params["operation_amount"];
            $wasFiltered = AbstractCollection::disableUserFilter(true);

            $this->_dataService = Manager::getService('MongoDataAccess');
            $this->_dataService->init("Contents");
            $content = $this->_dataService->findByName($idInscription);
            $contentId = $content['id'];
            var_dump($content);
            $contentsService = Manager::getService("ContentsCcn");
            $inscription = $contentsService->findById($contentId,false,false);
            var_dump($inscription);
            
            $mailSecretariat="";
            foreach($inscription["fields"] as $key => $value) {
                $mailSecretariat .= $key . " : " . $value ."\n";
            }
            
        $mailerService = Manager::getService('Mailer');

        $mailerObject = $mailerService->getNewMessage();
        $destinataires=array("nicolas.rhone@gmail.com");
        $replyTo="web@chemin-neuf.org";
        $from="web@chemin-neuf.org";
        
        $sujet ="Payement PL";
        
        
        
        $mailerObject->setTo($destinataires);
        $mailerObject->setFrom($from);
        $mailerObject->setSubject($sujet);
        $mailerObject->setReplyTo($replyTo);
        $mailerObject->setBody($mailSecretariat);

        // Send e-mail
        $mailerService->sendMessage($mailerObject, $errors);
        
        }
        
        /*
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
                    $inscription['fields']['montantAPayerMaintenant'] = $montant + (int)$inscription['fields']['montantAPayerMaintenant'];
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


        
        $mailCompta = $this->getMailCompta();
        $mailerService = Manager::getService('Mailer');

        $mailerObject = $mailerService->getNewMessage();
        if($mailSecretariat) $destinataires=array($mailCompta,$mailSecretariat);
        else $destinataires=array($mailCompta,"nicolas.rhone@chemin-neuf.org");
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
                'message' => $body,
                'errors' =>$_SERVER
            ];
        } else {
            return [
                'success' => false,
                'message' => 'Error encountered, more details in "errors"',
                'errors' => $erreurMessage
            ];
        }*/
        
        return [
                'success' => true,
                'message' => 'OK'
            ];
    }


    protected function getMailCompta(){
        switch($_SERVER['HTTP_HOST']) {
            case "chemin-neuf.fr" : 
                return "ccn.comptabilite@gmail.com"; break;
            case "www.chemin-neuf.pl" : 
                return "nicolas.rhone@gmail.com"; break;
        }
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
