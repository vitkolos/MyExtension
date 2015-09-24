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


class MusculinepaymentResource extends AbstractResource {
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
    
    
    /*quantités et prix des produits*/
    $counter = 1;
    $poids = 0;
    foreach ($params['products'] as $sku => $product) {
        if($product["quantite"]>0){
            $query['item_name_'.$counter] = $product["titre"] ;
            $query['quantity_'.$counter] =$product["quantite"];
            $query['amount_'.$counter] = round($product["prix"],2);
            $poids+= $product["quantite"] * $product["poids"];
            $counter++;
        };

    };
    
    /*frais d'expédition*/
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
    /*infos de facturation*/


        
    $query['shipping_1'] = $fraisExp;
    $query['return'] = 'http://musculine.fr';

    $query['notify_url'] = 'http://jackeyes.com/ipn';
    $query['cmd'] = '_cart';
    $query['upload'] = '1';
    $query['business'] ='ccn.ateliers.dombes-facilitator@wanadoo.fr';
    $query['address_override'] = '1';
    $query['first_name'] = $params['facturation']['surname'];
    $query['last_name'] =$params['facturation']['name'];
    $query['email'] =$params['facturation']['email'];
    $query['address1'] = $params['facturation']['address'];
    $query['city'] = $params['facturation']['city'];
    /*$query['state'] = $params['facturation']['state'];*/
    $query['zip'] = $params['facturation']['cp'];
    if($params['facturation']['telephone'][0] == 0) {
        $query['night_phone_b'] = substr($params['facturation']['telephone'],1);
    }
    else {
        $query['night_phone_b'] = $params['facturation']['telephone'];
    }
    $query['email'] = "nicolas.rhone@gmail.com";


    // Prepare query string
    $query_string = http_build_query($query);
    
    
    
    return array(
            'success' => true,
            'url' => 'https://www.sandbox.paypal.com/cgi-bin/webscr?' . $query_string
        );

    }
 
 
 
 
    protected function registerCommand($content)
    {
        AbstractLocalizableCollection::setIncludeI18n(true);
        $data = &$params['content'];
        if (empty($data['typeId'])) {
            throw new APIEntityException('typeId data is missing.', 400);
        }
        $type = $this->getContentTypesCollection()->findById($data['typeId']);
        if (empty($type)) {
            throw new APIEntityException('ContentType not found.', 404);
        }
        foreach ($data['fields'] as $fieldName => $fieldValue) {
            if (in_array($fieldName, $this->toExtractFromFields)) {
                $data[$fieldName] = $fieldValue;
            }
        }
        if (!isset($data['i18n'])) {
            $data['i18n'] = array();
        }
        if (!isset($data['i18n'][$params['lang']->getLocale()])) {
            $data['i18n'][$params['lang']->getLocale()] = array();
        }
        $data['i18n'][$params['lang']->getLocale()]['fields'] = $this->localizableFields($type, $data['fields']);
        $data['fields'] = $this->filterFields($type, $data['fields']);
        if (!isset($data['status'])) {
            $data['status'] = 'published';
        }
        if (!isset($data['target'])) {
            $data['target'] = array();
        }
        if (!isset($data['online'])) {
            $data['online'] = true;
        }
        if (!isset($data['startPublicationDate'])) {
            $data['startPublicationDate'] = "";
        }
        if (!isset($data['endPublicationDate'])) {
            $data['endPublicationDate'] = "";
        }
        if (!isset($data['nativeLanguage'])) {
            $data['nativeLanguage'] = $params['lang']->getLocale();
        }

 
        return $this->getContentsCollection()->create($data, array(), false);        
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
