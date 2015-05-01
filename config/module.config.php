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
            'definitionFile' => realpath(__DIR__ . "/blocks/") . '/searchResults.json'
        )
    ),

    'templates' => array(
        'themes' => array(
            'cte' => array(
                'label' => 'CTE',
                'basePath' => realpath(__DIR__ . '/../theme/cte'),
                'css' => array(
                    '/css/cte.css',
                    '/css/font-awesome.css'
                ),
                'js' => array(
                    '/js/cte.js',
                ),
            ),
            'wtp15' => array(
                'label' => 'WTP15',
                'basePath' => realpath(__DIR__ . '/../theme/wtp15'),
                'css' => array(
                    '/css/wtp2015.css',
                    '/css/ru.css'
                ),
                'js' => array(
                    '/js/wtp.js',
                ),
            ),
        ),
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
