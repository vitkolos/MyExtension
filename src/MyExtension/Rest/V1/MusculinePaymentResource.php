<?php
namespace MyExtension\Rest\V1;
use Rubedo\Collection\AbstractCollection;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use RubedoAPI\Rest\V1\AbstractResource;
use Zend\View\Model\JsonModel;
use Rubedo\Collection\AbstractLocalizableCollection;
use Rubedo\Services\Manager;
use WebTales\MongoFilters\Filter;
use Rubedo\Interfaces\Collection\IAbstractCollection;

class MusculinepaymentResource extends AbstractResource {

    public function __construct() {
        parent::__construct();
        $this
            ->definition
            ->setName('TestPaybox')
            ->setDescription('Test PayBox API')
            ->editVerb('post', function (VerbDefinitionEntity &$verbDefinitionEntity) {
                $verbDefinitionEntity
                    ->setDescription('Get info de paiement Paybox')
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Détails de la commande')
                            ->setKey('products')                            
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Adresse de facturation')
                            ->setKey('facturation')                            
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Contenu')
                            ->setKey('content')                            
                    )
                    ->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Paypal Url')
                            ->setKey('url')
                    )
                    ;
            });
    }

    public function postAction($params) {
        $query = array();
        $query['currency_code'] = 'EUR'; //devise
        $query['lc'] = 'FR'; // langue
        
        /*infos de facturation*/
        $query['return'] = 'http://www.musculine.fr';

        $query['notify_url'] = 'http://www.musculine.fr';
        $query['cmd'] = '_cart';
        $query['upload'] = '1';
        $query['business'] = 'magasin.henri4@chemin-neuf.org'; //'ateliers.dombes@chemin-neuf.org';
        $query['address_override'] = '1';
        $query['first_name'] = $params['facturation']['surname'];
        $query['last_name'] = $params['facturation']['name'];
        $query['email'] = $params['facturation']['email'];
        $query['address1'] = $params['facturation']['address'];
        $query['city'] = $params['facturation']['city'];
        $query['country'] = $params['facturation']['country'];
        //$query['tax_cart']= 55;
        /*$query['state'] = $params['facturation']['state'];*/
        $query['zip'] = $params['facturation']['cp'];
        if($params['facturation']['telephone'][0] == 0) {
            $query['night_phone_b'] = substr($params['facturation']['telephone'],1);
        }
        else {
            $query['night_phone_b'] = $params['facturation']['telephone'];
        }

        // === GESTION CODES PROMO ===
        $isPromo=false;
        if(isset($params['facturation']['codePromo'])) {
            $query['custom'] =$params['facturation']['codePromo'];
            $isPromo = false;
            $wasFiltered = AbstractCollection::disableUserFilter(true);
            $contentsService = Manager::getService("ContentsCcn");
            $codePromos = $contentsService->findById("58dd015024564055068b82c7",false,false)['fields'];
            foreach ($codePromos["multi"] as $codePromo){
                if($codePromo == $params['facturation']['codePromo']) {$isPromo=true; break;}
            }
            
            $wasFiltered = AbstractCollection::disableUserFilter(false);
        }
        
        // === quantités et prix des produits ===
        $counter = 1;
        $poids = 0;
        foreach ($params['products'] as $sku => $product) {
            if($product["quantite"]>0){
                $query['item_name_'.$counter] = $product["titre"] ;
                $query['quantity_'.$counter] =$product["quantite"];
                $query['amount_'.$counter] = round($product["prix"],2);
                $poids+= $product["quantite"] * $product["poids"];
                $query['tax_rate_'.$counter] = 5.5;
                if($isPromo) $query['discount_rate_'.$counter] = 10;
                $counter++;
            };
        };
    
        // === frais d'expédition ===
        $fraisExp = 0;
        if ($poids>0 AND $poids<=500) {
           $fraisExp = 6.13;
        }
        elseif ($poids>500 AND $poids<=750) {
            $fraisExp = 6.89;
        }
        elseif ($poids>750 AND $poids<=1000) {
            $fraisExp =7.51;
        }
        elseif ($poids>1000 AND $poids<=2000) {
            $fraisExp =8.50;
        }
        elseif ($poids>2000) {
            $fraisExp =10.93;
        }
        $query['shipping_1'] = $fraisExp;

        // === Prepare query string ===
        $query_string = http_build_query($query);

        $data = $params['content'];
        $data['online'] = false;
        $data['text'] = $data['fields']['text'];
        $data['nativeLanguage'] = $params['lang']->getLocale();
        $data['i18n'] =  array(
            $params['lang']->getLocale() => array(
                "fields" => array(
                    "text"=>$data['text'] 
                )
            )
        );
        $data['startPublicationDate'] = ""; $data['endPublicationDate'] = "";
        $data['online'] = false;
        $wasFiltered = AbstractCollection::disableUserFilter(true);
        $contentsService = Manager::getService("ContentsCcn");
        $resultcreate = $contentsService->create($data, array(),false);

        $wasFiltered = AbstractCollection::disableUserFilter(false);
     
        return array(
            'success' => true,
            'url' =>'https://www.paypal.com/cgi-bin/webscr?' . $query_string,
            'message' => $resultcreate['success']
        );

    }

    protected function subTokenFilter(&$token) {
        return array_intersect_key($token, array_flip(array('access_token', 'refresh_token', 'lifetime', 'createTime')));
    }
    
    public function getPaymentMeans($id){
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
