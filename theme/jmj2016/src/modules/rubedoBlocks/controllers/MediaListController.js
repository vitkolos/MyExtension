angular.module("rubedoBlocks").lazy.controller("MediaListController",["$scope","$compile","RubedoSearchService",function($scope,$compile,RubedoSearchService){
    var me = this;
    var config = $scope.blockConfig;
    me.media = [];
    me.start = 0;
    me.limit = config.pagesize?config.pagesize:12;

    if(config.facets.length == 0){
        me.display = false;
    } else {
        me.display = true;
    }

    var options = {
        start: me.start,
        limit: me.limit,
        constrainToSite: config.constrainToSite,
        siteId: $scope.rubedo.current.site.id,
        pageId: $scope.rubedo.current.page.id,
        predefinedFacets: config.facets
    };
    me.changePageAction = function(){
        options.start = me.start;
        me.getMedia(options);
    };
    me.getMedia = function(options){
        RubedoSearchService.getMediaById(options).then(function(response){
            if(response.data.success){
                me.count = response.data.count;
                me.media = response.data.results.data;
            }
        });
    };

    me.getMedia(options);
}]);