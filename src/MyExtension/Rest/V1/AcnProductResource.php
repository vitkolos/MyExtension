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
use Rubedo\Collection\AbstractCollection;
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
        $this->define();
    }
    
     /**
     * Get from /taxonomy
     *
     * @param $params
     * @return array
     */
    public function getAction($params)
    {
	    $contentsService = Manager::getService('Contents');
		if(!isset($params["orders"])) {//retourner les propriétés du produit
			
	
			$codeBarre=$params['codeBarre'];

			//filter on products
			$productFilter = Filter::factory('Value')->setName('isProduct')->setValue(true);
			//filter on product sku or variations sku
			$codeBarreFilter = Filter::Factory('Or')->addFilter(Filter::factory('Value')->setName('productProperties.sku')->setValue($codeBarre))
								->addFilter(Filter::factory('Value')->setName('productProperties.variations.0.sku')->setValue($codeBarre))
								->addFilter(Filter::factory('Value')->setName('productProperties.variations.1.sku')->setValue($codeBarre))
								->addFilter(Filter::factory('Value')->setName('productProperties.variations.2.sku')->setValue($codeBarre))
								->addFilter(Filter::factory('Value')->setName('productProperties.variations.3.sku')->setValue($codeBarre))
								->addFilter(Filter::factory('Value')->setName('productProperties.variations.4.sku')->setValue($codeBarre))
								->addFilter(Filter::factory('Value')->setName('productProperties.variations.5.sku')->setValue($codeBarre))
								->addFilter(Filter::factory('Value')->setName('productProperties.variations.6.sku')->setValue($codeBarre))
								->addFilter(Filter::factory('Value')->setName('productProperties.variations.7.sku')->setValue($codeBarre));

			$findFilter = Filter::Factory('And')->addFilter($productFilter)->addFilter($codeBarreFilter);
			$content = $contentsService->findOne($findFilter,true,false);
			
		}
		else {//retourner la liste des dernières commandes
			$filter = Filter::factory()
				->addFilter(Filter::factory('OperatorTovalue')->setName('orderNumber')->setOperator('$gte')->setValue($params["codeBarre"]));
            $content = $this->getOrdersCollection()->getList($filter, array(array('property' => 'createTime', 'direction' => 'desc')),0,null);
			foreach($content['data'] as &$order) {
                $user = $this->getUsersCollection()->findById($order['userId']);
				foreach($order['detailedCart']['cart'] as &$product) {
                    $productDetail = $contentsService->findById($product['productId'], true, false);
					$product['sku'] = $productDetail['productProperties']['sku'];
					foreach($productDetail['productProperties']['variations'] as $variation) {
                        if($variation['id']==$product['variationId']) $product['variationSKU']=$variation['sku'];
					}
				}
                $order['billingAddress']['tel1'] = $user['fields']['tel1'];
			}
		}
        
        
        return [
            'success' => true,
            'content' => $content,
        ];
    }
 
    public function postAction($params)
    {
								//change product stock
								if(!isset($params["status"])) {
												$contentsService = Manager::getService('ContentsCcn');
				
												$codeBarre=$params['codeBarre'];
															//filter on products
												$productFilter = Filter::factory('Value')->setName('isProduct')->setValue(true);
												//filter on product sku or variations sku
												$codeBarreFilter = Filter::Factory('Or')->addFilter(Filter::factory('Value')->setName('productProperties.sku')->setValue($codeBarre))
																->addFilter(Filter::factory('Value')->setName('productProperties.variations.0.sku')->setValue($codeBarre))
																->addFilter(Filter::factory('Value')->setName('productProperties.variations.1.sku')->setValue($codeBarre))
																->addFilter(Filter::factory('Value')->setName('productProperties.variations.2.sku')->setValue($codeBarre))
																->addFilter(Filter::factory('Value')->setName('productProperties.variations.3.sku')->setValue($codeBarre))
																->addFilter(Filter::factory('Value')->setName('productProperties.variations.4.sku')->setValue($codeBarre))
																->addFilter(Filter::factory('Value')->setName('productProperties.variations.5.sku')->setValue($codeBarre))
																->addFilter(Filter::factory('Value')->setName('productProperties.variations.6.sku')->setValue($codeBarre))
																->addFilter(Filter::factory('Value')->setName('productProperties.variations.7.sku')->setValue($codeBarre));
				
												$findFilter = Filter::Factory('And')->addFilter($productFilter)->addFilter($codeBarreFilter);
												$content = $contentsService->findOne($findFilter,true,false);
												foreach($content['productProperties']['variations'] as &$variation) {
																if($variation['sku']==$codeBarre) $variation['stock'] = $params['stock'] ?  $params['stock'] : 0;
												}
												AbstractCollection::disableUserFilter(true);
				
												$result = $contentsService->update($content, array(),false);
												AbstractCollection::disableUserFilter(false);
								}
								// change order status
								else {
												$filters = Filter::factory()
                ->addFilter(Filter::factory('Uid')->setValue($params['codeBarre']));
            $order = $this->getOrdersCollection()->findOne($filters);
												if(isset($params['status'])) $order["status"] = $params['status'];
												$content = $this->getOrdersCollection()->update($order);
								}
        return [
            'success' => true,
            'content' => $content,
        ];
    }
   
    
    
    protected function define()
    {
        $this
            ->definition
            ->setName('Products ACN')
            ->setDescription('Link with Zachee - ACN')
            ->editVerb('get', function (VerbDefinitionEntity &$entity) {
                $this->defineGet($entity);
            })
            ->editVerb('post', function (VerbDefinitionEntity &$entity) {
                $this->definePost($entity);
            });

    }
    /**
     * Define get action
     *
     * @param VerbDefinitionEntity $definition
     */
    protected function defineGet(VerbDefinitionEntity &$entity)
    {
        $entity
            ->setDescription('Get produit de la boutique par code barre ou liste des commandes')
            ->addInputFilter(
		    (new FilterDefinitionEntity())
			->setKey('codeBarre')
			->setRequired()
			->setDescription('Code barre / sku')
		)
		->addInputFilter(
		    (new FilterDefinitionEntity())
			->setKey('orders')
			->setDescription('Bool vrai pour avoir la liste des commandes')
		)
	    ->addOutputFilter(
		    (new FilterDefinitionEntity())
			->setKey('content')
			->setDescription('Produit de la boutique')
		);
    }
    
    protected function definePost(VerbDefinitionEntity &$entity)
    {
        $entity
	    ->setDescription('Patch product stock / change order status')
            ->addInputFilter(
                (new FilterDefinitionEntity())
                ->setDescription('Code barre  / orderID')
                ->setKey('codeBarre')
																->setRequired()
            )
	    ->addInputFilter(
                (new FilterDefinitionEntity())
                ->setDescription('Nouveau stock du produit')
                ->setKey('stock')
																->setFilter('int')
            )
					->addInputFilter(
                (new FilterDefinitionEntity())
                ->setDescription('Nouveau statut de commande')
                ->setKey('status')
            )
            ->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setDescription('Nouvelle version du produit')
                    ->setKey('content')
                    ->setRequired()
            );
    }


}
