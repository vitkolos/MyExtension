<?php
return array(
    'paymentMeans' => array(
            'paybox' => array(
            'name' => "PayBox",
            'service' => 'PayboxPayment',
            'definitionFile' => realpath(__DIR__ . "/paymentMeans/") . '/paybox.json'
        )
    ),
    

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
         'calendar' => array(
            'maxlifeTime' => 60,
            'definitionFile' => realpath(__DIR__ . "/blocks/") . '/calendar.json'
        ),
         'richText' => array(
            'maxlifeTime' => 60,
            'definitionFile' => realpath(__DIR__ . "/blocks/") . '/richText.json'
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
        ),
        'imageBatchUpload' => array(
            'maxlifeTime' => 60,
            'definitionFile' => realpath(__DIR__ . "/blocks/") . '/imageBatchUpload.json'
        )  
 ),

    'templates' => array(
        'themes' => array(
            'cte' => array(
                'label' => 'CTE',
                'basePath' => realpath(__DIR__ . '/../theme/cte'),
                'css' => array(
                    '/css/cte.css',
                    '/css/font-awesome.css',
                    '/css/cheminneuf.css'
                ),
                'js' => array(
                    '/js/cte.js',
                    '../js/lazy-image.js',
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
                    '../js/lazy-image.js',
                ),
            ),
            'netforgod' => array(
                'label' => 'Net4God',
                'basePath' => realpath(__DIR__ . '/../theme/netforgod'),
                'css' => array(
                    '/css/netforgod.css',
                    'css/font-nfg.css'
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
            'worshipteam' => array(
                'label' => 'Worship Team',
                'basePath' => realpath(__DIR__ . '/../theme/worshipteam'),
                'css' => array(
                    '/css/worship.css',
                    '/css/font-awesome.css'
                ),
                'js' => array(
                    '/js/worship.js'
                ),
            ),
            'goodnews' => array(
                'label' => 'Good News',
                'basePath' => realpath(__DIR__ . '/../theme/goodnews'),
                'css' => array(
                    '/css/goodnews.css',
                    '/css/font-awesome.css'
                ),
                'js' => array(
                    '/js/goodnews.js'
                ),
            ),
           'boutique' => array(
                'label' => 'Boutique',
                'basePath' => realpath(__DIR__ . '/../theme/boutique'),
                'css' => array(
                    '/css/boutique.css',
                    '/css/font-awesome.css'
                ),
                'js' => array(
                    '/js/boutique.js'
                ),
           ),
           'international' => array(
                'label' => 'Cana International',
                'basePath' => realpath(__DIR__ . '/../theme/international'),
                'css' => array(
                    '/css/international.css',
                    '/css/font-awesome.css'
                ),
                'js' => array(
                    '../js/lazy-image.js',
                    '/js/international.js'
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
    /*ajout du service Paybox*/
    'service_manager' => array(
        'invokables' => array(
            'PayboxPayment'=>'Rubedo\\Payment\\PayboxPayment'
        )
    ),
    /*
    'controllers' => array(
        'invokables' => array(
            'Rubedo\\Backoffice\\Controller\\Contents' => 'Rubedo\\Backoffice\\Controller\\ContentsController',
        ),
    ),
        */
    /* Surcharge des traductions
       */
    'localisationfiles' => array(
        'extensions/nicolasrhone/myextension/localization/languagekey/Blocks/ButtonToPage.json',
         'extensions/nicolasrhone/myextension/localization/languagekey/Blocks/GeneralFields.json',
         'extensions/nicolasrhone/myextension/localization/languagekey/Blocks/Share.json',
         'extensions/nicolasrhone/myextension/localization/languagekey/Blocks/Emails.json'
    ),
    

);
