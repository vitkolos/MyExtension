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
    me.showForm =  angular.copy(me.updateMode);

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
                    // edit seulement les contenus du bon type si un type de contenu est configurŽ
                    if(config.contentType&&config.contentType!=""){
                        if(ecResponse.data.content.type.id==config.contentType) {
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
                    else {
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
                                RubedoPagesService.getPageById(config.listPageId).then(function(response){
                                    if (response.data.success){
                                        $location.url(response.data.url);
                                    }
                                });
                            }
                            else {
                                RubedoPagesService.getPageById($scope.rubedo.current.page.id).then(function(response){
                                    if (response.data.success){
                                        $location.url(response.data.url);
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
                if (me.imagesForAlbum && me.imagesForAlbum.length>0) {
                    payLoad.fields.images=angular.copy(me.imagesForAlbum);
                }
                payLoad.taxonomy.navigation = [];
                payLoad.taxonomy.navigation[0] = config.listPageId ? config.listPageId : $scope.rubedo.current.page.id;
                RubedoContentsService.createNewContent(payLoad).then(
                    function(createResponse){
                        if (createResponse.data.success){
                            $scope.rubedo.addNotification("success",$scope.rubedo.translate("Block.Success", "Success !"),$scope.rubedo.translate("Blocks.Contrib.Status.ContentCreated", "Content created"));
                            $scope.fieldEntity={
                                taxonomy:{}
                            };
                            if (config.listPageId){
                                RubedoPagesService.getPageById(config.listPageId).then(function(response){
                                    if (response.data.success){
                                        $location.url(response.data.url);
                                    }
                                });
                            }
                            else {
                                RubedoPagesService.getPageById($scope.rubedo.current.page.id).then(function(response){
                                    if (response.data.success){
                                        $location.url(response.data.url);
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
    
/*Watch lieuCommunautaire */
    me.updatePosition = function(contents){
        angular.forEach(contents, function(content){
            if (content.id==$scope.fieldEntity['lieuCommunautaire']) {
                $scope.fieldEntity['position'] = content['fields.position.address'][0];
                console.log($scope.fieldEntity['position']);
            }
        });
        
    };      
    
}]);



angular.module("rubedoBlocks").lazy.controller("AlbumUploadController",["$scope","RubedoMediaService","$element",'RubedoPagesService','$http','$location',function($scope,RubedoMediaService,$element,RubedoPagesService,$http,$location){
    var me=this;
    me.workspace="";
    me.pageId = $scope.blockConfig.listPageId ? $scope.blockConfig.listPageId : $scope.rubedo.current.page.id;
    $scope.ccCtrl.imagesForAlbum=[];
        if (me.pageId&&mongoIdRegex.test(me.pageId)) {
            RubedoPagesService.getPageById(me.pageId).then(function(response){
                if (response.data.success){
                    me.pageUrl=response.data.url;
                    $http.get("/api/v1/pages",{
                        params:{
                            site:$location.host(),
                            route:(me.pageUrl).substr(4)
                        }
                    }).then(function(response){if(response.data.success) {me.workspace= response.data.page.workspace; }});
                };
            });
        };
    
    me.newFiles=null;
    var nbOfImages = 0;
    me.progress = 0;
    me.uploadNewFiles=function(){
       me.notification=null;
       me.progress=1;
       nbOfImages = me.newFiles.length;
       if ($scope.fieldInputMode&&me.newFiles){
           var uploadOptions={
               typeId:"545cd95245205e91168b45b1",
                target:me.workspace
           };
            angular.forEach(me.newFiles, function(file, index) {
                var options = angular.copy(uploadOptions);
                if (me.title && me.title!="") {
                    options.fields={title : me.title+'_'+index};
                }
                else {
                    options.fields={title : file.name};
                }
                RubedoMediaService.uploadMedia(file,options).then(
                    function(response){
                        if (response.data.success){
                            var id=response.data.media.id;
                            ($scope.ccCtrl.imagesForAlbum).push(id);
                            me.progress += 100* 1/nbOfImages;
                        } else {
                            console.log(response);
                            me.notification={
                                type:"error",
                                text:response.data.message
                            };
                        }
                    },
                    function(response){
                        console.log(response);
                        me.notification={
                            type:"error",
                            text:response.data.message
                        };
                    }
                );
            });
       }

    };
    if ($scope.fieldInputMode){
        $element.find('.form-control').on('change', function(){
            setTimeout(function(){
                me.uploadNewFiles();
            }, 200);
        });
    }
}]);
