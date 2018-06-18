angular.module("rubedoBlocks").lazy.controller("ContentDetailController",["$scope","RubedoContentsService","RubedoPagesService","TaxonomyService","RubedoSearchService","RubedoUsersService","$http","$route","$rootScope",
																																																																										function($scope, RubedoContentsService,RubedoPagesService,TaxonomyService,RubedoSearchService,RubedoUsersService,$http,$route,$rootScope){
    var me = this;
    var config = $scope.blockConfig;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    $scope.isClient = false;
				$scope.isVisiteur=false;
				$scope.isOld=true;
				$scope.isRestricted=false;
				$scope.pageRevueEnCours = false;
				$scope.taxonomies = {};
				$scope.displayTaxo = {};
				$scope.displayLienArticle = {};
				$scope.classementArticle=0;
				$scope.finListe=false;
				$scope.nomCategorie = "rubrique";
				me.taxonomy=[];
				me.tooltips=function(){
        $('[data-toggle="tooltip"]').tooltip();
    }
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
				me.getTermInTaxo=function(taxoKey,termId){
        console.log("me.taxo");
console.log(me.taxo);
        if(!me.taxo){return(null);} // pas de taxonomie pour ce type de contenu
        var term=null;
        angular.forEach(me.taxo[taxoKey],function(candidate){ // chercher l'id dans les taxonomies de ce type de contenu si 
            if(!term){
                if(candidate.id==termId){term=candidate.text;}
            }
         });
         if(!term) term = termId; //pour les taxos extensibles, l'id est le terme cherché
    return(term);
console.log("term");
console.log(term);
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
                    
                    
                    /*Vérifier les droits du client et limiter le texte si besoin pour les actualites et les articles FOI*/
                    /*et seulement pour des articles publiés il y a moins de 3 mois*/
                    var today = new Date();
                    console.log((today.getTime() - me.content.createTime*1000)>1000*3600*24*90);
																				
																				if(me.content.type.code=="foi") {
																								console.log("FOI");
																								 if ($scope.rubedo.current.page.id=="5a7dcda63965886233eefde7") {
																												$scope.pageRevueEnCours=true;
																									}
																								me.numero_issuu = me.content.fields.idIssuu;
																								me.contenuSommaire();
																				}
																				
																					if(me.content.type.code=="article_foi"){
																								var date = new Date();
																								me.currentDate = date.getTime();
																								me.numeroFoi=me.content.fields.numero_foi;
																								//me.titreSommaire(me.numeroFoi);
																								me.buildSommaire();
																				}
																				
																				me.oldArticle = true;
                    if ((today.getTime() - me.content.createTime*1000)<1000*3600*24*2) {me.oldArticle=false;
                    };
                    
                    if(me.content.type.code=="actualites" || me.content.type.code=="article_foi") {me.isClient(me.oldArticle);}
                    
                    
                    
                    
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
    
    
    me.isClient = function (oldArticle){
								console.log("lancement fonction isClient");
								console.log("oldArticle");
								console.log(oldArticle);
        if ($scope.rubedo.current.user && $scope.rubedo.current.user.rights.canEdit) {
           $scope.isClient=true;
											$scope.isVisiteur=true;
											console.log("isClient");
												console.log($scope.isClient);
												console.log("isVisiteur");
												console.log($scope.isVisiteur); 
        }
        else if ($scope.rubedo.current.user) {
            RubedoUsersService.getUserById($scope.rubedo.current.user.id).then(
                function(response){
                    if(response.data.success){
                        if (response.data.user.groups.includes("596e2e483965889a1f7bf6d1")){
                            $scope.isClient=true;
																												$scope.isVisiteur=true;
																												console.log("Abonné FOI");
																												console.log("596e2e483965889a1f7bf6d1");
																												console.log(response.data.user.groups);
																												console.log("isClient");
																												console.log($scope.isClient);
																												console.log("isVisiteur");
																												console.log($scope.isVisiteur); 
                        }
																								/* 58e0b676245640ef008bb635 == groupe Revue FOI */
																								else if (response.data.user.groups.includes("58e0b676245640ef008bb635")){
                            $scope.isVisiteur=true;
																												if (!oldArticle) {
																															var limit = Math.trunc($scope.fieldEntity['richText'].length*0.2);
																															$scope.fieldEntity['richText'] =$scope.fieldEntity['richText'].substring(0,limit) + "...</p>";
																																$scope.isRestricted=true;
																															$scope.isOld=false;
																															console.log("isOld");
																															console.log($scope.isOld);
																												}
																												console.log("Simple visiteur");
																												console.log("5a870ea739658802628b4567");
																												console.log(response.data.user.groups);
																												console.log("isClient");
																												console.log($scope.isClient);
																												console.log("isVisiteur");
																												console.log($scope.isVisiteur);
																												console.log("response.data.user");
																												console.log(response.data.user);
                        }
                        else{
                            var limit = Math.trunc($scope.fieldEntity['richText'].length*0.2);
																												$scope.fieldEntity['richText'] =$scope.fieldEntity['richText'].substring(0,limit) + "...</p>";
																													$scope.isRestricted=true;
																												console.log("Autre");
																													console.log("Abonné : 596e2e483965889a1f7bf6d1");
																												console.log("Visiteur : 5a870ea739658802628b4567");
																												console.log(response.data.user.groups);
																												console.log("isClient");
																												console.log($scope.isClient);
																												console.log("isVisiteur");
																												console.log($scope.isVisiteur);
                        }
                    }
                }
            )
        }
        else {
             /*var limit = $scope.fieldEntity['richText'].indexOf("<br />",$scope.fieldEntity['richText'].length*0.1)+6;*/
													var limit = Math.trunc($scope.fieldEntity['richText'].length*0.2);
													$scope.fieldEntity['richText'] =$scope.fieldEntity['richText'].substring(0,limit) + "...</p>";
													$scope.isRestricted=true;
													console.log("limit");
													console.log(limit);
													console.log("$scope.fieldEntity['richText'");
													console.log($scope.fieldEntity['richText']);
													console.log(" Encore autre");
												console.log("Abonné : 596e2e483965889a1f7bf6d1");
											console.log("Visiteur : 5a870ea739658802628b4567");
											console.log("isClient");
											console.log($scope.isClient);
											console.log("isVisiteur");
											console.log($scope.isVisiteur);
        }
    };
				
				
				/*ARTICLE FOI*/
																/*INFORMATIONS SUR LES ARTICLES*/
																	me.buildSommaire = function(){
																 var ind=0;
																	var count=0;
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
																						angular.forEach(me.accesArticles.data,function(data, key){
																																$scope.taxonomies[ind]=me.accesArticles.data[ind]['taxonomy.5a114f1b396588d22856706f'][0];
																																if ($scope.taxonomies[ind]===$scope.taxonomies[ind-1] && ind!==0) {
																																																		$scope.displayTaxo[ind]= false;
																																														} else {
																																																		$scope.displayTaxo[ind]= true;
																																														}
																																if ($scope.taxonomies[ind]===me.content.taxonomy['5a114f1b396588d22856706f'][0] || $scope.taxonomies[ind]===me.content.taxonomy['5a114f1b396588d22856706f']){
																																				if(me.content.id!==data.id && count<3) {
																																																		$scope.displayLienArticle[ind]= true;
																																																		count++;
																																														} else {
																																																		$scope.displayLienArticle[ind]= false;
																																														}
																																}
																																if (me.content.id===data.id) {
																																																		$scope.classementArticle= ind;
																																																			
																																}
																																if (me.accesArticles.data.length===$scope.classementArticle+1) {
																																																				$scope.finListe=true;
																																} 
																																ind++;
																							});
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
																		var ind=0;
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
																								angular.forEach(me.infoArticles.data,function(data, key){
																																$scope.taxonomies[ind]=me.infoArticles.data[ind]['taxonomy.5a114f1b396588d22856706f'][0];
																																if ($scope.taxonomies[ind]===$scope.taxonomies[ind-1] && ind!==0) {
																																																		$scope.displayTaxo[ind]= false;
																																														} else {
																																																		$scope.displayTaxo[ind]= true;
																																														}
																																ind++;
																							});
																				} 
																		});														
																};					
}]);
