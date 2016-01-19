angular.module("rubedoBlocks").lazy.controller("ContentDetailController",["$scope","RubedoContentsService","RubedoSearchService","RubedoPagesService","TaxonomyService","$http","$route","$location","$filter",
                                                                          function($scope,RubedoContentsService, RubedoSearchService,RubedoPagesService,TaxonomyService,$http,$route,$location,$filter){
    var me = this;
    var config = $scope.blockConfig;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    var previousFields;
    me.taxonomy=[];
    me.gallery={}; // for album photo


    $scope.fieldInputMode=false;
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
    me.getTermInTaxo=function(taxoKey,termId){
        if(!me.taxo){return(null);} // pas de taxonomie pour ce type de contenu
        var term=null;
        angular.forEach(me.taxo[taxoKey].terms,function(candidate, id){ // chercher l'id dans les taxonomies de ce type de contenu si 
            if(!term){if(id==termId){term=candidate;}}
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
            pageId: $scope.rubedo.current.page.id
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
                    //Albums photos
                    if (me.content.type.code=="album") {
                        me.content.images={};
                        var options2 = {
                            siteId: $scope.rubedo.current.site.id,
                            pageId: $scope.rubedo.current.page.id,
                            start:0,
                            limit:200,
                            query:me.content.fields.titrePhoto+"*"
                        };
                        me.getMedia = function(options){
                            RubedoSearchService.getMediaById(options).then(function(response){
                                if(response.data.success){
                                    me.content.images = $filter('orderBy')(response.data.results.data, 'title') ;
                                    me.gallery.count = response.data.count;
                                    me.gallery.nbPages = Math.ceil(me.gallery.count/me.gallery.limit);
                                }
                            });
                        };
                        me.getMedia(options2);
                    }
                     

                    
                    if (me.content.fields.author_jmj) {
                        me.auteur_jmj ={};
                        var options_auteur = {
                            siteId: $scope.rubedo.current.site.id,
                            pageId: $scope.rubedo.current.page.id
                        };
                        RubedoContentsService.getContentById(me.content.fields.author_jmj, options_auteur).then(
                            function(response){
                                if(response.data.success){
                                    me.auteur_jmj = response.data.content;
                                }
                            });
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
                                    me.detailTemplate=themePath+'/templates/blocks/contentDetail/'+me.content.type.code+".html";
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
            $scope.rubedo.addNotification("success","Success","Contents updated.");
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
                    $scope.rubedo.addNotification("success","Success","Content updated.");
                } else {
                    $scope.rubedo.addNotification("danger","Error","Content update error.");
                }

            },
            function(response){
                $scope.rubedo.addNotification("danger","Error","Content update error.");
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
    /*pour albums photos*/
    me.gallery.start = 0;
    me.gallery.limit = config.pageSize?config.pageSize:9;
    me.gallery.currentIndex = 0;
    me.gallery.actualPage = 1;
    me.gallery.nbImages = angular.copy(me.gallery.limit);
    me.changePage = function(side){
        if(side == 'left' && (me.gallery.start - me.gallery.limit  >= 0) ){
            me.gallery.currentIndex= me.gallery.start-1;
            me.gallery.start -= me.gallery.limit;
        } else if(side == 'right' && (me.gallery.start + me.gallery.nbImages < me.gallery.count) ) {
            me.gallery.start += me.gallery.nbImages;
            me.gallery.currentIndex= me.gallery.start;
        }
        if (me.gallery.start + me.gallery.nbImages>=me.gallery.count) {
            me.gallery.nbImages = me.gallery.count- me.gallery.start;
        }
        else{me.gallery.nbImages =me.gallery.limit ;}
    };

}]);
