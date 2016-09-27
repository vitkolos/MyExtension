angular.module("rubedoBlocks").lazy.controller("ContentContributionController",["$scope","RubedoContentsService","RubedoContentTypesService","$location","$route","RubedoPagesService",function($scope,RubedoContentsService,RubedoContentTypesService,$location,$route,RubedoPagesService){
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
                    $scope.clearORPlaceholderHeight();
                }
            }
        );
    };
    if($location.search()["content-edit"]){
        RubedoContentsService.getContentById($location.search()["content-edit"],{useDraftMode:true}).then(
            function(ecResponse){
                if (ecResponse.data.success){
                    // edit seulement les contenus du bon type si un type de contenu est configuré
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
                                        $route.reload();
                                    }
                                });
                            }
                            else {
                                RubedoPagesService.getPageById($scope.rubedo.current.page.id).then(function(response){
                                    if (response.data.success){
                                        $location.url(response.data.url);
                                        $route.reload();
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
                                $route.reload();
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
                if ($scope.fieldEntity['position']) {
                        $scope.fieldEntity['position'].address = content['fields.position.address'][0];
                }
                else $scope.fieldEntity['position']={'address' :  content['fields.position.address'][0]};

                $scope.fieldEntity['positionName'] = content['text'][0];
                
            }
        });
        
    };      
    
}]);



angular.module("rubedoBlocks").lazy.controller("AlbumUploadController",["$scope","RubedoMediaService","$element",'Upload',function($scope,RubedoMediaService,$element,Upload){
    var me=this;
    me.pageId = $scope.blockConfig.listPageId ? $scope.blockConfig.listPageId : $scope.rubedo.current.page.id;
    me.files=[];
    me.processing=false;
    me.progress = 0;
    
    var resizeOptions = function (width,height){
        var options = {
            quality: 0.7
        }
        if (width>heigth) {
            options.width = 1000;
        }
        else options.height = 1000;
        return options;
    };
    var uploadFile = function(file){
        Upload.upload({
            url: '/api/v1/media',
            method: 'POST',
            params:{
                typeId:"545cd95245205e91168b45b1",
                userWorkspace:true, //on utilise le main workspace de l'utilisateur
                fields:{title:imgTitle}
            },
            file: file,
            headers: {'Content-Type': undefined}
        }).then(function (resp) {
            me.progress += 100* 1/nbOfImages;
            files[counter].success=true;
            if (counter==nbOfImages-1) {
                me.processing=false;
                me.progress=0;
            }
            counter++;
        }, function (resp) {
            console.log('Error status: ' + resp.status);
            counter++;
            if (i==nbOfImages-1) {
                me.processing=false;
                me.progress=0;
            }
        });         
    }
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    
    $scope.upload = function(files) {
        var batch = false;
        var counter=0;
        if (me.batchTitle && me.batchTitle!="") {
            batch = true;
        }
        //var nbOfImages = files.length;
        if (files && files.length) {
            me.processing=true;
            var nbOfImages = files.length;
            for (var i = 0; i < nbOfImages; i++) {
                var imgTitle=""; 
                if (!batch) {
                    imgTitle=files[i].name;
                }
                else {
                    imgTitle=me.batchTitle + '_'+i;
                }
                /*get images dimensions*/
                if (files[i].size>1024*150) {
                    console.log("image trop lourde");
                    Upload.imageDimensions(files[i]).then(function(dimensions){
                        /*RESIZE*/
                        Upload.resize(files[i], resizeOptions(dimensions.width,dimensions.height))
                            .then(function(resizedFile){
                                uploadFile(resizedFile)   ;                   
                            });
                    /*NO RESIZE*/

                    });
                }
                else{
                    uploadFile(files[i])   ;
                }

                
                
                
                
                
            }
        }
    
    };
}]);
