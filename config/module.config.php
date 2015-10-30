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
       'facebook' => array(
            'maxlifeTime' => 60,
            'definitionFile' => realpath(__DIR__ . "/blocks/") . '/facebook.json'
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
        ),
        'geoSearchResults' => array(
               'maxlifeTime' => 60,
               'definitionFile' => realpath(__DIR__ . "/blocks/")  . '/geoSearchResults.json'
           ),
        'bg_image' => array(
               'maxlifeTime' => 60,
               'definitionFile' => realpath(__DIR__ . "/blocks/")  . '/bg_image.json'
           ),
        'sectionPresentation' => array(
            'maxlifeTime' => 60,
            'definitionFile' => realpath(__DIR__ . "/blocks/") . '/sectionPresentation.json'
        ),
        'carrousel2' => array(
            'maxlifeTime' => 60,
            'definitionFile' => realpath(__DIR__ . "/blocks/") . '/carrousel2.json'
        ),   
        'redirect' => array(
            'maxlifeTime' => 60,
            'definitionFile' => realpath(__DIR__ . "/blocks/") . '/redirect.json'
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
                    '../js/blocks.js'
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
            'jmj2016' => array(
                'label' => 'JMJ2016',
                'basePath' => realpath(__DIR__ . '/../theme/jmj2016'),
                'css' => array(
                    '/css/jmj2016.css',
                ),
                'js' => array(
                    '/js/jmj.js',
                ),
            ),
            'netforgod' => array(
                'label' => 'Net4God',
                'basePath' => realpath(__DIR__ . '/../theme/netforgod'),
                'css' => array(
                    '/css/netforgod.css',
                    '/css/font-awesome.css'
                ),
                'js' => array(
                    '/js/netforgod.js',
                ),
            ),
            'musculine' => array(
                'label' => 'Musculine',
                'basePath' => realpath(__DIR__ . '/../theme/musculine'),
                'css' => array(
                    '/css/musculine.css'
                ),
                'js' => array(
                    '/js/musculine.js',
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
            'layout/layout' => realpath(__DIR__) . '/../views/layout/layout.phtml',
            'error/404' =>  realpath(__DIR__) . '/../views/error/404.phtml',
            'rubedo/index/index' => realpath(__DIR__) . '/../views/index/index.phtml'
        ),
    ),
    
    
        
    /* Surcharge des traductions
       */
    'localisationfiles' => array(
        100 =>  'extensions/nicolasrhone/myextension/localization/languagekey/Blocks/ButtonToPage.json',
        101 =>  'extensions/nicolasrhone/myextension/localization/languagekey/Blocks/GeneralFields.json',
        102 =>  'extensions/nicolasrhone/myextension/localization/languagekey/Blocks/Share.json',
        103 =>  'extensions/nicolasrhone/myextension/localization/languagekey/Blocks/Inscription.json'
    ),
    

);
