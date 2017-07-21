/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
    config.colorButton_colors = "13c4a5,ffffff,444,";
        config.colorButton_enableMore = false;
    config.youtube_responsive = true;
        config.format_tags ='p;h1;h2;h3;h4;h5;h6','button';
};


CKEDITOR.stylesSet.add( 'default', [
    { name: 'Tags', element: 'p', attributes: { 'class': 'tag'} },
    { name: 'Bouton', element: 'a', attributes: { 'class': 'button '} },
    { name: 'Bouton inverse', element: 'a', attributes: { 'class': 'button-inv'} },
    {
		name: 'Image 100%',
		element: 'img',
		attributes: { 'class': 'full-width' }
    },


] );



CKEDITOR.plugins.addExternal( 'youtube', '/theme/goodnews/ckeditor/plugins/youtube/','plugin.js' );
