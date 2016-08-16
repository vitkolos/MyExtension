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
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Numéro d\opération donné par DotPay')
                            ->setKey('operation_number')
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


        $sujet="";
        $erreurMessage="";
        $commande = explode("|",$params["description"]); //$codeCompta . "|" . $idInscription . "|" . urlencode($prenom) . "|" . urlencode($nom)
        $codeCompta = $commande[0];
        $idInscription = $commande[1];
        $prenom = $commande[2];
        $nom = $commande[3];
        $isSameTransaction  = false; // dotpay attend juste "OK" comme réponse ; comme on renvoie un array, il retente plusieurs fois !
        //vérifier si le payement est réussi
        $erreur = true;
        if($params["operation_status"]=='completed') {
            $erreur=false;
            $sujet = "Réception d'un paiement en ligne - ".$idInscription.' - '.$prenom.' '. $nom;
        }
        else $sujet = "Échec paiement en ligne - ".$idInscription;

        if(!$erreur) {
            $montant = $params["operation_amount"];
            $wasFiltered = AbstractCollection::disableUserFilter(true);

            $this->_dataService = Manager::getService('MongoDataAccess');
            $this->_dataService->init("Contents");
            $content = $this->_dataService->findByName($idInscription);
            $contentId = $content['id'];
            $contentsService = Manager::getService("ContentsCcn");
            $inscription = $contentsService->findById($contentId,false,false);
            
            
            /*arrondir le montant sans virgule*/
            $montant = (int)$params['operation_amount'];

            
            if($inscription) {
                //si on est sur un premier paiement par carte
                if($inscription['fields']['statut']=='attente_paiement_carte') {
                    $inscription['fields']['montantAPayerMaintenant'] = $montant;
                    $inscription['fields']['statut'] = "paiement_carte_valide" ;
                    $inscription['fields']['transactionId']=$params["operation_number"];
                }                
                
                else if($inscription['fields']['statut']=='paiement_carte_valide') {
                    //si on est en paiement complémentaire après un premier paiement par carte :
                    if($inscription['fields']['transactionId'] && $inscription['fields']['transactionId']!=$params["operation_number"]) {
                        $inscription['fields']['montantAPayerMaintenant'] = $montant + (int)$inscription['fields']['montantAPayerMaintenant'];
                    }
                    // si on est sur un second appel urlc de dotpay
                    else $isSameTransaction = true;
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
                if(!$isSameTransaction) $result = $contentsService->update($inscription, array(),false);
             
            
            }
            else $erreurMessage .="Le payement ".$idInscription." n'a pas été retrouvé";
            AbstractCollection::disableUserFilter(false);
            
            $mailCompta = $this->getMailCompta();

            $mailerService = Manager::getService('Mailer');
    
            $mailerObject = $mailerService->getNewMessage();
            if($mailSecretariat) $destinataires=array($mailCompta,$mailSecretariat);
            else $destinataires=array($mailCompta,"nicolas.rhone@chemin-neuf.org");
            $replyTo="web@chemin-neuf.org";
            $from="web@chemin-neuf.org";
            
            
            if (!$erreur) {
                $body = "Montant payé : " . $montant . " zl.\n" ;
                $body .= "Identifiant de la transaction : " . $inscription['fields']['transactionId'] . "\n" ;
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
                $body = "Montant non payé : " . $montant  . " zl." ;
                $body.="\n\n Raisons de l'échec : ".$erreurMessage;
            }
            $body = $body . " \n\n " . $params['commande'];
        
            $mailerObject->setTo($destinataires);
            $mailerObject->setFrom($from);
            $mailerObject->setSubject($sujet);
            $mailerObject->setReplyTo($replyTo);
            $mailerObject->setBody($body);
            
            if(!$isSameTransaction) $mailerService->sendMessage($mailerObject, $errors);
        }
    
        
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
