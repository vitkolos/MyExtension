angular.module("rubedoBlocks").lazy.controller('D3ScriptController',['$scope','$sce','RubedoSearchService',function($scope,$sce,RubedoSearchService){
    var me = this;
    var config = $scope.blockConfig;
    var d3Code = config.d3Code ? config.d3Code : "";
    $scope.predefinedFacets = config.predefinedFacets ? config.predefinedFacets : "{ }";
    $scope.pageSize = config.pageSize ? config.pageSize : 5000;
    $scope.retrieveData=function(params, successFunction, failureFunction ){
        var options={
            start: 0,
            limit: $scope.pageSize,
            predefinedFacets: $scope.predefinedFacets,
            displayedFacets: "['all']",
            pageId: $scope.rubedo.current.page.id,
            siteId: $scope.rubedo.current.site.id,
            searchMode:"aggregate"
        };
        angular.forEach(params, function(value, key){
            options[key]=value;
        });
        RubedoSearchService.searchByQuery(options).then(
            function(response){
                successFunction(response.data.results);
            },
            function(response){
                failureFunction(response.data);
            }
        );
    };
    me.html=$sce.trustAsHtml(d3Code);
}]);
