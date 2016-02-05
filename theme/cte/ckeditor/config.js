/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
        config.colorButton_colors = 'c1573c,2e2c29,d5c5b5,ffffff';
        config.colorButton_enableMore = false;



};

CKEDITOR.stylesSet.add( 'default', [
    { name: 'Lien boîte', element: 'p', attributes: { 'class': 'linkbox'} }
] );


CKEDITOR.plugins.addExternal( 'youtube', '/theme/goodnews/ckeditor/plugins/youtube/','plugin.js' );
