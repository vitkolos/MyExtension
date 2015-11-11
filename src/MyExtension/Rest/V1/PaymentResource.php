<?php
namespace MyExtension\Rest\V1;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use RubedoAPI\Rest\V1\AbstractResource;
use Zend\View\Model\JsonModel;
use Rubedo\Collection\AbstractLocalizableCollection;
use Rubedo\Services\Manager;
use RubedoAPI\Exceptions\APIAuthException;
use RubedoAPI\Exceptions\APIEntityException;
use RubedoAPI\Exceptions\APIRequestException;
use WebTales\MongoFilters\Filter;


class PaymentResource extends AbstractResource {
   /**
     * @var array
     */
    protected $returnedEntityFields = array(
        'fields'
    );
    protected $_dataService;
    protected $_collectionName;
    public function __construct()
    {
        parent::__construct();
        $this
            ->definition
            ->setName('TestPaybox')
            ->setDescription('Module de paiement en ligne')
            ->editVerb('post', function (VerbDefinitionEntity &$verbDefinitionEntity) {
                $verbDefinitionEntity
                    ->setDescription('Infos en post')
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Montant')
                            ->setKey('montant')
                            ->setFilter('string')
                            ->setRequired()
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('prenom')
                            ->setKey('prenom')
                            ->setFilter('string')
                            ->setRequired()
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('nom')
                            ->setKey('nom')
                            ->setFilter('string')
                            ->setRequired()
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('email')
                            ->setKey('email')
                            ->setFilter('string')
                            ->setRequired()
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Mode de paiement')
                            ->setKey('paymentMode')
                            ->setFilter('string')
                            ->setRequired()
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('idInscription')
                            ->setKey('idInscription')
                            ->setFilter('string')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Nom de la proposition')
                            ->setKey('proposition')
                            ->setFilter('string')
                    )
                    ->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Parametres pour bouton Paybox ou infos de payement par chèque')
                            ->setKey('parametres')
                    )
                    ;
            });
    }
    public function postAction($params) {
    /*récupérer les paramètres*/
        $idInscription = $params['idInscription']; // numéro d'inscription
        $nom = $params['nom'];
        $prenom = $params['prenom'];
        $email = $params['email'];
        $proposition = $params['proposition']; // titre de la proposition si inscription
        $paymentMode=$params['paymentMode']; // mode de paiement
 
    // récupérer l'id du compte de paiement
        $id = $this->getAccountId();
    // récupérer les infos du compte
        $paymentInfos = $this->getPaymentInfos($id);

        switch ($paymentMode) {
         /*PAIEMENT PAR CARTE -> COMPTE PAYBOX*/   
            case "carte":
                $dateTime = date("c");
                $urlNormal="http://" . $_SERVER['HTTP_HOST'] ;//. "/payment/success";
                $urlEchec="http://" . $_SERVER['HTTP_HOST'] ;//. "/payment/cancel";
                $urlCallback="http://" . $_SERVER['HTTP_HOST'] . "/api/v1/PayboxIpn/";
                $commande = $idInscription . "|" . $proposition . "|" . $prenom . "|" . $nom; 
                $payboxSite = $paymentInfos['site'];
                $payboxRang = $paymentInfos['rang'];
                $payboxID = $paymentInfos['identifiant'];
                $payboxDevise = $paymentInfos['devise'];
                $parametres = [
                    "typePaiement" => "CARTE",
                    "typeCarte" => "CB",
                    "payboxSite" => $payboxSite,
                    "payboxRang" => $payboxRang,
                    "payboxIdentifiant" => $payboxID,
                    "montantEnCentimes" => $params['montant'] *100,
                    "codeMonnaieNumerique" =>$payboxDevise,
                    "commande" => $commande, 
                    "email" => $email, 
                    "payboxRetour" => "referencePaybox:S;montant:M;commande:R;autorisation:A;pays:I;erreur:E;",
                    "dateTime" => $dateTime,
                    "urlRetourNormal" => $urlNormal,
                    "urlRetourEchec" => $urlEchec,
                    "urlCallback" => $urlCallback
                ];
        
                $empreinteBrute  =
                    "PBX_TYPEPAIEMENT=". $parametres['typePaiement'] . 
                    "&PBX_TYPECARTE=" . $parametres['typeCarte']  .
                    "&PBX_SITE=" . $parametres['payboxSite']  .
                    "&PBX_RANG=" . $parametres['payboxRang']  .
                    "&PBX_IDENTIFIANT=" . $parametres['payboxIdentifiant']  .
                    "&PBX_TOTAL=" . $parametres['montantEnCentimes']  .
                    "&PBX_DEVISE=" . $parametres['codeMonnaieNumerique']  .
                    "&PBX_CMD=" . $parametres['commande'] . 
                    "&PBX_PORTEUR=" . $parametres['email']  .
                    "&PBX_RETOUR=" . $parametres['payboxRetour']  .
                    "&PBX_HASH=" . "SHA512"  .
                    "&PBX_TIME=" . $parametres['dateTime']  .
                    "&PBX_EFFECTUE=" . $parametres['urlRetourNormal']  .
                    "&PBX_REFUSE=" . $parametres['urlRetourEchec']  .
                    "&PBX_ANNULE=" . $parametres['urlRetourEchec']  .
                    "&PBX_REPONDRE_A=" . $parametres['urlCallback']  ;
        
                //$key = "0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF";
                $key = $paymentInfos['clef'];
                // On transforme la clé en binaire
                $binKey = pack("H*", $key);
        
                // On calcule l’empreinte (à renseigner dans le paramètre PBX_HMAC) grâce à la fonction hash_hmac et 
                // la clé binaire
                // On envoie via la variable PBX_HASH l'algorithme de hachage qui a été utilisé (SHA512 dans ce cas)
                
                // Pour afficher la liste des algorithmes disponibles sur votre environnement, décommentez la ligne 
                // suivante
                // print_r(hash_algos());
        
                $empreinteHasheeHex = strtoupper(hash_hmac('sha512', $empreinteBrute, $binKey));
                // La chaîne sera envoyée en majuscules, d'où l'utilisation de strtoupper()
                $parametres['empreinteHasheeHex'] = $empreinteHasheeHex;
                break;
        
        
        
         /*PAIEMENT PAR CHEQUE */           
            case "cheque":
                $parametres = [
                    "libelleCheque" => $paymentInfos['libelleCheque']
                ];
            
                break;
         /*PAIEMENT PAR VIREMENT */           
            case "virement":
                $parametres = [
                    "titreCompteVir" =>$paymentInfos['titreCompteVir'] ,
                    "ribTexte" =>$paymentInfos['ribTexte'] ,
                    "ribImg" =>$paymentInfos['rib'] 
                ];
                break;
         /*PAS DE MODE DE PAIMENT SPECIFIE*/           
            default:
                $parametres = "Pas de mode de paiement indiqué";
        }
        
        
        return array(
            'success' => true,
            'parametres' => $parametres
        );
    }
    
    public function getPaymentInfos($id){
        $contentId = (string)$id;
        $className = (string)get_class($this);

        $this->_dataService = Manager::getService('MongoDataAccess');
        $this->_dataService->init("Contents");
        $content = $this->_dataService->findById($id);
        if (empty($content)) {
            throw new APIEntityException('Content not found', 404);
        }
        return $content['live']['fields'];
    }
    protected function getAccountId(){
        switch($_SERVER['HTTP_HOST']) {
            case "ccn.chemin-neuf.fr" : 
                return "55473e9745205e1d3ef1864d"; break;
        }
     }
     
} 
