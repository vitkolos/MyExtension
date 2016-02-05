<?php
/**
 * Rubedo -- ECM solution
 * Copyright (c) 2014, WebTales (http://www.webtales.fr/).
 * All rights reserved.
 * licensing@webtales.fr
 *
 * Open Source License
 * ------------------------------------------------------------------------------------------
 * Rubedo is licensed under the terms of the Open Source GPL 3.0 license.
 *
 * @category   Rubedo
 * @package    Rubedo
 * @copyright  Copyright (c) 2012-2014 WebTales (http://www.webtales.fr)
 * @license    http://www.gnu.org/licenses/gpl.html Open Source GPL 3.0 license
 */
namespace RubedoAPI\Rest\V1;
use Rubedo\Collection\AbstractLocalizableCollection;
use Rubedo\Services\Manager;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use RubedoAPI\Exceptions\APIAuthException;
use RubedoAPI\Exceptions\APIEntityException;
use RubedoAPI\Exceptions\APIRequestException;
use WebTales\MongoFilters\Filter;
use Rubedo\Content\Context;
/**
 * Class ContentsResource
 * @package RubedoAPI\Rest\V1
 */
class AcnproductResource extends AbstractResource
{
    /**
     * Cache lifetime for api cache (only for get and getEntity)
     * @var int
     */
    public $cacheLifeTime=60;
    /**
     * @var array
     */
    protected $toExtractFromFields = array('text');
    /**
     * @var array
     */
    protected $otherLocalizableFields = array('text', 'summary');
    /**
     * @var array
     */
    protected $returnedEntityFields = array(
        'id',
        'text',
        'version',
        'createUser',
        'lastUpdateUser',
        'fields',
        'taxonomy',
        'status',
        'pageId',
        'maskId',
        'locale',
        'readOnly',
        'createTime',
        'lastUpdateTime',
        'isProduct',
        'productProperties'
    );
    /**
     * { @inheritdoc }
     */
    public function __construct()
    {
        parent::__construct();
        $this->define();
    }
     /**
     * Remove fields if not in content type
     *
     * @param $type
     * @param $fields
     */
    protected function filterFields($type, $fields)
    {
        $existingFields = array();
        foreach ($type['fields'] as $field) {
            if (!($field['config']['localizable'] || in_array($field['config']['name'], $this->otherLocalizableFields))) {
                $existingFields[] = $field['config']['name'];
            }
        }
        foreach ($fields as $key => $value) {
            unset($value); //unused
            if (!in_array($key, $existingFields)) {
                unset ($fields[$key]);
            }
        }
        return $fields;
    }
    /**
     * Return localizable fields if not in content type
     *
     * @param $type
     * @param $fields
     */
    protected function localizableFields($type, $fields)
    {
        $existingFields = array();
        foreach ($type['fields'] as $field) {
            if ($field['config']['localizable']) {
                $existingFields[] = $field['config']['name'];
            }
        }
        foreach ($fields as $key => $value) {
            unset($value); //unused
            if (!(in_array($key, $existingFields) || in_array($key, $this->otherLocalizableFields))) {
                unset ($fields[$key]);
            }
        }
        return $fields;
    }
    /**
     * Filter contents
     *
     * @param $contents
     * @param $params
     * @return mixed
     */
    protected function outputContentsMask($contents, $params, $query)
    {
        $fields = isset($params['fields']) ? $params['fields'] : array('text', 'summary', 'image');
        $queryReturnedFields = !empty($query["returnedFields"]) && is_array($query["returnedFields"]) ? $query["returnedFields"] : array();
        $fields = array_merge($fields, $queryReturnedFields);
        $urlService = $this->getUrlAPIService();
        if (isset($params['pageId'],$params['siteId'])){
            $page = $this->getPagesCollection()->findById($params['pageId']);
            $site = $this->getSitesCollection()->findById($params['siteId']);
        }
        $mask = array('isProduct', 'i18n', 'pageId', 'blockId', 'maskId');
        foreach ($contents as &$content) {
            $content['fields'] = array_intersect_key($content['fields'], array_flip($fields));
            if (isset($params['pageId'],$params['siteId'])) {
                $content['detailPageUrl'] = $urlService->displayUrlApi($content, 'default', $site,
                    $page, $params['lang']->getLocale(), isset($params['detailPageId']) ? (string)$params['detailPageId'] : null);
            }
            $content = array_diff_key($content, array_flip($mask));
        }
        return $contents;
    }
    /**
     * Get content list
     *
     * @param $filters
     * @param $pageData
     * @param bool $ismagic
     * @return array
     * @throws \RubedoAPI\Exceptions\APIEntityException
     */
    protected function getContentList($filters, $pageData, $ismagic = false)
    {
        $filters["sort"] = isset($filters["sort"]) ? $filters["sort"] : array();
        $contentArray = $this->getContentsCollection()->getOnlineList($filters["filter"], $filters["sort"], $pageData['start'], $pageData['limit'], $ismagic);
        $contentArray['page'] = $pageData;
        if ($contentArray['count'] < $pageData['start']) {
            throw new APIEntityException('There is only ' . $contentArray['count'] . ' contents. Start parameter must be inferior of this value', 404);
        }
        return $contentArray;
    }
    /**
     * Set pagination value
     *
     * @param $params
     * @return mixed
     * @throws \RubedoAPI\Exceptions\APIEntityException
     */
    protected function setPaginationValues($params)
    {
        $defaultLimit = isset($params['limit']) ? $params['limit'] : 6;
        $defaultStart = isset($params['start']) ? $params['start'] : 0;
        if ($defaultStart < 0) {
            throw new APIEntityException('Start paramater must be >= 0', 404);
        }
        if ($defaultLimit < 1) {
            throw new APIEntityException('Limit paramater must be >= 1', 404);
        }
        $pageData['start'] = $defaultStart;
        $pageData['limit'] = $defaultLimit;
        return $pageData;
    }

