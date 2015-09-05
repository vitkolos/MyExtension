angular.module("rubedoBlocks").lazy.controller("ContentContributionController",["$scope","RubedoContentsService","RubedoContentTypesService","$location","RubedoPagesService",function($scope,RubedoContentsService,RubedoContentTypesService,$location,RubedoPagesService){
    var me=this;
    var config = $scope.blockConfig;
    $scope.fieldInputMode=true;
    $scope.fieldEntity={
        taxonomy:{}
    };
    var options={
        includeTaxonomy:true
    };
    me.submitStatus=null;
    me.loadContentType=function(ctId){
        RubedoContentTypesService.findById(ctId,options).then(
            function(response){
                if(response.data.success){
                    me.contentType=response.data.contentType;
                    $scope.fieldIdPrefix="contentContribution"+me.contentType.type;
                    me.contentType.fields.unshift({
                        cType:"textarea",
                        config:{
                            name:"summary",
                            fieldLabel:$scope.rubedo.translate("Label.Summary", "Summary"),
                            allowBlank:true
                        }
                    });
                    me.contentType.fields.unshift({
                        cType:"textfield",
                        config:{
                            name:"text",
                            fieldLabel:$scope.rubedo.translate("Label.Title", "Title"),
                            allowBlank:false
                        }
                    });
                    $scope.fields=me.contentType.fields;
                    $scope.vocabularies=me.contentType.completeVocabularies;
                }
            }
        );
    };
    if($location.search()["content-edit"]){
        RubedoContentsService.getContentById($location.search()["content-edit"],{useDraftMode:true}).then(
            function(ecResponse){
                if (ecResponse.data.success){
                    me.existingContent=ecResponse.data.content;
                    var initialValues=angular.copy(me.existingContent.fields);
                    initialValues.taxonomy=angular.copy(me.existingContent.taxonomy);
                    if(angular.element.isEmptyObject(initialValues.taxonomy)){
                        initialValues.taxonomy={};
                    }
                    $scope.fieldEntity=angular.copy(initialValues);
                    me.updateMode=true;
                    me.loadContentType(me.existingContent.type.id);
                }
            }
        );
    } else if (config.contentType&&config.contentType!=""){
        me.loadContentType(config.contentType);
    }
    me.submitNewContent=function(){
        if(me.contentType&&me.submitStatus){
            me.createError=null;
            var formData=angular.copy($scope.fieldEntity);
            if (me.updateMode){
                var payload=angular.copy(me.existingContent);
                delete (payload.type);
                payload.status=me.submitStatus;
                payload.taxonomy=formData.taxonomy;
                delete (formData.taxonomy);
                payload.fields=formData;
                RubedoContentsService.updateContent(payload).then(
                    function(response){
                        if (response.data.success){
                            me.existingContent.version = response.data.version;
                            $scope.rubedo.addNotification("success",$scope.rubedo.translate("Block.Success", "Success !"),$scope.rubedo.translate("Blocks.Contrib.Status.ContentUpdated", "Content updated"));
                            if (config.listPageId){
                                RubedoPagesService.getPageById(config.listPageId).then(function(response2){
                                    if (response2.data.success){
                                        $location.url(response2.data.url);
                                    }
                                });
                            }
                        } else {
                            $scope.rubedo.addNotification("danger",$scope.rubedo.translate("Block.Error", "Error !"),$scope.rubedo.translate("Blocks.Contrib.Status.UpdateError", "Content update error"));
                        }

                    },
                    function(response){
                        $scope.rubedo.addNotification("danger",$scope.rubedo.translate("Block.Error", "Error !"),$scope.rubedo.translate("Blocks.Contrib.Status.UpdateError", "Content update error"));
                    }
                );

            } else {
                var payLoad={
                    status:me.submitStatus,
                    typeId:me.contentType.id,
                    taxonomy:formData.taxonomy
                };
                delete (formData.taxonomy);
                payLoad.fields=formData;
                payLoad.taxonomy.navigation = array(config.listPageId);
                RubedoContentsService.createNewContent(payLoad).then(
                    function(createResponse){
                        if (createResponse.data.success){
                            $scope.rubedo.addNotification("success",$scope.rubedo.translate("Block.Success", "Success !"),$scope.rubedo.translate("Blocks.Contrib.Status.ContentCreated", "Content created"));
                            $scope.fieldEntity={
                                taxonomy:{}
                            };
                            if (config.listPageId){
                                RubedoPagesService.getPageById(config.listPageId).then(function(response2){
                                    if (response2.data.success){
                                        $location.url(response2.data.url);
                                    }
                                });
                            }

                        }else{
                            $scope.rubedo.addNotification("danger",$scope.rubedo.translate("Block.Error", "Error !"),$scope.rubedo.translate("Blocks.Contrib.Status.CreateError", "Content creation error"));
                            me.createError={
                                type:"error",
                                text:createResponse.data.message
                            };
                        }
                    },
                    function(createResponse){
                        $scope.rubedo.addNotification("danger",$scope.rubedo.translate("Block.Error", "Error !"),$scope.rubedo.translate("Blocks.Contrib.Status.CreateError", "Content creation error"));
                        me.createError={
                            type:"error",
                            text:createResponse.data.message
                        };
                    }
                );
            }
        }
    };
}]);