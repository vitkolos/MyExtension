/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
        config.colorButton_colors = 'c3357b,472a72,9c9b9d,2f2e2a,ffffff';
        config.colorButton_enableMore = false;
        config.youtube_responsive = true;
        };
        
CKEDITOR.stylesSet.add( 'default', [
    { name: 'Lien boîte', element: 'h2', attributes: { 'class': 'linkbox-square'} },
    	{ name:'Lien rond blanc', element:'p', attributes:{'class':'linkbox-rond-blanc'}},
     { name:'Lien rond noir', element:'p', attributes:{'class':'linkbox-rond-noir'}},
     { name:'Retourne', element:'span', attributes:{'class':'retourne'}},
     { name:'Renverse', element:'span', attributes:{'class':'inverse'}},
    {
		name: 'Centered image',
		element: 'img',
		attributes: { 'style': 'margin:0 auto' }
    }


] );


CKEDITOR.plugins.addExternal( 'youtube', '/theme/goodnews/ckeditor/plugins/youtube/','plugin.js' );
