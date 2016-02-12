/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
        config.colorButton_colors = 'c1573c,2e2c29,d5c5b5,898989,ffffff';
        config.colorButton_enableMore = false;



};

CKEDITOR.stylesSet.add( 'default', [
    { name: 'Lien boîte', element: 'p', attributes: { 'class': 'linkbox'} },
    { name: 'Sous-titre FOI', element: 'p', attributes: { 'class': 'red-sub'} },
    {
		name: 'Centered image',
		element: 'img',
		attributes: { 'style': 'margin:0 auto' }
    },
        { name: 'button', element: 'a', attributes: { 'class': 'button rouge'} },

] );


CKEDITOR.plugins.addExternal( 'youtube', '/theme/goodnews/ckeditor/plugins/youtube/','plugin.js' );
