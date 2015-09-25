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



use Rubedo\Interfaces\Collection\IAbstractCollection;

class MusculinepaymentResource extends AbstractResource {


    
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


    // Prepare query string
    $query_string = http_build_query($query);

    //authentification
    $response = $this->getAuthAPIService()->APIAuth('musculine', 'Musc2015');
    $output['token'] = $this->subTokenFilter($response['token']);
    $route['access_token'] = $output['token']['access_token'];

    //create order
    $data = $params['content'];
    //$data["fields"]["commande"] = $params['products'];
    $payload = json_encode( array( "content" => $data ) );

    $curl = curl_init();
    // Set some options - we are passing in a useragent too here
    curl_setopt_array($curl, array(
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_URL =>'http://' . $_SERVER['HTTP_HOST'] . '/api/v1/contents?access_token='.$route['access_token'].'&lang=fr',
        CURLOPT_POST => 1
    ));
    curl_setopt($curly, CURLOPT_FOLLOWLOCATION, true);  // Follow the redirects (needed for mod_rewrite)
    curl_setopt($curly, CURLOPT_FRESH_CONNECT, true);   // Always ensure the connection is fresh
    curl_setopt( $curl, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
    curl_setopt($curl, CURLOPT_POSTFIELDS, $payload );
    // Close request to clear up some resources
    curl_close($curl);
    
    
    return array(
            'success' => true,
            'url' =>'https://www.sandbox.paypal.com/cgi-bin/webscr?' . $query_string
        );

    }
    protected function subTokenFilter(&$token)
    {
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
