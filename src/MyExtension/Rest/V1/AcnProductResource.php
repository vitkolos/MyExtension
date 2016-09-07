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
use RubedoAPI\Exceptions\APIRequestException;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use WebTales\MongoFilters\Filter;
/**
 * Class TaxonomiesResource
 * @package RubedoAPI\Rest\V1
 */
class AcnproductResource extends AbstractResource
{
    /**
     * @var static
     */
    /**
     * Cache lifetime for api cache (only for get and getEntity)
     * @var int
     */
    public $cacheLifeTime=600;
    /**
     * { @inheritdoc }
     */
    public function __construct()
    {
        parent::__construct();
        $this
            ->definition
            ->setName('Products')
            ->setDescription('Deal with taxonomy')
            ->editVerb('get', function (VerbDefinitionEntity &$entity) {
                $entity
                    ->setDescription('Get produit de la boutique par code barre')
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('codeBarre')
                            ->setRequired()
                            ->setDescription('Code barre / sku')
                    )
		    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('stock')
                            ->setRequired()
                            ->setDescription('Stock dans Zachee')
                    )
                    ->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('content')
                            ->setDescription('Produit de la boutique')
                    );
            });
            $this->contentsService = Manager::getService('Contents');

    }
    /**
     * Get from /taxonomy
     *
     * @param $params
     * @return array
     */
    public function getAction($params)
    {
        $codeBarre=$params['codeBarre'];
        $findFilter = Filter::Factory();
        //
        Filter::factory('Value')->setName('typeId')->setValue("55c87ae245205e8019c62e08");       // type de contenus boutique
   	$findFilter->addFilter($filter);
        
        $filter = Filter::factory('Value')->setName('productProperties.sku')->setValue($codeBarre);
        $findFilter->addFilter($filter);	   

        $content = $this->contentsService->findOne($findFilter,true,false);

        
        
        return [
            'success' => true,
            'content' => $content,
        ];
    }
    


}