    /**
     * Get to acnproduct/{id}
     *
     * @param $id
     * @param $params
     * @return array
     * @throws \RubedoAPI\Exceptions\APIEntityException
     * @throws \RubedoAPI\Exceptions\APIRequestException
     */
    public function getEntityAction($id, $params)
    {
        $getLive=true;
        if (isset($params['useDraftMode'])){
            $getLive=false;
        }
        //$content = $this->getContentsCollection()->findById($id, $getLive, false);
        $content = $this->getContentsCollection()->find({ 'productProperties.sku': $id });
        if (empty($content)) {
            throw new APIEntityException('Content not found', 404);
        }
        $contentType = $this->getContentTypesCollection()->findById($content['typeId'], true, false);
        if (empty($contentType)) {
            throw new APIEntityException('ContentType not found', 404);
        }
        if (isset($params['fingerprint'])) {
            $currentTime = $this->getCurrentTimeService()->getCurrentTime();
            //get user fingerprint
            $this->getContentViewLogCollection()->log($content['id'], $content['locale'], $params['fingerprint'], $currentTime);
            //rebuild user recommendations if necessary
            $emptyFilter = Filter::factory();
            $oldestView = $this->getContentViewLogCollection()->findOne($emptyFilter);
            if ($oldestView) {
                $timeSinceLastRun = $currentTime - $oldestView['timestamp'];
                if ($timeSinceLastRun > 60) {
                    $curlUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/queue?service=UserRecommendations&class=build';
                    $curly = curl_init();
                    curl_setopt($curly, CURLOPT_URL, $curlUrl);
                    curl_setopt($curly, CURLOPT_FOLLOWLOCATION, true);  // Follow the redirects (needed for mod_rewrite)
                    curl_setopt($curly, CURLOPT_HEADER, false);         // Don't retrieve headers
                    curl_setopt($curly, CURLOPT_NOBODY, true);          // Don't retrieve the body
                    curl_setopt($curly, CURLOPT_RETURNTRANSFER, true);  // Return from curl_exec rather than echoing
                    curl_setopt($curly, CURLOPT_FRESH_CONNECT, true);   // Always ensure the connection is fresh
                    // Timeout super fast once connected, so it goes into async.
                    curl_setopt($curly, CURLOPT_TIMEOUT, 1);
                    curl_exec($curly);
                }
            }
        }
        if (isset($content['isProduct'])&&$content['isProduct']&&isset($content["productProperties"]["variations"])&&is_array($content["productProperties"]["variations"])){
            $userTypeId = "*";
            $country = "*";
            $region = "*";
            $postalCode = "*";
            $currentUser = $this->getCurrentUserAPIService()->getCurrentUser();
            if ($currentUser) {
                $userTypeId = $currentUser['typeId'];
                if (isset($currentUser['shippingAddress']['country']) && !empty($currentUser['shippingAddress']['country'])) {
                    $country = $currentUser['shippingAddress']['country'];
                }
                if (isset($currentUser['shippingAddress']['regionState']) && !empty($currentUser['shippingAddress']['regionState'])) {
                    $region = $currentUser['shippingAddress']['regionState'];
                }
                if (isset($currentUser['shippingAddress']['postCode']) && !empty($currentUser['shippingAddress']['postCode'])) {
                    $postalCode = $currentUser['shippingAddress']['postCode'];
                }
            }
            foreach ($content["productProperties"]["variations"] as &$variation){
                $variation["price"]=$this->getTaxesCollection()->getTaxValue($content['typeId'], $userTypeId, $country, $region, $postalCode, $variation["price"]);
                if (isset($variation["specialOffers"])&&is_array($variation["specialOffers"])){
                    foreach ($variation["specialOffers"] as &$specialOffer){
                        $specialOffer["price"]=$this->getTaxesCollection()->getTaxValue($content['typeId'], $userTypeId, $country, $region, $postalCode, $specialOffer["price"]);
                    }
                }
            }
        }
        $content = array_intersect_key(
            $content,
            array_flip(
                $this->returnedEntityFields
            )
        );
        if (isset($params['fields'])) {
            if (!is_array($params['fields']))
                throw new APIRequestException('"fields" must be an array', 400);
            $content['fields'] = array_intersect_key($content['fields'], array_flip($params['fields']));
        }
        if (isset($params['pageId']) && isset($params['siteId'])) {
            $page = $this->getPagesCollection()->findById($params['pageId']);
            $site = $this->getSitesCollection()->findById($params['siteId']);
            $content['canonicalUrl'] = $this->getUrlAPIService()->displayUrlApi($content, 'canonical', $site,
                $page, $params['lang']->getLocale(), null);
        }
        if (isset($params["includeTermLabels"],$content["taxonomy"])&&is_array($content["taxonomy"])){
            $content["termLabels"]=[];
            $termCollection=Manager::getService("TaxonomyTerms");
            foreach($content["taxonomy"] as $taxoId=>$taxoValue){
                if(is_array($taxoValue)){
                    foreach($taxoValue as $termId){
                        if(!empty($termId)&&$termId!=""){
                            $foundTerm=$termCollection->findById($termId);
                            if($foundTerm){
                                $content["termLabels"][$foundTerm["id"]]=$foundTerm["text"];
                            }
                        }
                    }
                } elseif(!empty($taxoValue)&&$taxoValue!=""){
                    $foundTerm=$termCollection->findById($taxoValue);
                    if($foundTerm){
                        $content["termLabels"][$foundTerm["id"]]=$foundTerm["text"];
                    }
                }
            }
        }
        $content['type'] = array_intersect_key(
            $contentType,
            array_flip(
                array(
                    'id',
                    'code',
                    'activateDisqus',
                    'layouts',
                    'fields',
                    'locale',
                    'version',
                    'workflow',
                    'readOnly',
                    'manageStock'
                )
            )
        );
        //Filter layouts
        $layouts = [];
        if (isset($content['type']['layouts'])&&is_array($content['type']['layouts'])) {
            foreach ($content['type']['layouts'] as $key => $value) {
                if (isset($params['siteId'])) {
                    if($value['site'] == $params['siteId'] && $value['active']) {
                        $layouts[] = $content['type']['layouts'][$key];
                    }
                } elseif($value['active']) {
                    $layouts[] = $content['type']['layouts'][$key];
                }
            }
        }
        $content['type']['layouts'] = $layouts;
        return [
            'success' => true,
            'content' => $content,
        ];
    }
    /**
     * Define the resource
     */
    protected function define()
    {

        $this
            ->entityDefinition
            ->setName('Acn product')
            ->setDescription('Works on single product')
            ->editVerb('get', function (VerbDefinitionEntity &$definition) {
                $this->defineEntityGet($definition);
            });
    }

    /**
     * Define get entity
     *
     * @param VerbDefinitionEntity $definition
     */
    protected function defineEntityGet(VerbDefinitionEntity &$definition)
    {
        $definition
            ->setDescription('Get a content')
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('Fields to return')
                    ->setKey('fields')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('siteId')
                    ->setDescription('Id of the site')
                    ->setFilter('\\MongoId')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('pageId')
                    ->setDescription('Id of the page')
                    ->setFilter('\\MongoId')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('useDraftMode')
                    ->setDescription('Set to true to preview draft contents')
            )
            ->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('fingerprint')
                    ->setDescription('Fingerprint')
            )->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('includeTermLabels')
                    ->setDescription('Include labels for taxonomy terms')
            )
            ->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('The content')
                    ->setKey('content')
                    ->setRequired()
            );
    }    /**
     * Add product filter
     *
     * @return $this
     */
    protected function productFilter()
    {
        return Filter::factory('Or')
            ->addFilter(Filter::factory('OperatorToValue')->setName('isProduct')->setOperator('$exists')->setValue(false))
            ->addFilter(Filter::factory('Value')->setName('isProduct')->setValue(false));
    }
}