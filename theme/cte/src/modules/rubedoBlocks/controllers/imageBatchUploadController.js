angular.module("rubedoBlocks").lazy.controller('ImageBatchUploadController',['$scope','RubedoMediaService','RubedoPagesService','$http','$location',function($scope,RubedoMediaService,RubedoPagesService,$http,$location){
    var me = this;
    var config = $scope.blockConfig;    
    me.files=[];
    me.progress = 0;
    me.pageUrl="";
    me.workspace="";
    if (config.linkedPage&&mongoIdRegex.test(config.linkedPage)) {
        RubedoPagesService.getPageById(config.linkedPage).then(function(response){
            if (response.data.success){
                me.pageUrl=response.data.url;
                $http.get("/api/v1/pages",{
                    params:{
                        site:$location.host(),
                        route:(me.pageUrl).substr(4)
                    }
                }).then(function(response){if(response.data.success) {me.workspace= response.data.page.workspace; console.log(me.workspace);}});
                //me.workspace = me.targetPage.response.data.page.workspace;
                //console.log(me.workspace);
            };
        });
    };

    me.submitNewFiles=function(){
        var batch = false;

        var uploadOptions={
               typeId:"545cd95245205e91168b45b1",//pour des images
               target:"556088a945205e36757e688f"
        };

        var nbOfImages = me.files.length;
        angular.forEach(me.files, function(file, index) {
            var options = angular.copy(uploadOptions);
            if (!batch) {
                options.fields={title : file.name};
            }
            else {
                options.fields={title : me.batchTitle + '_'+index};
            }
            
            RubedoMediaService.uploadMedia(file,options).then(
               function(response){
                   if (response.data.success){
                       me.progress += 100/nbOfImages;
                   } else {
                       
                   }
               }
           );
        });

       /*me.notification=null;
       if ($scope.fieldInputMode&&me.newFile){
           var uploadOptions={
               typeId:"545cd95245205e91168b45b1", //pour des images
               fields:{
                   title:me.newFile.name
               }
           };
           RubedoMediaService.uploadMedia(me.newFile,uploadOptions).then(
               function(response){
                   if (response.data.success){
                       var id=response.data.media.id;
                       $scope.fieldEntity[$scope.field.config.name]=id;
                       mediaId=id;
                       if ($scope.registerFieldEditChanges){
                           $scope.registerFieldEditChanges();
                       }
                        me.media=response.data.media;
                        me.displayMedia();
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
       }*/

    };


}]);
    
    
    
    
    
    
    
    
