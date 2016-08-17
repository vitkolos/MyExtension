angular.module("rubedoBlocks").lazy.controller("ExternalMediaController",['$scope','$http','$sce',function($scope,$http,$sce){
    var me=this;
    var config=$scope.blockConfig;
    me.config=$scope.blockConfig;
    $scope.clearORPlaceholderHeight();
}]);