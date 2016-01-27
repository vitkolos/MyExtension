angular.module("rubedoBlocks").lazy.controller("ContentDetailController",["$scope","RubedoContentsService","RubedoSearchService","RubedoPagesService","TaxonomyService","$http","$route","$location",
                                                                          function($scope,RubedoContentsService, RubedoSearchService,RubedoPagesService,TaxonomyService,$http,$route,$location){
    var me = this;
    var config = $scope.blockConfig;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    var previousFields;
    me.taxonomy=[];
    me.watch = 'no';
    var path=$location.path();
    me.lang=path.split("/")[1];
    me.defaultLang=path.split("/")[1];
    me.tab=0;
    me.showShare=false;
    me.showInfos=true;
    me.fullUrl=$location.absUrl();
    $scope.fieldInputMode=false;
    $scope.$watch('rubedo.fieldEditMode', function(newValue) {
        $scope.fieldEditMode=me.content&&me.content.readOnly ? false : newValue;
    });
    $scope.isArray = angular.isArray;
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
    me.getContentById = function (contentId){
        var options = {
            siteId: $scope.rubedo.current.site.id,
            pageId: $scope.rubedo.current.page.id,
            includeTermLabels:true
        };
        RubedoContentsService.getContentById(contentId, options).then(
            function(response){
                if(response.data.success){
                    $scope.rubedo.current.page.contentCanonicalUrl = response.data.content.canonicalUrl;
                    me.content=response.data.content;
                    if (config.isAutoInjected){
                        if (me.content.fields.text){
                            $scope.rubedo.setPageTitle(angular.copy(me.content.fields.text));
                        }
                        if (me.content.fields.summary){
                            $scope.rubedo.setPageDescription(angular.copy(me.content.fields.summary));
                        }
                        if(response.data.content.fields.image) {
                            $scope.rubedo.current.page.image = $scope.rubedo.imageUrl.getUrlByMediaId(response.data.content.fields.image,{width:'800px'});
                        }
                        if(response.data.content.fields.video) {
                            $scope.rubedo.current.page.video = response.data.content.fields.video.url;
                        }
                        
                       
                    }
                    /* déterminer si on a un film ou trailer*/
                    if (me.content.fields.filmYT) {
                        me.watch = 'film';
                    }
                    else if (me.content.fields.trailer) {
                        me.watch = 'trailer';
                    }
                    else me.watch='no';
                    
                    /* déterminer l'onglet*/
                    if (!(me.content.fields.parole ||me.content.fields.share||me.content.fields.intercession )) {
                        me.tab=1;
                        me.showInfos = false;
                    }
                    
                    /*si FOI lié, récupérer le contenu*/
                    var options = {
                      siteId: $scope.rubedo.current.site.id,
                      pageId: $scope.rubedo.current.page.id
                    };
                    if (me.content.fields.linkedFOI) {
                        RubedoContentsService.getContentById(me.content.fields.linkedFOI, options).then(
                            function(response){
                                if(response.data.success){
                                    me.relatedFOI=response.data.content;
                                }
                        });
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
                     
                    
                    //Films : 3 autres articles
                    if (me.content.type.code=="filmNFG") {
                        var taxonomy = angular.copy(me.content.taxonomy);
                        if (taxonomy["navigation"]) {
                            delete taxonomy["navigation"];
                       }
                       /*delete texonomie de lieux de tournage*/
                       if (taxonomy["54d6299445205e7877a6b28e"]) {
                            delete taxonomy["54d6299445205e7877a6b28e"];
                       }
                       var displayedFacets = [];
                       displayedFacets.push({"name":"54cb636245205e0110db058f","operator":"OR"});
                        var options3 = {
                            siteId: $scope.rubedo.current.site.id,
                            pageId: $scope.rubedo.current.page.id,
                            detailPageId: $scope.rubedo.current.page.id,
                            start:0,
                            limit:4,
                            constrainToSite: false,
                            orderby:'fields.date',
                            taxonomies: taxonomy,
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
                    };
                    if (me.content.type.code=="pointNet") {
                        var dateDist=9999999999;
                        var oneDay = 24 * 60 * 60 * 1000;
                        var today = new Date();
                        if (me.content.fields.date) {
                            angular.forEach(me.content.fields.date,function(candidateDate){
                                if ( candidateDate*1000 - today.getTime() >0 && candidateDate*1000 - today.getTime()<dateDist) {
                                    dateDist = candidateDate*1000 - today.getTime();
                                    me.content.nextDate=candidateDate;
                                }
                            });
                            if (me.content.nextDate) {
                               if(dateDist/oneDay<=7) {
                                    me.content.classe = "date1";
                                }
                               else if(dateDist/oneDay<=14) {
                                    me.content.classe = "date2";
                                }
                                else if(dateDist/oneDay<=30) {
                                    me.content.classe = "date3";
                                }      
                                else if(dateDist/oneDay<=60) {
                                    me.content.classe = "date4";
                                }
                                else me.content.classe = "date5";
                            }
                            else me.content.classe = "date5";
                         }
                    };
                    
                    
                    
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
                                    if (me.content.fields.horsSerie) {
                                        me.detailTemplate=themePath+'/templates/blocks/contentDetail/horsSerie.html';
                                    }
                                    else me.detailTemplate=themePath+'/templates/blocks/contentDetail/'+me.content.type.code+".html";
                                    $scope.fields=me.transformForFront(me.content.type.fields);
                                },
                                function (response){
                                    me.detailTemplate=themePath+'/templates/blocks/contentDetail/default.html';
                                    $scope.fields=me.transformForFront(me.content.type.fields);
                                }
                            );
                        } else {
                            me.detailTemplate=themePath+'/templates/blocks/contentDetail/default.html';
                            $scope.fields=me.transformForFront(me.content.type.fields);
                        }
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
            if(angular.isArray(field)){
                angular.forEach(field, function(fld, fldKey){
                    if(fldKey === 0){
                        returnFields[fieldKey][fldKey]=$scope.fieldEntity[fieldKey];
                    } else {
                        returnFields[fieldKey][fldKey]=$scope.fieldEntity[fieldKey+fldKey];
                    }
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


   //generic field directive
  angular.module("rubedoBlocks").lazy.controller("RECFieldFilmController",["$scope","RubedoContentTypesService",function($scope,RubedoContentTypesService){
      var me=this;
      $scope.fields=[];
      var config=$scope.field.config;
      if (!$scope.fieldEntity[config.name]&&$scope.fieldInputMode){
          $scope.fieldEntity[config.name]={ };
      }
      $scope.fieldEntity=$scope.fieldEntity[config.name];

      RubedoContentTypesService.findById(config.usedCT,{}).then(
          function(response){
              if(response.data.success){
                  me.contentType=response.data.contentType;
                  $scope.fieldIdPrefix=$scope.fieldIdPrefix+me.contentType.type;
 
                  $scope.fields=me.contentType.fields;
              }
          }
      );
    
  }]);


