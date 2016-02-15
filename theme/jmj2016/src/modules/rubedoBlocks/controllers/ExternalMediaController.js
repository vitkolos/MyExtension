angular.module("rubedoBlocks").lazy.controller("ExternalMediaController",['$scope','$http','$sce',function($scope,$http,$sce){
    var me=this;
    var config=$scope.blockConfig;
    me.config=$scope.blockConfig;
    if ((config)&&(config.url)){
        var url = "http://iframe.ly/api/oembed?url="+encodeURIComponent(config.url);
        if ($scope.rubedo.current.site.iframelyKey){
            url=url+"&api_key="+$scope.rubedo.current.site.iframelyKey;
        }
        url=url+"&callback=JSON_CALLBACK";
        $http.jsonp(url).success(function(response){
            me.html=$sce.trustAsHtml(response.html);
        });
    }
    console.log(me.config);
}]);