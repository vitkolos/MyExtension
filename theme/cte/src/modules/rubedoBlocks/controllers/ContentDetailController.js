angular.module("rubedoBlocks").lazy.controller("ContentDetailController",["$scope","RubedoContentsService","RubedoSearchService","RubedoPagesService","TaxonomyService","$timeout","$http","$route","$location","$filter","$rootScope","RubedoPaymentMeansService","InscriptionService",
                                                                          function($scope,RubedoContentsService, RubedoSearchService,RubedoPagesService,TaxonomyService,$timeout,$http,$route,$location,$filter,$rootScope,RubedoPaymentMeansService,InscriptionService){
    var me = this;
    var config = $scope.blockConfig;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    me.inscriptionTemplate = themePath+'/templates/blocks/inscription.html';
    var previousFields;
    me.taxonomy=[];
    me.showInscription = false; // pour les inscriptions, masquer le formulaire
    me.isInscription = true; // pour les propositions, ne pas afficher les inscriptions si closes

    $scope.fieldInputMode=false;
    $scope.page14_18=false;
    $scope.$watch('rubedo.fieldEditMode', function(newValue) {
        $scope.fieldEditMode=me.content&&me.content.readOnly ? false : newValue;
    });
    me.tooltips=function(){
        $('[data-toggle="tooltip"]').tooltip();
    }
    me.getFieldByName=function(name){
        var field=null;
        angular.forEach(me.content.type.fields,function(candidate){
            if (candidate.config.name==name){
                field=candidate;
            }
        });
        return field;
    };
    me.getLabelByName=function(name){
        var field=null;
        angular.forEach(me.content.type.fields,function(candidate){
            if (candidate.config.name==name){
                field=candidate;
            }
        });
        return field.config.fieldLabel;
    };
    me.getLabel = function(field,name) {
        var value = null;
        if (field.cType == 'combobox') {
            angular.forEach(field.store.data,function(candidate){
                if (candidate.valeur == name) {
                    value = candidate.nom;
                }
            });
        }
        else if (field.cType == 'checkboxgroup') {
            angular.forEach(field.config.items,function(candidate){
                if (candidate.inputValue == name) {
                    value = candidate.boxLabel;
                }
            });
        }
        
        return value;
    };
    me.getTermInTaxo=function(taxoKey,termId){
        
        if(!me.taxo){return(null);} // pas de taxonomie pour ce type de contenu
        var term=null;
        angular.forEach(me.taxo[taxoKey],function(candidate){ // chercher l'id dans les taxonomies de ce type de contenu si 
            if(!term){
                if(candidate.id==termId){term=candidate.text;}
            }
         });
         if(!term) term = termId; //pour les taxos extensibles, l'id est le terme cherché
    return(term);
    }
    
    me.search = function(taxoKey,termId){
        RubedoPagesService.getPageById($scope.rubedo.current.page.id).then(function(response){
            if (response.data.success){
                $location.url(response.data.url+'?taxonomies={"'+taxoKey+'":["'+termId+'"]}');
            }
        });        
    };
    me.showCalendar = function(){
      var optionsCalendar = {
        constrainToSite:true,
        siteId: $scope.rubedo.current.site.id,
        pageId: $scope.rubedo.current.page.id,
        predefinedFacets:{"type":"54dc614245205e1d4a8b456b","lieuCommunautaire":config.contentId},
        start:0,
        limit:50,
        orderby:'fields.dateDebut',
        orderbyDirection:'asc',
        displayedFacets:"['all']"
      };
      RubedoSearchService.searchByQuery(optionsCalendar).then(function(response){
        if(response.data.success){
          me.calendarContents = response.data.results;
          console.log('response.data.results');
          console.log(response.data.results);
        } 
      });
    }
    me.getContentById = function (contentId){
        var options = {
            siteId: $scope.rubedo.current.site.id,
            pageId: $scope.rubedo.current.page.id,
            //'fields[]' : ["infoInscription", "moyens_paiement"],
            includeTermLabels:true
        };
        if ($location.search()["preview_draft"] && $location.search()["preview"] && $scope.rubedo.current.user.rights.canEdit) {
            options.useDraftMode = true;
        }
        RubedoContentsService.getContentById(contentId, options).then(
            function(response){
                console.log("CONTENT RAW", response)
                if(response.data.success){
                    if(config.isAutoInjected) $scope.rubedo.current.page.contentCanonicalUrl = response.data.content.canonicalUrl;
                    me.content=response.data.content;
                    //si contenu référence une autre page (interne ou externe)
                    if (me.content.fields.propositionReferencee && me.content.fields.propositionReferencee !="") {
                        window.location.href =  me.content.fields.propositionReferencee;
                    }
                    else if (me.content.fields.propositionReferenceeInterne && me.content.fields.propositionReferenceeInterne) {
                        if (me.content.fields.propositionReferenceeInterne == options.pageId) {
                        }
                        else {
                            RubedoPagesService.getPageById(me.content.fields.propositionReferenceeInterne).then(function(response){
                                    if (response.data.success && ! $scope.rubedo.current.user &&!$scope.rubedo.current.user.rights.canEdit){
                                        window.location.href = response.data.url;
                                    }
                                });                            
                        }
                    }
                  
                    // seulement pour propositions - qui peuvent être éditées directement dans la page
                    if($scope.rubedo.current.breadcrumb.length>0) me.content.editorPageUrl = $scope.rubedo.current.breadcrumb[$scope.rubedo.current.breadcrumb.length-1].url+"?content-edit="+me.content.id;
                    if (config.isAutoInjected){
                        if (me.content.fields.text){
                            $scope.rubedo.setPageTitle(angular.copy(me.content.fields.text));
                        }
                        if (me.content.fields.summary){
                            $scope.rubedo.setPageDescription(angular.copy(me.content.fields.summary));
                        }
                        if(me.content.fields.image) {
                            //$scope.rubedo.current.page.image = $scope.rubedo.imageUrl.getUrlByMediaId(response.data.content.fields.image,{width:'800px'});
                            $scope.rubedo.setPageMetaImage(angular.copy(me.content.fields['image']));
                        }/*
                        var foundMeta=false;
                        angular.forEach(me.content.type.fields,function(field){
                            if(!foundMeta&&field.config&&field.config.useAsMetadata&&me.content.fields[field.config.name]&&me.content.fields[field.config.name]!=""){
                                $scope.rubedo.setPageMetaImage(angular.copy(me.content.fields[field.config.name]));
                                foundMeta=true;
                            }
                        });*/
                        if(response.data.content.fields.video) {
                          if(response.data.content.fields.video.url) $scope.rubedo.current.page.video = response.data.content.fields.video.url;
                          else $scope.rubedo.current.page.video = response.data.content.fields.video;
                        }
                        $scope.rubedo.current.page.fbPage = "http://www.facebook.com/cheminneuf/";
                       
                    }
                    $scope.fieldEntity=angular.copy(me.content.fields);


                    $scope.fieldLanguage=me.content.locale;
                    if (me.content.isProduct){
                        me.content.type.fields.unshift({
                            cType:"productBox",
                            config:{
                                name:"productBox"
                            }
                        });
                        $scope.productProperties=angular.copy(me.content.productProperties);
                        $scope.manageStock=angular.copy(me.content.type.manageStock);
                        $scope.productId=angular.copy(me.content.id);
                    }
                    me.content.type.fields.unshift({
                        cType:"title",
                        config:{
                            name:"text",
                            fieldLabel:"Title",
                            allowBlank:false
                        }
                    });
                    //si le contenu est affiché "à la main" par un bloc détail de contenu, on enlève la page du breadcrumb
                    if(!config.isAutoInjected) $scope.rubedo.current.breadcrumb.pop(); 
                    $scope.rubedo.current.breadcrumb.push({title:response.data.content.text});
                    if (me.content.type.activateDisqus&&$scope.rubedo.current.site.disqusKey){
                        me.activateDisqus=true;
                        me.disqusShortname=$scope.rubedo.current.site.disqusKey;
                        me.disqusIdentifier=me.content.id;
                        me.disqusUrl=window.location.href;
                        me.disqusTitle=me.content.text;
                    }
                    me.customLayout=null;
                    if (angular.isArray(me.content.type.layouts)){
                        angular.forEach(me.content.type.layouts,function(layout){
                            if (layout.active&&layout.site==$scope.rubedo.current.site.id){
                                me.customLayout=layout;
                            }
                        });
                    }
                    
                    //Ajout de formulaire sur page proposition 14-18
                    if (me.content.canonicalUrl.includes('/fr/propositions/14-18-ans')) {
                        $scope.page14_18=true;
                    }
                    
                    if (me.content.type.code=="proposition") {
                        //Propositions : déterminer si les inscriptions sont possibles
                        var today = new Date();
                        if (!me.content.fields.inscriptionState
                            || (me.content.fields.inscriptionState &&(me.content.fields.inscriptionState.inscriptionState == 'close' || me.content.fields.inscriptionState.inscriptionState == 'non' || me.content.fields.inscriptionState.inscriptionState == 'libre'))) {
                            me.isInscription=false;
                        }

                        else if (me.content.fields.dateDebut && me.content.fields.dateDebut*1000 < today.getTime()) {
                            me.propDate = "passee";
                        }
                        else me.propDate="ouverte";
                        // déterminer la monnaie du site
                        RubedoPaymentMeansService.getPaymentMeansPaf().then(
                            function(response){
                                if(response.data.success){
                                    me.paymentmeans = response.data.paymentMeans;
                                    console.log('paymentmeans', me.paymentmeans)
                                }
                            }
                        );
                        
                        //add list of inscriptions
                        if ($scope.rubedo.current.user && $scope.rubedo.current.user.rights.canEdit) {
                            var optionsInscriptionsList = {
                                constrainToSite:false,
                                siteId: $scope.rubedo.current.site.id,
                                pageId: $scope.rubedo.current.page.id,
                                predefinedFacets:{"type":"561627c945205e41208b4581","proposition":config.contentId},
                                start:0,
                                limit:500,
                                orderby:'lastUpdateTime',
                                orderbyDirection:'desc',
                                displayedFacets:"['all']"
                            };
                            RubedoSearchService.searchByQuery(optionsInscriptionsList).then(function(response){
                              if(response.data.success){
                                $timeout(function(){
                                    me.inscriptions = response.data.results.data; 
                                    for (let i = 0; i < me.inscriptions.length; i++) me.inscriptions[i].date_inscription = window.moment(me.inscriptions[i].lastUpdateTime * 1000).format("DD/MM/YYYY hh:mm");
                                    console.log('inscriptions', me.inscriptions);
                                },100);
                              } 
                            });
                            /*Get inscriptions list for dowlonad as csv */
                            var payload = {
                                propositionId:me.content.id
                            };
                            InscriptionService.exportInscriptions(payload).then(function(response){
                                var csvData =  'data:application/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(response.data.path);
                                $timeout(function(){me.downloadUrl=  csvData;},100);
                                /* var target = angular.element("#btnExport");
                                target.attr({'href': csvData,'target': '_blank'});*/
                                //setTimeout(function(){target[0].click();},200);
                            });
                            
                        }

                    }

                    //Albums photos
                    if (me.content.type.code=="album" || me.content.type.code=="actualites") {
                        me.currentIndex=0;
                        me.loadModal = function(index,embedded){
                            me.currentIndex = index;
                            if(embedded) me.currentImage = me.content.fields.embeddedImages[me.currentIndex];
                            else me.currentImage = me.content.fields.images[me.currentIndex];
                        };
                        me.changeImage = function(side,embedded){
                            if(side == 'left' && me.currentIndex > 0){
                                me.currentIndex -= 1;
                            } else if(side == 'right'){
                                me.currentIndex += 1;
                            }
                            if(embedded) me.currentImage = me.content.fields.embeddedImages[me.currentIndex]; 
                            else me.currentImage = me.content.fields.images[me.currentIndex];
                        };
                        me.changeImageKey = function($event,embedded){
                            if ($event.keyCode == 39) { 
                               me.changeImage('right',embedded);
                            }
                        
                            else if ($event.keyCode == 37) {
                               me.changeImage('left',embedded);
                            }
                        };

                    }
                    if(me.content.type.code=="lieu"){
                        var date = new Date();
                        me.currentDate = date.getTime();
                        me.showCalendar();
                    }
                    
                    
/*GET CONTENT TAXONOMIES*/


                     var taxonomiesArray ={};
                     var index=0;
                     angular.forEach(me.content.taxonomy,function(value, taxo){
                            if (taxo!='navigation'){
                                taxonomiesArray[index] = taxo;
                                index++;
                            }
                        });
                    TaxonomyService.getTaxonomyByVocabulary(taxonomiesArray).then(function(response){
                         if(response.data.success){
                            var tax = response.data.taxo;
                            me.taxo={};
                            angular.forEach(tax, function(taxonomie){
                                me.taxo[taxonomie.vocabulary.id] = taxonomie.terms;
                            });
                         }
                         
                     });
                     
                    
                    //Actualités : 3 autres articles
                    if (me.content.type.code=="actualites") {
                        
                        var actusTaxonomy ={};
                        actusTaxonomy['5524db6945205e627a8d8c4e'] = me.content.taxonomy['5524db6945205e627a8d8c4e'];
                        actusTaxonomy['navigation'] = [$scope.rubedo.current.page.id];
                       var displayedFacets = [];
                       displayedFacets.push({"name":"5524db6945205e627a8d8c4e","operator":"OR"});
                        var options3 = {
                            siteId: $scope.rubedo.current.site.id,
                            pageId: $scope.rubedo.current.page.id,
                            start:0,
                            limit:4,
                            constrainToSite: true,
                            orderby:'lastUpdateTime',
                            taxonomies: actusTaxonomy,
                            type:me.content.type.id,
                            displayedFacets: JSON.stringify(displayedFacets) // pour la taxonomie d'actus, recherche additive
                        };
                        
                        RubedoSearchService.searchByQuery(options3).then(function(response){
                            if (response.data.success) {
                                var results = response.data.results.data;
                                var counter=0;
                                me.linkedContents={};
                                angular.forEach(results, function(content, key){
                                    if (content.id != me.content.id && counter <3) {
                                        me.linkedContents[counter] = content;
                                        counter++;
                                    }
                                });
                            }
                        });
                    }
                    
                    //Services civiques : 3 autres propositions
                    if (me.content.type.code=="service") {
                        
                        var actusTaxonomy ={};
                        actusTaxonomy['5b221eb63965887f474adfe1'] = me.content.taxonomy['5b221eb63965887f474adfe1'];
                        actusTaxonomy['navigation'] = [$scope.rubedo.current.page.id];
                       var displayedFacets = [];
                       displayedFacets.push({"name":"5b221eb63965887f474adfe1","operator":"OR"});
                        var options3 = {
                            siteId: $scope.rubedo.current.site.id,
                            pageId: $scope.rubedo.current.page.id,
                            start:0,
                            limit:4,
                            constrainToSite: true,
                            orderby:'lastUpdateTime',
                            taxonomies: actusTaxonomy,
                            type:me.content.type.id,
                            displayedFacets: JSON.stringify(displayedFacets) // pour la taxonomie d'actus, recherche additive
                        };
                        
                        RubedoSearchService.searchByQuery(options3).then(function(response){
                            if (response.data.success) {
                                var results = response.data.results.data;
                                var counter=0;
                                me.linkedContents={};
                                angular.forEach(results, function(content, key){
                                    if (content.id != me.content.id && counter <3) {
                                        me.linkedContents[counter] = content;
                                        counter++;
                                    }
                                });
                            }
                        });
                    }
                    
                    
                    
                    if(me.customLayout){
                        me.content.type.fields.unshift({
                            cType:"textarea",
                            config:{
                                name:"summary",
                                fieldLabel:"Summary",
                                allowBlank:false
                            }
                        });
                        me.detailTemplate=me.customLayout.customTemplate?themePath+'/templates/blocks/contentDetail/customTemplate.html':themePath+'/templates/blocks/contentDetail/customLayout.html';
                    } else {
                        if(me.content.type.code&&me.content.type.code!=""){
                            $http.get(themePath+'/templates/blocks/contentDetail/'+me.content.type.code+".html").then(
                                function (response){
                                    me.detailTemplate=themePath+'/templates/blocks/contentDetail/'+me.content.type.code+".html";
                                    $scope.fields=me.transformForFront(me.content.type.fields);
                                    $scope.clearORPlaceholderHeight();
                                },
                                function (response){
                                    me.detailTemplate=themePath+'/templates/blocks/contentDetail/default.html';
                                    $scope.fields=me.transformForFront(me.content.type.fields);
                                    $scope.clearORPlaceholderHeight();
                                }
                            );
                        } else {
                            me.detailTemplate=themePath+'/templates/blocks/contentDetail/default.html';
                            $scope.fields=me.transformForFront(me.content.type.fields);
                            $scope.clearORPlaceholderHeight();
                        }
                    }
                    if(me.content.clickStreamEvent&&me.content.clickStreamEvent!=""){
                        $rootScope.$broadcast("ClickStreamEvent",{csEvent:me.content.clickStreamEvent});
                     }
                }
            }
        );
    };
    if (config.contentId){
        me.getContentById(config.contentId);
    }
    
    
    me.revertChanges=function(){
        $scope.fieldEntity=angular.copy(previousFields);
    };
    me.registerEditChanges=function(){
        $scope.rubedo.registerEditCtrl(me);
    };
    me.launchFullEditor=function(){
        var modalUrl = "/backoffice/content-contributor?edit-mode=true&content-id="+me.content.id+"&workingLanguage="+$route.current.params.lang;
        var availHeight=window.innerHeight*(90/100);
        var properHeight=Math.max(400,availHeight);
        var iframeHeight=properHeight-10;
        angular.element("#content-contribute-frame").empty();
        angular.element("#content-contribute-frame").html("<iframe style='width:100%;  height:"+iframeHeight+"px; border:none;' src='" + modalUrl + "'></iframe>");
        angular.element('#content-contribute-modal').appendTo('body').modal('show');
        window.confirmContentContribution=function(){
            angular.element("#content-contribute-frame").empty();
            angular.element('#content-contribute-modal').modal('hide');
            $scope.rubedo.addNotification("success",$scope.rubedo.translate("Block.Success"),$scope.rubedo.translate("Blocks.Contrib.Status.ContentUpdated"));
            me.getContentById(me.content.id);
        };
        window.cancelContentContribution=function(){
            angular.element("#content-contribute-frame").empty();
            angular.element('#content-contribute-modal').modal('hide');
        };
    };
    me.persistChanges=function(){
        var payload=angular.copy(me.content);
        payload.fields=transformForPersist();
        delete (payload.type);
        RubedoContentsService.updateContent(payload).then(
            function(response){
                if (response.data.success){
                    me.content.version = response.data.version;
                    $scope.rubedo.addNotification("success",$scope.rubedo.translate("Block.Success"),$scope.rubedo.translate("Blocks.Contrib.Status.ContentUpdated"));
                } else {
                    $scope.rubedo.addNotification("danger",$scope.rubedo.translate("Block.Error"),$scope.rubedo.translate("Blocks.Contrib.Status.UpdateError"));
                }

            },
            function(response){
                $scope.rubedo.addNotification("danger",$scope.rubedo.translate("Block.Error"),$scope.rubedo.translate("Blocks.Contrib.Status.UpdateError"));
            }
        );
    };
    var transformForPersist = function(){
        var returnFields = angular.copy(me.content.fields);
        angular.forEach(me.content.fields, function(field, fieldKey){
            var fieldType="";
            if (me.getFieldByName(fieldKey)) {
                fieldType=me.getFieldByName(fieldKey).cType;
            }
            if(angular.isArray(field) && fieldType!='combobox'){
                angular.forEach(field, function(fld, fldKey){
                    if (fieldKey!='image' ) {
                        if(fldKey === 0){
                            returnFields[fieldKey][fldKey]=$scope.fieldEntity[fieldKey];
                        } else {
                            returnFields[fieldKey][fldKey]=$scope.fieldEntity[fieldKey+fldKey];
                        }    
                    }
                    else returnFields[fieldKey][fldKey]=$scope.fieldEntity[fieldKey][fldKey];
                    
                })
            } else {
                returnFields[fieldKey] = $scope.fieldEntity[fieldKey];
            }
        });
        return returnFields;
    };
    me.transformForFront = function(fieldsType){
        var res = [];
        angular.forEach(fieldsType, function(fieldTp){
            var fieldType;
            if(!fieldTp.config&&fieldTp.name){
                fieldTp.field=me.getFieldByName(fieldTp.name);
                fieldType = fieldTp.field;
            } else {
                fieldType = fieldTp;
            }
            res.push(fieldTp);
            if(angular.isArray(me.content.fields[fieldType.config.name])&&fieldType.config.multivalued){
                var fields = $scope.fieldEntity[fieldType.config.name];
                angular.forEach(fields, function(fld, keyFld){
                    if(keyFld === 0){
                        $scope.fieldEntity[fieldType.config.name] = me.content.fields[fieldType.config.name][keyFld];
                    } else {
                        var name = fieldType.config.name + keyFld;
                        var newField = angular.copy(fieldTp);
                        if(!newField.config&&newField.name){
                            newField.field = angular.copy(fieldType);
                            newField.field.config.name = name;
                        } else {
                            newField.config.name = name;
                        }
                        res.push(newField);
                        $scope.fieldEntity[name] = me.content.fields[fieldType.config.name][keyFld];
                    }
                });
            }
        });
        previousFields = angular.copy($scope.fieldEntity);
        return res;
    };
    $scope.registerFieldEditChanges=me.registerEditChanges;
    

}]);

 


