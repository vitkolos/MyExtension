angular.module("rubedoBlocks").lazy.controller('ImageBatchUploadController',['$scope','RubedoMediaService',function($scope,RubedoMediaService){
    var me = this;
    
    
    me.files=[];
    me.submitNewFiles=function(){
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
    
    
    
    
    
    
    
    
