/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
    config.colorButton_colors = "13c4a5,ffffff,444,";

};


CKEDITOR.stylesSet.add( 'default', [
    { name: 'Tags', element: 'p', attributes: { 'class': 'tag'} },
    {
		name: 'Image 100%',
		element: 'img',
		attributes: { 'class': 'full-width' }
    },


] );



CKEDITOR.plugins.addExternal( 'youtube', '/theme/goodnews/ckeditor/plugins/youtube/','plugin.js' );
