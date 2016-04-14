/*
 Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.md or http://ckeditor.com/license
*/
CKEDITOR.addTemplates("default",{imagesPath:"/theme/netforgod/ckeditor/img/",templates:[

    {title:"Texte sur deux colonnes",image:"w50w50.png",description:"Texte sur deux colonnes de même largeur (qui passent l'une au dessus de l'autre sur tablettes / smartphones)",
    html:'<div class="col-xs-12  col-sm-6"><p>Colonne 1 </p></div><div class="col-xs-12  col-sm-6"><p>Colonne 2 </p></div>'},
    {title:"Texte sur trois colonnes",image:"w33w33.png",description:"Texte sur trois colonnes de même largeur (qui passent l'une au dessus de l'autre sur tablettes / smartphones)",
    html:'<div class="col-xs-12  col-sm-4"><p>Colonne 1 </p></div><div class="col-xs-12  col-sm-4"><p>Colonne 2 </p></div><div class="col-xs-12  col-sm-4"><p>Colonne 3</p></div><p></p>'},
{title:"Texte sur deux colonnes",image:"w33w33.png",description:"Image à gauchet et texte à droite",
    html:'<div class="row"><div class="col-xs-12  col-sm-7 col-sm-push-5"><p>Texte</p></div><div class="col-xs-12  col-sm-5 col-sm-pull-7"><p>Image</p></div></div><p></p>'},
{title:"Texte sur deux colonnes inversé",image:"w33w33.png",description:"Texte sur 2 colonnes de même largeur (qui passent l'une au dessus de l'autre sur tablettes / smartphones)",
    html:'<div class="row"><div class="col-xs-12  col-sm-7"><p>Colonne 1 </p></div><div class="col-xs-12  col-sm-5"><p>Colonne 2 </p></div></div><p></p>'},
{title:"Texte sur deux colonnes 3/4 1/4",image:"w75w25.png",description:"Texte sur 2 colonnes",
    html:'<div class="row"><div class="col-xs-12  col-sm-8"><p>Colonne 1 </p></div><div class="col-xs-12  col-sm-4"><p>Colonne 2 </p></div></div><p></p>'}

    ]});