/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
        config.colorButton_colors = 'ffffff,17789c,333,41a0c7';
        config.colorButton_enableMore = false;
        config.youtube_responsive = true;
        config.format_tags ='p;h1;h2;h3;h4;h5;h6';
};

CKEDITOR.stylesSet.add( 'default', [
	{ name: 'Majuscules', element: 'p', attributes: { 'class': 'uppercase'} },
	
] );



CKEDITOR.plugins.addExternal( 'widget', '/theme/cte/ckeditor/plugins/widget/','plugin.js' );
CKEDITOR.plugins.addExternal( 'lineutils', '/theme/cte/ckeditor/plugins/lineutils/','plugin.js' );
CKEDITOR.plugins.addExternal( 'youtube', '/theme/goodnews/ckeditor/plugins/youtube/','plugin.js' );
CKEDITOR.plugins.addExternal( 'bootstrapCollapse', '/theme/cte/ckeditor/plugins/bootstrapCollapse/','plugin.js' );
CKEDITOR.dtd.$removeEmpty['p']= false;
CKEDITOR.dtd.$removeEmpty['i']= false;
CKEDITOR.dtd.$removeEmpty['span']= false;
