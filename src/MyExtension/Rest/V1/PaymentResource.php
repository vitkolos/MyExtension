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
                            ->setDescription('Moyen de payement en ligne (paybox/dotpay/paypal)')
                            ->setKey('paymentMeans')
                            ->setFilter('string')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Identifiant de la config de payement (pour récupérer les infos de payement)')
                            ->setKey('paymentConfID')
                            ->setFilter('string')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Identifiant de l\'inscription ou du don')
                            ->setKey('idInscription')
                            ->setFilter('string')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Nom de la proposition ou du projet')
                            ->setKey('proposition')
                            ->setFilter('string')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('ID du lieu (pour compta)')
                            ->setKey('placeID')
                            ->setFilter('string')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Code monnaie Alpha pour paypal')
                            ->setKey('codeMonnaieAlpha')
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
        if(isset($params['placeID'])) $place = $params['placeID']; // lieu communautaire pour compta
        $onlinePaymentMeans=$params['paymentMeans'];  //moyen de payment en ligne du site : carte (=paybox), paypal, dotpay
        $codeCompta="";

        // Récupérer les infos de payement
      
        
        //get code comptabilité (par maison /pays)
        if($paymentType=="paf"){
            /*le paramètre placeId est l'id du lieu communautaire, dans lequel est stocké le code compta*/
            if(isset($place) && $place!="") {
                $wasFiltered = AbstractCollection::disableUserFilter(true);
                $lieuCommunautaire = Manager::getService("Contents")->findById($place,false,false);
                $codeCompta = "[" . $lieuCommunautaire["fields"]["codeCompta"] . "]";
            }
            else  {
                    //si le code compta du lieu n'est pas là, indiquer le code compta du site
                    $siteConfig = Manager::getService("SitesConfigCcn")->getConfig();
                    $codeCompta = "[" . $siteConfig['paymentConfig']['nativePMConfig']['code_ana'] . "]"; 
            }       
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
                "amount" => number_format($params['montant'],2,".",""),
                "currency" => "PLN",
                "lang" => $params['lang']->getLocale(),
                "description" => $codeCompta . "|" . $idInscription . "|" . $prenom . "|" . $nom . "|" . $proposition ,
                "URL" => "http://www.chemin-neuf.pl",
                "type" => "3",
                "URLC" => "http://" . $_SERVER['HTTP_HOST'] . "/api/v1/DotPayUrlc",
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
                    .$parametres["URLC"]
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
        
        
         /*PAIEMENT PAR PAYPAL */
        if($onlinePaymentMeans == "paypal") {
            // récupérer l'id de la configuration de payement
            $id = $params['paymentConfID'];
            // récupérer les infos du compte
            $wasFiltered = AbstractCollection::disableUserFilter(true);
            $contentsService = Manager::getService("Contents");
            $paymentInfos = $contentsService->findById($id,false,false)['fields'];
            $wasFiltered = AbstractCollection::disableUserFilter(false);
            $paypalAccount = $paymentInfos['paypal'];


            $query = array();
            $query['currency_code'] = $params['codeMonnaieAlpha']; //devise
            $query['lc'] = strtoupper($params['lang']->getLocale()); // langue
            $query['business'] = $paypalAccount; //compte Paypal
            $query['item_name'] = $params['proposition']; //nom du projet
            $query['item_number'] = $idInscription;//id du don
            $query['amount'] = $params['montant'];//montant du don
            $query['notify_url'] = "https://" . $_SERVER['HTTP_HOST']. "/api/v1/PaypalIpnCcn/"; // adresse de l'IPN ? 
            $query['cancel_return'] = "https://" . $_SERVER['HTTP_HOST']; // page d'annulation de commande
            $query['return'] = "https://" . $_SERVER['HTTP_HOST']; // page de confirmation et remerciement
            $query['cmd'] = "_xclick";
            //infos de la personne
            //$query['address_override'] = '1';
            $query['first_name'] = $prenom;
            $query['last_name'] =$nom;
            $query['email'] =$email;
            $query['address1'] = $params['facturation']['address'];
            //$query['city'] = $params['facturation']['city'];
            //$query['zip'] = $params['facturation']['cp'];
            /*if($params['facturation']['telephone'][0] == 0) {
                $query['night_phone_b'] = substr($params['facturation']['telephone'],1);
            }
            else {
                $query['night_phone_b'] = $params['facturation']['telephone'];
            }*/
            $query_string = http_build_query($query);
            $parametres = 'https://www.paypal.com/cgi-bin/webscr?' . $query_string;
        }
        /*PAIEMENT PAR CARTE -> COMPTE PAYBOX*/
        else {
            // récupérer l'id de la configuration de payement
            $id = $params['paymentConfID'];
            // récupérer les infos du compte
            $wasFiltered = AbstractCollection::disableUserFilter(true);
            $contentsService = Manager::getService("Contents");
            $paymentInfos = $contentsService->findById($id,false,false)['fields'];
            $wasFiltered = AbstractCollection::disableUserFilter(false);
            switch ($paymentType) {
                /*PAF*/
                case "paf":                
                    $commande = $codeCompta . "|" . $idInscription . "|" . urlencode(urlencode($proposition)) . "|" . urlencode(urlencode($prenom)) . "|" . urlencode(urlencode($nom)); 
                    $urlCallback="https://" . $_SERVER['HTTP_HOST'] . "/api/v1/PayboxIpn/";
                    break;
             /*DONS */           
                case "dons":                 
                    $commande = $codeCompta . "|" . $idInscription . "|" . urlencode(urlencode($prenom)) . "|" . urlencode(urlencode($nom)); 
                    $urlCallback="https://" . $_SERVER['HTTP_HOST'] . "/api/v1/donation/";
                    break;
                default:
                    $parametres = "Pas de mode de paiement indiqué";
            }            
            $dateTime = date("c");
            $urlNormal="https://" . $_SERVER['HTTP_HOST'] ;//. "/payment/success";
            $urlEchec="https://" . $_SERVER['HTTP_HOST'] ;//. "/payment/cancel";
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
    

    

     
} 
