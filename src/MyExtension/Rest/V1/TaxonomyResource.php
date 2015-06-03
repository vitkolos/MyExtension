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

use Rubedo\Services\Manager;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use Zend\Json\Json;


/**
 * Class SearchResource
 * @package RubedoAPI\Rest\V1
 */
class TaxonomyResource extends AbstractResource
{

    /**
     * @var string
     */
    protected $searchOption;
    /**
     * @var array
     */
    protected $searchParamsArray;

    /**
     * {@inheritdoc}
     */
    public function __construct()
    {
        parent::__construct();
        $this->searchOption = 'all';
        $this->searchParamsArray = array('orderby', 'orderbyDirection', 'query', 'objectType', 'type', 'damType', 'userType', 'author',
            'userName', 'lastupdatetime', 'start', 'limit', 'searchMode');
        $this
            ->definition
            ->setName('Search')
            ->setDescription('Search with ElasticSearch')
            ->editVerb('get', function (VerbDefinitionEntity &$entity) {
                $entity
                    ->setDescription('Get a list of media using Elastic Search')
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('siteId')
                            ->setDescription('Id of the site')
                            ->setFilter('\\MongoId')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('pageId')
                            ->setRequired()
                            ->setDescription('Id of the page')
                            ->setFilter('\\MongoId')
                    )
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('type')
                            ->setDescription('Content Type array')
                    )
                     ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('taxonomies')
                            ->setDescription('Content Type array')
                    )
                    ->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('results')
                            ->setDescription('List of result return by the research')
                    );
            });
    }

    /**
     * Get action
     * @param $queryParams
     * @return array
     */
    public function getAction($queryParams)
    {
        $params = $this->initParams($queryParams);
        
        $taxonomyService = Manager::getService('Taxonomy');
        $taxonomies=[];
        foreach($params['contentId'] as $paramId ) {
            $newTaxonomies=$taxonomyService->findByContentTypeID($paramId);
            foreach($newTaxonomies as $label => $newTaxonomy) {
                $taxonomies[$newTaxonomy["id"]]=$newTaxonomy;
                $taxonomies[$newTaxonomy["id"]]["label"]=$label;
            }
        }

        return [
            'success' => true,
            'results' => $taxonomies
        ];

    }
    
    /*
    $params = "contentId":["5517c04245205ec708869bc6"]
    */

    /**
     * init params
     *
     * @param $queryParams
     * @return array
     */
    protected function initParams($queryParams)
    {
        $blockConfigArray = array('displayMode', 'displayedFacets');

        foreach ($queryParams as $keyQueryParams => $param) {
            if ($keyQueryParams == 'taxonomies') {
                $taxonomies = JSON::decode($param, Json::TYPE_ARRAY);
                $params=$taxonomies;
            }
        }
        return $params;
    }

    /**
     * Parse predefined facets
     *
     * @param $params
     * @param $queryParams
     */
    protected function parsePrefedinedFacets(&$params, $queryParams)
    {
        $predefParamsArray = Json::decode($queryParams['predefinedFacets'], Json::TYPE_ARRAY);
        if (is_array($predefParamsArray)) {
            if (isset($predefParamsArray['query']) && isset($queryParams['query']) && $predefParamsArray['query'] != $queryParams['query']) {
                $inter = $predefParamsArray['query'] . ' ' . $queryParams['query'];
                $predefParamsArray['query'] = $inter;
                $queryParams['query'] = $inter;
            }
            foreach ($predefParamsArray as $key => $value) {
                $params[$key] = $value;
            }
        }
    }

 }