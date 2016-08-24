angular.module("rubedoBlocks").lazy.controller('ImageBatchUploadController',['$scope','RubedoMediaService','RubedoPagesService','RubedoUsersService','$http','$location','Upload',function($scope,RubedoMediaService,RubedoPagesService,RubedoUsersService,$http,$location,Upload){
    var me = this;
    var config = $scope.blockConfig;    
    me.files=[];
    me.progress = 0;
    me.pageUrl="";
    

    
    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });
    $scope.upload = function(files) {
        var batch = false;


        if (me.batchTitle && me.batchTitle!="") {
            batch = true;
        }
        //var nbOfImages = files.length;
        if (files && files.length) {
            var nbOfImages = files.length;
            for (var i = 0; i < nbOfImages; i++) {
                var imgTitle="";
                if (!batch) {
                    imgTitle=files[i].name;
                }
                else {
                    imgTitle=me.batchTitle + '_'+i;
                }
                Upload.upload({
                    url: '/api/v1/media',
                    method: 'POST',
                    params:{
                        typeId:"545cd95245205e91168b45b1",
                        userWorkspace:true, //on utilise le main workspace de l'utilisateur
                        fields:{title:imgTitle}
                    },
                    file: files[i],
                    headers: {'Content-Type': undefined}
                }).then(function (resp) {
                    me.progress += 100* 1/nbOfImages;
                    files[i].success=true;
                }, function (resp) {
                    console.log('Error status: ' + resp.status);
                });
            }
        }
        
        
        /*
        angular.forEach(files, function(file, index) {
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
                       me.progress += 100* 1/nbOfImages;
                   } else {


                   }
               }
           );
        }); */       
    };

}]);
    
    
    
    
    
    
    
    
