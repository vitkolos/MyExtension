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
class BotResource extends AbstractResource
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
            ->setName('Bot')
            ->setDescription('Deal with taxonomy')
            ->editVerb('get', function (VerbDefinitionEntity &$entity) {
                $entity
                    ->setDescription('Get taxonomy terms')
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('query')
                            ->setRequired()
                            ->setDescription('Taxonomy vocabularies to use')
                    )
                    ->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setKey('answer')
                            ->setDescription('Taxonomy terms array for selected vocabularies')
                    );
            });
    }
    /**
     * Get from /taxonomy
     *
     * @param $params
     * @return array
     */
    public function getAction($params)
    {
        var_dump($params);
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_URL, "http://10.66.50.200:5000/parse?q=" . $params['query']);
    
        curl_setopt($curl, CURLOPT_POST, 1);
        curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); // On dev server only!
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);  // Follow the redirects (needed for mod_rewrite)
        $result = curl_exec($curl);
        curl_close($curl);

        var_dump($result);
        return [
            'success' => true,
            'answer' => $result,
        ];
    }
}
