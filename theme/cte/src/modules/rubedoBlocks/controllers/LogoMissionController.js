angular.module("rubedoBlocks").lazy.controller('LogoMissionController',['$scope','RubedoMediaService','RubedoPagesService','$location','$http',function($scope,RubedoMediaService,RubedoPagesService,$location,$http){
    var me = this;
    var config = $scope.blockConfig;
    me.query = config.query;
    var query = JSON.parse(me.query);
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
        };
        me.width = options.imageThumbnailWidth;
        me.getMedia = function(options, reload){
            RubedoMediaService.getMediaByQuery(options).then(function(response){
                if(response.data.success){
                    me.count = response.data.count;
                    me.images = response.data.media.data;
                    //get only pages on the website 
                    if(me.count>0 && me.images[0].taxonomy.navigation) {
                        for (var i = 0, len = me.images[0].taxonomy.navigation.length; i < len; i++) {
                            RubedoPagesService.getPageById(me.images[0].taxonomy.navigation[i]).then(function(response){
                                if (response.data.success ) {
                                    if (response.data.pageData.site && response.data.pageData.site==$scope.rubedo.current.site.id) {
                                        me.images[0].pageId = me.images[0].taxonomy.navigation[i];
                                        console.log(me.images[0].pageId);
                                    }
                                }
                            });
                        }
                    }
                    

                    
                    
                    $scope.clearORPlaceholderHeight();
                    if (me.count==0 && ($scope.rubedo.current.breadcrumb).length>2 && !reload) {
                        //remonter au niveau supérieur
                        $http.get("/api/v1/pages",{
                            params:{
                                site:$location.host(),
                                route:$scope.rubedo.current.breadcrumb[$scope.rubedo.current.breadcrumb.length-3]['url'].substring(4)
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
        
        
        me.getMedia(options,false);
    }
}]);
