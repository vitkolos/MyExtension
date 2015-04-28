<?php
return array(

    /**
     * Your block definition : back-office json configuration file
     */
    'blocksDefinition' => array(
       'buttonToPage' => array(
            'maxlifeTime' => 60,
            'definitionFile' => realpath(__DIR__ . "/blocks/") . '/buttonToPage.json'
        ),
       'contactBlock' => array(
            'maxlifeTime' => 60,
            'definitionFile' => realpath(__DIR__ . "/blocks/") . '/contactBlock.json'
        ),
       'form' => array(
            'maxlifeTime' => 60,
            'definitionFile' => realpath(__DIR__ . "/blocks/") . '/form.json'
        ),
       'simpleContact' => array(
            'maxlifeTime' => 60,
            'definitionFile' => realpath(__DIR__ . "/blocks/") . '/simpleContact.json'
        ),
        'searchResults' => array(
            'maxlifeTime' => 60,
            'definitionFile' => $blocksPath . '/searchResults.json'
        )               
    ),

 
    'namespaces_api' => array(
        'MyExtension',
    ),
    
        /*
      Surcharge de la vue index du front
     */
    'view_manager' => array(
        'template_map' => array(
          'rubedo/index/index' => realpath(__DIR__) . '/../views/index/index.phtml'
        ),
    ),
    
    
        /*
     * Surcharge des traductions
       
    'localisationfiles' => array(
        100 => 'extensions/WebTales/MyExtension/rubedo-localization/languagekey/FrontOffice/Blocks/General/labels.json'
        
    ),*/ 


);
