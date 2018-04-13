//angular.module("rubedoBlocks").lazy.controller("ContentDetailController",["$scope","RubedoContentsService","$http","$route","$rootScope",function($scope, RubedoContentsService,$http,$route,$rootScope){
//    var me = this;
//    var config = $scope.blockConfig;
//    var themePath="/theme/"+window.rubedoConfig.siteTheme;
//    var previousFields;
//    $scope.fieldInputMode=false;
//    $scope.$watch('rubedo.fieldEditMode', function(newValue) {
//        $scope.fieldEditMode=me.content&&me.content.readOnly ? false : newValue;
//
//    });
//    me.getFieldByName=function(name){
//        var field=null;
//        angular.forEach(me.content.type.fields,function(candidate){
//            if (candidate.config.name==name){
//                field=candidate;
//            }
//        });
//        return field;
//    };
//	me.getLabelByName=function(name){
//        var field=null;
//        angular.forEach(me.content.type.fields,function(candidate){
//            if (candidate.config.name==name){
//                field=candidate;
//            }
//        });
//        return field.config.fieldLabel;
//    };
//    me.getContentById = function (contentId){
//        var options = {
//            siteId: $scope.rubedo.current.site.id,
//            pageId: $scope.rubedo.current.page.id
//        };
//        RubedoContentsService.getContentById(contentId, options).then(
//            function(response){
//                if(response.data.success){
//                    $scope.rubedo.current.page.contentCanonicalUrl = response.data.content.canonicalUrl;
//                    me.content=response.data.content;
//                    $scope.fieldIdPrefix="contentDetail"+me.content.type.type;
//                    if (config.isAutoInjected){
//                        if (me.content.fields.text){
//                            $scope.rubedo.setPageTitle(angular.copy(me.content.fields.text));
//                        }
//                        if (me.content.fields.summary){
//                            $scope.rubedo.setPageDescription(angular.copy(me.content.fields.summary));
//                        }
//                        var foundMeta=false;
//                        angular.forEach(me.content.type.fields,function(field){
//                            if(!foundMeta&&field.config&&field.config.useAsMetadata&&me.content.fields[field.config.name]&&me.content.fields[field.config.name]!=""){
//                                $scope.rubedo.setPageMetaImage(angular.copy(me.content.fields[field.config.name]));
//                                foundMeta=true;
//                            }
//                        });
//                    }
//                    $scope.fieldEntity=angular.copy(me.content.fields);
//                    $scope.fieldLanguage=me.content.locale;
//                    if (me.content.isProduct){
//                        me.content.type.fields.unshift({
//                            cType:"productBox",
//                            config:{
//                                name:"productBox"
//                            }
//                        });
//                        $scope.productProperties=angular.copy(me.content.productProperties);
//                        $scope.manageStock=angular.copy(me.content.type.manageStock);
//                        $scope.productId=angular.copy(me.content.id);
//                    }
//                    me.content.type.fields.unshift({
//                        cType:"title",
//                        config:{
//                            name:"text",
//                            fieldLabel:"Title",
//                            allowBlank:false
//                        }
//                    });
//                    $scope.rubedo.current.breadcrumb.push({title:response.data.content.text});
//                    if (me.content.type.activateDisqus&&$scope.rubedo.current.site.disqusKey){
//                        me.activateDisqus=true;
//                        me.disqusShortname=$scope.rubedo.current.site.disqusKey;
//                        me.disqusIdentifier=me.content.id;
//                        me.disqusUrl=window.location.href;
//                        me.disqusTitle=me.content.text;
//                    }
//                    me.customLayout=null;
//                    if (angular.isArray(me.content.type.layouts)){
//                        angular.forEach(me.content.type.layouts,function(layout){
//                            if (layout.active&&layout.site==$scope.rubedo.current.site.id){
//                                me.customLayout=layout;
//                            }
//                        });
//                    }
//                    if(me.customLayout){
//                        me.content.type.fields.unshift({
//                            cType:"textarea",
//                            config:{
//                                name:"summary",
//                                fieldLabel:"Summary",
//                                allowBlank:false
//                            }
//                        });
//                        me.detailTemplate=me.customLayout.customTemplate?themePath+'/templates/blocks/contentDetail/customTemplate.html':themePath+'/templates/blocks/contentDetail/customLayout.html';
//                    } else {
//                        if(me.content.type.code&&me.content.type.code!=""){
//                            $http.get(themePath+'/templates/blocks/contentDetail/'+me.content.type.code+".html").then(
//                                function (response){
//                                    me.detailTemplate=themePath+'/templates/blocks/contentDetail/'+me.content.type.code+".html";
//                                    $scope.fields=me.transformForFront(me.content.type.fields);
//                                    $scope.clearORPlaceholderHeight();
//                                },
//                                function (response){
//                                    me.detailTemplate=themePath+'/templates/blocks/contentDetail/default.html';
//                                    $scope.fields=me.transformForFront(me.content.type.fields);
//                                    $scope.clearORPlaceholderHeight();
//                                }
//                            );
//                        } else {
//                            me.detailTemplate=themePath+'/templates/blocks/contentDetail/default.html';
//                            $scope.fields=me.transformForFront(me.content.type.fields);
//                            $scope.clearORPlaceholderHeight();
//                        }
//                        $http.get(themePath+'/templates/blocks/contentDetail/)
//                    }
//                    if(me.content.clickStreamEvent&&me.content.clickStreamEvent!=""){
//                        $rootScope.$broadcast("ClickStreamEvent",{csEvent:me.content.clickStreamEvent});
//                    }
//                }
//            }
//        );
//    };
//    if (config.contentId){
//        me.getContentById(config.contentId);
//    }
//    me.revertChanges=function(){
//        $scope.fieldEntity=angular.copy(previousFields);
//    };
//    me.registerEditChanges=function(){
//        $scope.rubedo.registerEditCtrl(me);
//    };
//    me.launchFullEditor=function(){
//        var modalUrl = "/backoffice/content-contributor?edit-mode=true&content-id="+me.content.id+"&workingLanguage="+$route.current.params.lang;
//        var availHeight=window.innerHeight*(90/100);
//        var properHeight=Math.max(400,availHeight);
//        var iframeHeight=properHeight-10;
//        angular.element("#content-contribute-frame").empty();
//        angular.element("#content-contribute-frame").html("<iframe style='width:100%;  height:"+iframeHeight+"px; border:none;' src='" + modalUrl + "'></iframe>");
//        angular.element('#content-contribute-modal').appendTo('body').modal('show');
//        window.confirmContentContribution=function(){
//            angular.element("#content-contribute-frame").empty();
//            angular.element('#content-contribute-modal').modal('hide');
//            $scope.rubedo.addNotification("success",$scope.rubedo.translate("Block.Success"),$scope.rubedo.translate("Blocks.Contrib.Status.ContentUpdated"));
//            me.getContentById(me.content.id);
//        };
//        window.cancelContentContribution=function(){
//            angular.element("#content-contribute-frame").empty();
//            angular.element('#content-contribute-modal').modal('hide');
//        };
//    };
//    me.persistChanges=function(){
//        var payload=angular.copy(me.content);
//        payload.fields=transformForPersist();
//        delete (payload.type);
//        RubedoContentsService.updateContent(payload).then(
//            function(response){
//                if (response.data.success){
//                    me.content.version = response.data.version;
//                    $scope.rubedo.addNotification("success",$scope.rubedo.translate("Block.Success"),$scope.rubedo.translate("Blocks.Contrib.Status.ContentUpdated"));
//                } else {
//                    $scope.rubedo.addNotification("danger",$scope.rubedo.translate("Block.Error"),$scope.rubedo.translate("Blocks.Contrib.Status.UpdateError"));
//                }
//
//            },
//            function(response){
//                $scope.rubedo.addNotification("danger",$scope.rubedo.translate("Block.Error"),$scope.rubedo.translate("Blocks.Contrib.Status.UpdateError"));
//            }
//        );
//    };
//    var transformForPersist = function(){
//        var returnFields = angular.copy(me.content.fields);
//        angular.forEach(me.content.fields, function(field, fieldKey){
//            if(angular.isArray(field)){
//                angular.forEach(field, function(fld, fldKey){
//                    if(fldKey === 0){
//                        returnFields[fieldKey][fldKey]=$scope.fieldEntity[fieldKey];
//                    } else {
//                        returnFields[fieldKey][fldKey]=$scope.fieldEntity[fieldKey+fldKey];
//                    }
//                })
//            } else {
//                returnFields[fieldKey] = $scope.fieldEntity[fieldKey];
//            }
//        });
//        return returnFields;
//    };
//    me.transformForFront = function(fieldsType){
//        var res = [];
//        angular.forEach(fieldsType, function(fieldTp){
//            var fieldType;
//            if(!fieldTp.config&&fieldTp.name){
//                fieldTp.field=me.getFieldByName(fieldTp.name);
//                fieldType = fieldTp.field;
//            } else {
//                fieldType = fieldTp;
//            }
//            res.push(fieldTp);
//            if(angular.isArray(me.content.fields[fieldType.config.name])&&fieldType.config.multivalued){
//                var fields = $scope.fieldEntity[fieldType.config.name];
//                angular.forEach(fields, function(fld, keyFld){
//                    if(keyFld === 0){
//                        $scope.fieldEntity[fieldType.config.name] = me.content.fields[fieldType.config.name][keyFld];
//                    } else {
//                        var name = fieldType.config.name + keyFld;
//                        var newField = angular.copy(fieldTp);
//                        if(!newField.config&&newField.name){
//                            newField.field = angular.copy(fieldType);
//                            newField.field.config.name = name;
//                        } else {
//                            newField.config.name = name;
//                        }
//                        res.push(newField);
//                        $scope.fieldEntity[name] = me.content.fields[fieldType.config.name][keyFld];
//                    }
//                });
//            }
//        });
//        previousFields = angular.copy($scope.fieldEntity);
//        return res;
//    };
//    $scope.registerFieldEditChanges=me.registerEditChanges;
//				
//				Albums photos
//				if (me.content.type.code=="album" || me.content.type.code=="actualites") {
//								me.currentIndex=0;
//								me.loadModal = function(index,embedded){
//												me.currentIndex = index;
//												if(embedded) me.currentImage = me.content.fields.embeddedImages[me.currentIndex];
//												else me.currentImage = me.content.fields.images[me.currentIndex];
//								};
//								me.changeImage = function(side,embedded){
//												if(side == 'left' && me.currentIndex > 0){
//																me.currentIndex -= 1;
//												} else if(side == 'right'){
//																me.currentIndex += 1;
//												}
//												if(embedded) me.currentImage = me.content.fields.embeddedImages[me.currentIndex]; 
//												else me.currentImage = me.content.fields.images[me.currentIndex];
//								};
//								me.changeImageKey = function($event,embedded){
//												if ($event.keyCode == 39) { 
//															me.changeImage('right',embedded);
//												}
//								
//												else if ($event.keyCode == 37) {
//															me.changeImage('left',embedded);
//												}
//								};
//
//				}
//			
//				
//				
//				
//}]);


