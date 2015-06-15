angular.module("rubedoBlocks").lazy.controller("SearchFormController",['$scope','$location','RubedoPagesService',function($scope, $location, RubedoPagesService){
    var me = this;
    var config = $scope.blockConfig;
    me.show = config.searchPage;
    me.placeholder = config.placeholder;
    me.onSubmit = function(){
        var paramQuery = me.query?'?query=*'+me.query+'*':'';
        RubedoPagesService.getPageById(config.searchPage).then(function(response){
            if (response.data.success){
                $location.url(response.data.url+paramQuery);
            }
        });
    };
}]);