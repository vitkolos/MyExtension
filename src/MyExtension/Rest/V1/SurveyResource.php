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

namespace MyExtension\Rest\V1;


use Rubedo\Services\Manager;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Exceptions\APIEntityException;
use RubedoAPI\Rest\V1\AbstractResource;


/**
 * Class RssResource
 * @package RubedoAPI\Rest\V1
 */
class SurveyResource extends AbstractResource
{

    /**
     * { @inheritdoc }
     */
    public function __construct()
    {
        parent::__construct();
        $this->define();
    }


    /**
     * Get a media type
     *
     * @param $id
     * @return array
     */
    public function getEntityAction($id,$params)
    {
        $survey=Manager::getService("Forms")->findById($id);
        if (empty($survey)) {
            throw new APIEntityException('Survey not found', 404);
        }
        $currentTime = $this->getCurrentTimeService()->getCurrentTime();
        if(isset($survey["openingDate"])&&$survey["openingDate"]&&$survey["openingDate"]!=""&&$currentTime< (int) $survey["openingDate"]){
            throw new APIEntityException('Survey not yet started', 400);
        }
        if(isset($survey["closingDate"])&&$survey["closingDate"]&&$survey["closingDate"]!=""&&$currentTime> (int) $survey["closingDate"]){
            throw new APIEntityException('Survey closed', 400);
        }
        return([
            "success"=>true,
            "survey"=>$survey
        ]);
    }

    public function postEntityAction($id,$params)
    {
        $survey=Manager::getService("Forms")->findById($id);
        if (empty($survey)) {
            throw new APIEntityException('Survey not found', 404);
        }
        $currentTime = $this->getCurrentTimeService()->getCurrentTime();
        if(isset($survey["openingDate"])&&$survey["openingDate"]&&$survey["openingDate"]!=""&&$currentTime< (int) $survey["openingDate"]){
            throw new APIEntityException('Survey not yet started', 400);
        }
        if(isset($survey["closingDate"])&&$survey["closingDate"]&&$survey["closingDate"]!=""&&$currentTime> (int) $survey["closingDate"]){
            throw new APIEntityException('Survey closed', 400);
        }
        $surveyResult=[
            "status"=>$params["survey"]["status"],
            "data"=>$params["survey"]["data"],
            "formId"=>(string) $survey["id"]
        ];
        Manager::getService("FormsResponses")->create($surveyResult);
        return([
            "success"=>true,
        ]);
    }


    /**
     * Define the resource
     */
    protected function define()
    {
        $this
            ->entityDefinition
            ->setName('Survey')
            ->setDescription('Handle surveys')
            ->editVerb('get', function (VerbDefinitionEntity &$definition) {
                $this->defineGetEntity($definition);
            })->editVerb('post', function (VerbDefinitionEntity &$definition) {
                $this->definePostEntity($definition);
            });
    }

    /**
     * Define get entity action
     *
     * @param VerbDefinitionEntity $definition
     */
    private function defineGetEntity(VerbDefinitionEntity &$definition)
    {
        $definition
            ->setDescription('Get survey')->addOutputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('survey')
                    ->setDescription('Survey')
            );
    }

    private function definePostEntity(VerbDefinitionEntity &$definition)
    {
        $definition
            ->setDescription('Post survey result')->addInputFilter(
                (new FilterDefinitionEntity())
                    ->setKey('survey')
                    ->setRequired(true)
                    ->setDescription('Survey')
            );
    }
}