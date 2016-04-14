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
    
    
    if(config.imageFile) {
        $scope.rubedo.current.page.image = $scope.rubedo.imageUrl.getUrlByMediaId(config.imageFile,{width:'800px'});
    }
    $scope.clearORPlaceholderHeight();

}]);