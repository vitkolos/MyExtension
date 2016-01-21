angular.module("rubedoBlocks").lazy.controller("BgImageController",["$scope","RubedoPagesService", function($scope,RubedoPagesService){
    var me = this;
    var config = $scope.blockConfig;
    if (config.externalURL){
        me.url=config.externalURL;
    } else if (config.imageLink&&mongoIdRegex.test(config.imageLink)){
        RubedoPagesService.getPageById(config.imageLink).then(function(response){
            if (response.data.success){
                me.url=response.data.url;
            }
        });
    }
    
    
    if($scope.blockConfig.imageFile) {
        $scope.rubedo.current.page.image = $scope.rubedo.imageUrl.getUrlByMediaId($scope.blockConfig.imageFile,{width:'800px'});
    }    

}]);