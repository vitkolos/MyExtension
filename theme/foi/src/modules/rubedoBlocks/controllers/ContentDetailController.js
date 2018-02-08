angular.module("rubedoBlocks").lazy.controller("ContentDetailController",["$scope","RubedoContentsService","RubedoPagesService","RubedoSearchService","RubedoUsersService","$http","$route","$rootScope",
																																																																										function($scope, RubedoContentsService,RubedoPagesService,RubedoSearchService,RubedoUsersService,$http,$route,$rootScope){
    var me = this;
    var config = $scope.blockConfig;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    $scope.isClient = false;
				me.taxonomy=[];
    var previousFields;
    $scope.fieldInputMode=false;
    $scope.$watch('rubedo.fieldEditMode', function(newValue) {
        $scope.fieldEditMode=me.content&&me.content.readOnly ? false : newValue;

    });
    me.getFieldByName=function(name){
        var field=null;
        angular.forEach(me.content.type.fields,function(candidate){
            if (candidate.config.name==name){
                field=candidate;
            }
        });
        return field;
    };
    
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
                    console.log(me.content);
                    $scope.fieldIdPrefix="contentDetail"+me.content.type.type;
                    if (config.isAutoInjected){
                        if (me.content.fields.text){
                            $scope.rubedo.setPageTitle(angular.copy(me.content.fields.text));
                        }
                        if (me.content.fields.summary){
                            $scope.rubedo.setPageDescription(angular.copy(me.content.fields.summary));
                        }
                        var foundMeta=false;
                        angular.forEach(me.content.type.fields,function(field){
                            if(!foundMeta&&field.config&&field.config.useAsMetadata&&me.content.fields[field.config.name]&&me.content.fields[field.config.name]!=""){
                                $scope.rubedo.setPageMetaImage(angular.copy(me.content.fields[field.config.name]));
                                foundMeta=true;
                            }
                        });
                    }
                    $scope.fieldEntity=angular.copy(me.content.fields);
                    
                    
                    /*Vérifier les droits du client et limiter le texte si besoin pour les actualites et les articles FOI*/
                    /*et seulement pour des articles publiés il y a moins de 3 mois*/
                    var today = new Date();
                    console.log((today.getTime() - me.content.createTime*1000)>1000*3600*24*90);
																				
																				if(me.content.type.code=="foi") {
																								console.log("FOI");
																								me.numero_issuu = me.content.fields.idIssuu;
																								me.contenuSommaire();
																				}
																				
																					if(me.content.type.code=="article_foi"){
																								var date = new Date();
																								me.currentDate = date.getTime();
																								me.numeroFoi=me.content.fields.numero_foi;
																								console.log('articleFoi');
																								console.log(me.content);
																								console.log('numeroFoi');
																								console.log(me.numeroFoi);
																								//me.titreSommaire(me.numeroFoi);
																								me.buildSommaire();
																				}
                    
                    if((me.content.type.code=="actualites" || me.content.type.code=="article_foi") && (today.getTime() - me.content.createTime*1000)<1000*3600*24*90) me.isClient();
                    
                    me.oldArticle = true;
                    if ((today.getTime() - me.content.createTime*1000)<1000*3600*24*90) {me.oldArticle=false;
                    };
                    console.log(me.oldArticle);
                    
                    
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
                        //$http.get(themePath+'/templates/blocks/contentDetail/)
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
    
    
    me.isClient = function (){
        if ($scope.rubedo.current.user && $scope.rubedo.current.user.rights.canEdit) {
           $scope.isClient=true;
           console.log($scope.rubedo.current.user);
        }
        else if ($scope.rubedo.current.user) {
            RubedoUsersService.getUserById($scope.rubedo.current.user.id).then(
                function(response){
                    if(response.data.success){
                        if (response.data.user.groups.includes("596e2e483965889a1f7bf6d1", "5811a9422456404d018bcde0")){
                            $scope.isClient=true;
                        }
                        else{
                            var limit = $scope.fieldEntity['richText'].indexOf("</p>",$scope.fieldEntity['richText'].length*0.1)+4;
                            $scope.fieldEntity['richText'] =$scope.fieldEntity['richText'].substring(0,limit);
                        }
                    }
                }
            )
        }
        else {
             var limit = $scope.fieldEntity['richText'].indexOf("</p>",$scope.fieldEntity['richText'].length*0.1)+4;
             $scope.fieldEntity['richText'] =$scope.fieldEntity['richText'].substring(0,limit);
        }
    };
				
				
				/*ARTICLE FOI*/
																/*INFORMATIONS SUR LES ARTICLES*/
																	me.buildSommaire = function(){
																		var optionsSommaire = {
																				constrainToSite:false,
																				siteId: $scope.rubedo.current.site.id,
																				pageId: $scope.rubedo.current.page.id,
																				predefinedFacets:{"type":"5a114b5c396588e62456706b","numero_foi":me.numeroFoi},
																				start:0,
																				limit:50,
																				orderby:'taxonomy.5a114f1b396588d22856706f',
																				orderbyDirection:'asc',
																				displayedFacets:"['all']"
																		};
																		RubedoSearchService.searchByQuery(optionsSommaire).then(function(response){
																				if(response.data.success){
																						me.accesArticles = response.data.results;
																						console.log('accesArticles');
																						console.log(response.data.results);
																				} 
																		});
																};
				
																///*INFORMATIONS FOI*/
																//me.titreSommaire = function(numeroFoi){
																//				me.getContentById(numeroFoi);
																//				me.foiContents = me.content;
																//				console.log('infos FOI');
																//				console.log(me.foiContents);
																//};

				
				
				/*FOI*/
																/*INFORMATIONS SUR LES ARTICLES*/ 
																	me.contenuSommaire = function(){
																		var optionsSommaire = {
																				constrainToSite:false,
																				siteId: $scope.rubedo.current.site.id,
																				pageId: $scope.rubedo.current.page.id,
																				predefinedFacets:{"type":"5a114b5c396588e62456706b","numero_foi":config.contentId},
																				start:0,
																				limit:50,
																				orderby:'taxonomy.5a114f1b396588d22856706f',
																				orderbyDirection:'asc',
																				displayedFacets:"['all']"
																		};
																		RubedoSearchService.searchByQuery(optionsSommaire).then(function(response){
																				if(response.data.success){
																						me.infoArticles = response.data.results;
																						console.log('infoArticles');
																						console.log(response.data.results);
																				} 
																		});
																};
																if (me.infoArticles) {
																				me.index = $scope.$index;
																				console.log('me.index');
																						console.log(me.index);
																						if (me.index !== 0) {
																												me.contentPrec = me.infoArticles.data[me.index-1];
																												console.log(me.contentPrec);
																								}
																}
																							
				
				 
					
					
}]);
