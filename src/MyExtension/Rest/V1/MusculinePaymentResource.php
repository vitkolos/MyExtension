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
                    /*->addInputFilter(
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
                            ->setDescription('idInscription')
                            ->setKey('idInscription')
                            ->setFilter('string')
                            
                    )
                    ->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Parametres pour bouton Paybox')
                            ->setKey('parametres')
                    )*/
                    ;
            });
    }
    public function postAction($params) {

 
  $query = array();
      $query['currency_code'] = 'EUR';
      $query['lc'] = 'FR';
    $query['shipping_1'] = '5';
    $query['shipping2_1'] = '0';
    $query['shipping_2'] = '0';
    $query['shipping2_2'] = '0';
    $query['return'] = 'http://musculine.fr';

    $query['notify_url'] = 'http://jackeyes.com/ipn';
    $query['cmd'] = '_cart';
    $query['upload'] = '1';
    $query['business'] ='ccn.ateliers.dombes-facilitator@wanadoo.fr';
    $query['address_override'] = '1';/*
    $query['first_name'] = $first_name;
    $query['last_name'] = $last_name;
    $query['email'] = $email;
    $query['address1'] = $ship_to_address;
    $query['city'] = $ship_to_city;
    $query['state'] = $ship_to_state;
    $query['zip'] = $ship_to_zip;*/
    $query['item_name_1'] ="Musculine 250g traditionnelle" ;
    $query['quantity_1'] =1;
    $query['amount_1'] = 10;
    $query['item_name_2'] = "Musculine 250g orange" ;
    $query['quantity_2'] = 2;
    $query['amount_2'] = 20;
        $query['email'] = "nicolas.rhone@gmail.com";


    // Prepare query string
    $query_string = http_build_query($query);

    header('Location: https://www.paypal.com/cgi-bin/webscr?' . $query_string);
    exit;
            /*return array(
            'success' => true,
            'parametres' => $query_string
        );*/

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
