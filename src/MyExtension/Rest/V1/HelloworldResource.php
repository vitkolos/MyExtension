<?php

namespace MyExtension\Rest\V1;


use RubedoAPI\Entities\API\Definition\FilterDefinitionEntity;
use RubedoAPI\Entities\API\Definition\VerbDefinitionEntity;
use RubedoAPI\Rest\V1\AbstractResource;

class HelloworldResource extends AbstractResource {
    function __construct()
    {
        parent::__construct();
        $this
            ->definition
            ->setName('HelloWorld')
            ->setDescription('Say hello !')
            ->editVerb('get', function (VerbDefinitionEntity &$verbDefinitionEntity) {
                $verbDefinitionEntity
                    ->setDescription('Get hello world')
                    ->addInputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Name')
                            ->setKey('name')
                            ->setFilter('string')
                    )
                    ->addOutputFilter(
                        (new FilterDefinitionEntity())
                            ->setDescription('Say hello')
                            ->setKey('helloworld')
                            ->setFilter('string')
                            ->setRequired()
                    );
            });
    }
    function getAction($params) {
        $helloWorld = sprintf('Hello %s', isset($params['name'])?$params['name']:'World');
        return array(
            'success' => true,
            'helloworld' => $helloWorld,
        );
    }
} 
