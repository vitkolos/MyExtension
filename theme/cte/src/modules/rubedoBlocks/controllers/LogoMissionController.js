angular.module("rubedoBlocks").lazy.controller('LogoMissionController',['$scope','RubedoMediaService',function($scope,RubedoMediaService){
    var me = this;
    var config = $scope.blockConfig;
    me.query = config.query;
    var query = JSON.parse(me.query);
    console.log(query);
    query["vocabularies"]["navigation"] = {
        rule:'someRec',
        terms:[$scope.rubedo.current.page.id]
    };
    console.log(query);
    me.query = JSON.stringify(query);

    if(me.query) {
        me.start = 0;
        me.limit = 1;
        
        var options = {
            query: me.query,
            start: me.start,
            limit: me.limit,
            pageWorkspace: $scope.rubedo.current.page.workspace,
            imageThumbnailHeight: config.imageThumbnailHeight?config.imageThumbnailHeight:220,
            //imageThumbnailWidth: config.imageThumbnailWidth?config.imageThumbnailWidth:100
        };
        me.width = options.imageThumbnailWidth;
        me.getMedia = function(options){
            RubedoMediaService.getMediaByQuery(options).then(function(response){
                if(response.data.success){
                    me.count = response.data.count;
                    me.images = response.data.media.data;
                    $scope.clearORPlaceholderHeight();
                }
            });
        };
        
        
        me.getMedia(options);
    }
}]);