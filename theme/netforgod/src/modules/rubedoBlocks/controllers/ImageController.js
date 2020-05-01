angular.module("rubedoBlocks").lazy.controller("ImageController",["$scope","$http","RubedoPagesService", function($scope,$http,RubedoPagesService){
    var me = this;
    var config = $scope.blockConfig;
    me.imageTitle = "";
    if (config.externalURL){
        me.url=config.externalURL;
    } else if (config.imageLink&&mongoIdRegex.test(config.imageLink)){
        RubedoPagesService.getPageById(config.imageLink).then(function(response){
            if (response.data.success){
                me.url=response.data.url;
            }
        });
    }

    $http.get("/api/v1/media/" + config.imageFile).then(
        function(response) {
            if(response.data.success) {
                me.imageTitle = 'unknown';
                if (response.data.media.fields.title) me.imageTitle = response.data.media.fields.title;
                else if (response.data.media.title) me.imageTitle = response.data.media.title;
                $scope.rubedo.current.page.image = $scope.rubedo.imageUrl.getUrlByMediaId(config.imageFile,{width:'1200px'});
                $scope.clearORPlaceholderHeight();
            }
        }
    );

}]);