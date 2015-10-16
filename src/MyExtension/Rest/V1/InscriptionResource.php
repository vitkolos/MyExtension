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

class InscriptionResource extends AbstractResource {


    
    public function __construct()
    {
        parent::__construct();
        $this
            ->definition
            ->setName('Inscription')
            ->setDescription('Service d\'inscription')
            ->editVerb('post', function (VerbDefinitionEntity &$verbDefinitionEntity) {
                $verbDefinitionEntity
                    ->setDescription('Get résultats du formulaire d\'inscription')
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Inscription')
                            ->setKey('inscription')                            
                    )
                     ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('workspace')
                            ->setRequired()
                            ->setDescription('Workspace')
                    )
                    ->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Résultat de l\'inscription')
                            ->setKey('result')
                    )
                    ;
            });
    }
    public function postAction($params) {

    
    $query = array();
    // Prepare query string
    $query_string = http_build_query($query);

    //authentification
    //$response = $this->getAuthAPIService()->APIAuth('musculine', 'Musc2015');
    $response = $this->getAuthAPIService()->APIAuth('admin_inscriptions', '2qs5F7jHf8KD');
    $output['token'] = $this->subTokenFilter($response['token']);
    $route['access_token'] = $output['token']['access_token'];

    //create order
    $data["fields"] = $params['inscription'];
    $data["writeWorkspace"] = $params['workspace'];
    $data["typeId"] = "561627c945205e41208b4581";
    $data["fields"]["text"] = "FR"+$this->getInscriptionId();
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
    curl_setopt($curl, CURLOPT_ENCODING, 'windows-1252');
    $result = curl_exec($curl);
// Close request to clear up some resources
    curl_close($curl);
    
    
    return array(
            'result' =>  $this->getInscriptionId(),
            'success' => true,
            'message' => $result
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
    public function getInscriptionId(){
        $id="558d586c45205ee07cc1fd3c";
        $contentId = (string)$id;

        $this->_dataService = Manager::getService('MongoDataAccess');
        $this->_dataService->init("Contents");
        $content = $this->_dataService->findById($contentId);

        return $content['live']['fields']['value'];
    }
} 