angular.module("rubedoBlocks").lazy.controller("ContentDetailController",["$scope","RubedoContentsService","$http","$route","$rootScope",function($scope, RubedoContentsService,$http,$route,$rootScope){
    var me = this;
    var config = $scope.blockConfig;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
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
				
				/*Pour ajouter un menu secondaire*/
    RubedoMenuService.getMenu(pageId, config.menuLevel).then(function(response){
        if (me.numeroBlock=="1") {
            me.numeroBlock++;
            if (response.data.success){
                me.menu=response.data.menu;
																var lang = $route.current.params.lang;
                angular.forEach(me.menu.blocks, function(block, key2){
                    if (block.bType=="contentDetail" && block.orderValue<=1) {
                        me.pageBlock[key2]=[];
                        console.log("block");
                        console.log(block);
                        if(block.i18n[lang]) {me.pageBlock[key2].push({"title":block.i18n[lang].title,"code":(block.code).split("/")[1],"order":(block.code).split("/")[0],"color":key2%3});}
                        else {me.pageBlock[key2].push({"title":block.title,"code":(block.code).split("/")[1],"order":(block.code).split("/")[0],"color":key2%3});}

                        //if(block.i18n[lang]) me.pagesBlocks[key].blocks.push({"title":block.i18n[lang].title,"code":(block.code).split("/")[1],"order":(block.code).split("/")[0]});
                        //else me.pagesBlocks[key].blocks.push({"title":block.i18n.fr.title});
                    }
                    else {}
                });
            $scope.clearORPlaceholderHeight();
            console.log("menu");
            console.log(me.menu);
            console.log("pageBlock");
            console.log(me.pageBlock);
            }
												else {
                me.menu={};
																$scope.clearORPlaceholderHeight();
            }
        }
    });
				
	me.getLabelByName=function(name){
        var field=null;
        angular.forEach(me.content.type.fields,function(candidate){
            if (candidate.config.name==name){
                field=candidate;
            }
        });
        return field.config.fieldLabel;
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
																				//Albums photos
																				if (me.content.type.code=="album") {
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