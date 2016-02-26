/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
    config.colorButton_colors = "ffd600,c5c5c5,2e2c29";

};


CKEDITOR.stylesSet.add( 'default', [
    { name: 'Titre section', element: 'h4', attributes: { 'class': 'text-center titre-block'} },
    {
		name: 'Image 100%',
		element: 'img',
		attributes: { 'class': 'full-width' }
    },


] );



CKEDITOR.plugins.addExternal( 'youtube', '/theme/goodnews/ckeditor/plugins/youtube/','plugin.js' );
