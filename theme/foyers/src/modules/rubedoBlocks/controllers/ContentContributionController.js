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
																console.log("payLoad");
																console.log(payLoad);
                delete (formData.taxonomy);
                payLoad.fields=formData;
																console.log("payLoad.fields");
																console.log(payLoad.fields);
																console.log("createResponse");
																console.log(createResponse);
                if (me.imagesForAlbum && me.imagesForAlbum.length>0) {
                    payLoad.fields.images=angular.copy(me.imagesForAlbum);
                }
                if (me.embeddedImages && me.embeddedImages.length>0) {
                    payLoad.fields.embeddedImages=angular.copy(me.embeddedImages);
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
    me.files=[];
    me.processing=false;
    me.progress = 0;
    $scope.ccCtrl.imagesForAlbum=[];
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    me.uploadedFiles=[];
    $scope.upload = function(files) {
        var counter=0;

        //var nbOfImages = files.length;
        if (files && files.length) {
            me.processing=true;
            var nbOfImages = files.length;
            for (var i = 0; i < nbOfImages; i++) {                
               

                Upload.upload({
                    url: '/api/v1/media',
                    method: 'POST',
                    params:{
                        typeId:"5825dfdf245640f44a8b7230",
                        userWorkspace:true, //on utilise le main workspace de l'utilisateur
                        fields:{title:files[i].name}
                    },
                    file: files[i],
                    headers: {'Content-Type': undefined}
                }).then(function (resp) {
                    me.progress += 100* 1/nbOfImages;
                    files[counter].success=true;
                    if (counter==nbOfImages-1) {
                        me.processing=false;
                        me.progress=0;
                    }
                    counter++;
                    var id=resp.data.media.id;
                    me.uploadedFiles.push({title:resp.data.media.title, id:id, size:resp.data.media.fileSize,success:true});
                    ($scope.ccCtrl.imagesForAlbum).push(id);
                }, function (resp) {
                    console.log('Error status: ' + resp.status);
                    counter++;
                    if (i==nbOfImages-1) {
                        me.processing=false;
                        me.progress=0;
                    }
                });              
                
            }
        }
    };
}]);
