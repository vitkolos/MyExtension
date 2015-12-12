/*
 Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.md or http://ckeditor.com/license
*/
CKEDITOR.addTemplates("default",{imagesPath:"/theme/cte/ckeditor/img/",templates:[
    {title:"Présentation avec icône",image:"template1.gif",description:"Template avec une icône, un titre et une description",
    html:'<div class="col-xs-6  col-md-3 block-detail" ><p>Icône</p><p>Title</p><p>Description</p></div>'},
    {title:"Texte sur deux colonnes",image:"w50w50.png",description:"Texte sur deux colonnes de même largeur (qui passent l'une au dessus de l'autre sur tablettes / smartphones)",
    html:'<div class="col-xs-12  col-sm-6"><p>Colonne 1 </p></div><div class="col-xs-12  col-sm-6"><p>Colonne 2 </p></div>'},
    {title:"Texte sur trois colonnes",image:"w33w33.png",description:"Texte sur trois colonnes de même largeur (qui passent l'une au dessus de l'autre sur tablettes / smartphones)",
    html:'<div class="col-xs-12  col-sm-4"><p>Colonne 1 </p></div><div class="col-xs-12  col-sm-4"><p>Colonne 2 </p></div><div class="col-xs-12  col-sm-4"><p>Colonne 3</p></div>'},
    {title:"Liste de l'équipe",image:"users.jpg",description:"Présentation de l'équipe sur 4 colonnes",
    html:'<div class="col-xs-12  col-sm-6 col-md-3"><p class="image">Image</p><p class="userName"></p><p class="userDesc"></p></div><div class="col-xs-12  col-sm-6 col-md-3"><p class="image">Image</p><p class="userName"></p><p class="userDesc"></p></div><div class="col-xs-12  col-sm-6 col-md-3"><p class="image">Image</p><p class="userName"></p><p class="userDesc"></p></div><div class="col-xs-12  col-sm-6 col-md-3"><p class="image">Image</p><p class="userName"></p><p class="userDesc"></p></div>'}
    ]});