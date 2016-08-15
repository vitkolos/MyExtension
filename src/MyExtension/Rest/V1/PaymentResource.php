<?php
namespace MyExtension\Rest\V1;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use RubedoAPI\Rest\V1\AbstractResource;
use Rubedo\Collection\AbstractCollection;

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
                            ->setDescription('Toutes les infos de l\'inscription')
                            ->setKey('infos')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Type de paiement (paf / dons)')
                            ->setKey('paymentType')
                            ->setFilter('string')
                            ->setRequired()
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Moyen de payement en ligne (paybox/dotpay)')
                            ->setKey('onlinePaymentMeans')
                            ->setFilter('string')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Nom du compte (pour récupérer les infos de payement)')
                            ->setKey('accountName')
                            ->setFilter('string')
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
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('ID du lieu (pour compta)')
                            ->setKey('placeID')
                            ->setFilter('string')
                    )
                    ->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Parametres pour bouton Paybox ou infos de payement par chèque')
                            ->setKey('parametres')
                    );
            });
    }
    public function postAction($params) {
    /*récupérer les paramètres*/
        $idInscription = $params['idInscription']; // numéro d'inscription ou de paiment
        $nom = $params['nom'];
        $prenom = $params['prenom'];
        $email = $params['email'];
        $proposition = $params['proposition']; // titre de la proposition si inscription
        $paymentType=$params['paymentType']; // type de paiement (paf ou dons)
        $place = $params['placeID']; // lieu communautaire pour compta
        $onlinePaymentMeans=$params['onlinePaymentMeans'];  //moyen de payment en ligne du site
        $codeCompta="";

        //get account properties
        $paymentConfig=Manager::getService("PaymentConfigs")->getConfigForPM($params['accountName']);
        
        //get code comptabilité (par maison /pays)
        if($paymentType=="paf"){
            /*le paramètre placeId est l'id du lieu communautaire, dans lequel est stocké le code compta*/
            if($place && $place!="") {
                $wasFiltered = AbstractCollection::disableUserFilter(true);
                $lieuCommunautaire = Manager::getService("Contents")->findById($place,false,false);
                $codeCompta = "[" . $lieuCommunautaire["fields"]["codeCompta"] . "]";
            }
            else $codeCompta = "[no]";
        }
        else if($paymentType=="dons") {
            /*le code compta est envoyé dans le paramètre placeId*/
            if($place && $place!="") {
                $codeCompta = "[" . $place . "]";
            }
            else $codeCompta = "[no]";           
        }
        
        /*PAIEMENT PAR CARTE -> COMPTE DOTPAY*/
        if($onlinePaymentMeans == "dotpay") {
            $infos = $params['infos'];
            $parametres = [
                "api_version"  => "dev",
                "id" => $paymentConfig["data"]["nativePMConfig"]["dotpay_id"],
                "amount" => number_format($params['montant'],2),
                "currency" => "PLN",
                "lang" => $params['lang']->getLocale(),
                "description" => $codeCompta . "|" . $idInscription . "|" . $prenom . "|" . $nom,
                "URL" => "http://www.chemin-neuf.pl",
                "type" => "3",
                "firstname" => $prenom,
                "lastname" => $nom,
                "email" => $email,
                "street" => $infos["address"],
                "country" => "PL",
                "city" => $infos["city"],
                "postcode" => $infos["cp"],
                "phone" => $infos["tel1"] ? $infos["tel1"] : $infos["tel2"]
            ];
            /*SECURITY : HASH CHAIN*/
            $chk=$paymentConfig["data"]["nativePMConfig"]["dotpay_pin"]
                    .$parametres["api_version"]
                    .$parametres["lang"]
                    .$parametres["id"]
                    .$parametres["amount"]
                    .$parametres["currency"]
                    .$parametres["description"]
                    .$parametres["URL"]
                    .$parametres["type"]
                    .$parametres["firstname"]
                    .$parametres["lastname"]
                    .$parametres["email"]
                    .$parametres["street"]
                    .$parametres["city"]
                    .$parametres["postcode"]
                    .$parametres["phone"]
                    .$parametres["country"];
            $parametres["chk"] = hash('sha256',$chk);
        }
        
        /*PAIEMENT PAR CARTE -> COMPTE PAYBOX*/
        else {
            // récupérer l'id du compte de paiement
            $id = $paymentConfig["data"]["nativePMConfig"]["paybox"];
            switch ($paymentType) {
                
                case "paf":                
                    // récupérer les infos du compte
                    $paymentInfos = $this->getPaymentInfos($id);
                    
                    
                    $commande = $codeCompta . "|" . $idInscription . "|" . urlencode(urlencode($proposition)) . "|" . urlencode(urlencode($prenom)) . "|" . urlencode(urlencode($nom)); 
                    $urlCallback="http://" . $_SERVER['HTTP_HOST'] . "/api/v1/PayboxIpn/";
                    break;
            
            
            
             /*DONS */           
                case "dons":
                    

                // récupérer les infos du compte
                    $paymentInfos = $this->getPaymentInfos($id);
                    
                    $commande = $codeCompta . "|" . $idInscription . "|" . urlencode(urlencode($prenom)) . "|" . urlencode(urlencode($nom)); 
                    $urlCallback="http://" . $_SERVER['HTTP_HOST'] . "/api/v1/donation/";
                    break;
                default:
                    $parametres = "Pas de mode de paiement indiqué";
            }            
            $dateTime = date("c");
            $urlNormal="http://" . $_SERVER['HTTP_HOST'] ;//. "/payment/success";
            $urlEchec="http://" . $_SERVER['HTTP_HOST'] ;//. "/payment/cancel";
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
                "payboxRetour" => "referencePaybox:S;montant:M;commande:R;autorisation:A;pays:I;erreur:E;signature:K",
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
    

     
} 
