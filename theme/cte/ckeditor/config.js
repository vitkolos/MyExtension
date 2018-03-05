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
        config.youtube_responsive = true;
        config.format_tags ='p;h1;h2;h3;h4;h5;h6';


};

CKEDITOR.stylesSet.add( 'default', [
	{ name: 'Lien boîte', element: 'p', attributes: { 'class': 'linkbox'} },
	{ name: 'Texte petit', element: 'p', attributes: { 'class': 'small'} },
	    {
		name: 'Centrer image',
		element: 'img',
		attributes: { 'style': 'margin:0 auto' }
	},
	{ name: 'Citation', element: 'blockquote', attributes: { 'class': 'center'} },
	{ name: 'Bouton rouge', element: 'a', attributes: { 'class': 'button rouge'} },
 { name: 'Bouton Rouge', element: 'p', attributes: { 'class': 'button rouge'} }

] );



CKEDITOR.plugins.addExternal( 'widget', '/theme/cte/ckeditor/plugins/widget/','plugin.js' );
CKEDITOR.plugins.addExternal( 'lineutils', '/theme/cte/ckeditor/plugins/lineutils/','plugin.js' );
CKEDITOR.plugins.addExternal( 'youtube', '/theme/goodnews/ckeditor/plugins/youtube/','plugin.js' );
CKEDITOR.plugins.addExternal( 'bootstrapCollapse', '/theme/cte/ckeditor/plugins/bootstrapCollapse/','plugin.js' );
CKEDITOR.dtd.$removeEmpty['p']= false;
CKEDITOR.dtd.$removeEmpty['i']= false;
CKEDITOR.dtd.$removeEmpty['span']= false;
