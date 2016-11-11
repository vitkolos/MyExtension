angular.module("rubedoBlocks").lazy.controller('LogoMissionController',['$scope','RubedoMediaService','$location',function($scope,RubedoMediaService,$location){
    var me = this;
    var config = $scope.blockConfig;
    me.query = config.query;
    var query = JSON.parse(me.query);
    console.log($scope.rubedo.current);
    query["vocabularies"]["navigation"] = {
        rule:'someRec',
        terms:[$scope.rubedo.current.page.id,$scope.rubedo.current.page.parentId]
    };
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
        me.getMedia = function(options, reload){
            RubedoMediaService.getMediaByQuery(options).then(function(response){
                if(response.data.success){
                    me.count = response.data.count;
                    me.images = response.data.media.data;
                    $scope.clearORPlaceholderHeight();
                    if (me.count=0 && $scope.rubedo.current.breadcrumb.length>2 && !reload) {
                        //remonter au niveau supérieur
                        $http.get("/api/v1/pages",{
                            params:{
                                site:$location.host(),
                                route:$scope.rubedo.current.breadcrumb[$scope.rubedo.current.breadcrumb-1]['url']
                            }
                        }).then(function(response){
                            if (response.data.success) {
                                query["vocabularies"]["navigation"] = {
                                    rule:'someRec',
                                    terms:[$scope.rubedo.current.page.id,$scope.rubedo.current.page.parentId,response.data.page.id]
                                };
                                me.query = JSON.stringify(query);
                                options = {
                                    query: me.query,
                                    start: me.start,
                                    limit: me.limit,
                                    pageWorkspace: $scope.rubedo.current.page.workspace,
                                    imageThumbnailHeight: config.imageThumbnailHeight?config.imageThumbnailHeight:220,
                                    //imageThumbnailWidth: config.imageThumbnailWidth?config.imageThumbnailWidth:100
                                };
                                me.getMedia(options, true);
                            }
                            
                        });
                        
                    }
                }
            });
        };
        
        
        me.getMedia(options);
    }
}]);