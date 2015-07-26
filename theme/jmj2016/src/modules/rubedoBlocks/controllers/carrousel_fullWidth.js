angular.module("rubedoBlocks").lazy.controller("FWCarouselController",["$scope","RubedoContentsService",function($scope,RubedoContentsService){
    var me=this;
    me.contents=[];
    var blockConfig=$scope.blockConfig;
    var queryOptions={
        start: blockConfig.resultsSkip ? blockConfig.resultsSkip : 0,
        limit: blockConfig.pageSize ? blockConfig.pageSize : 6,
        'fields[]' : ["text","summary",blockConfig.imageField],
        'requiredFields[]':[blockConfig.imageField],
        ismagic: blockConfig.magicQuery ? blockConfig.magicQuery : false
    };
    var pageId=$scope.rubedo.current.page.id;
    var siteId=$scope.rubedo.current.site.id;
    me.getContents=function(){
        RubedoContentsService.getContents(blockConfig.query,pageId,siteId, queryOptions).then(
            function(response){
                if (response.data.success){
                    me.contents=response.data.contents;
                    setTimeout(function(){me.initCarousel();},100);
                }
            }
        );
    };
    me.initCarousel=function(){
        var targetElSelector="#block"+$scope.block.id;
        /*var options={
            responsiveBaseWidth:targetElSelector,
            singleItem:true,
            pagination: blockConfig.showPager,
            navigation: blockConfig.showNavigation,
            autoPlay: blockConfig.autoPlay,
            stopOnHover: blockConfig.stopOnHover,
            paginationNumbers:blockConfig.showPagingNumbers,
            navigationText: ['<span class="glyphicon glyphicon-chevron-left"></span>','<span class="glyphicon glyphicon-chevron-right"></span>'],
            lazyLoad:true
        };
        angular.element(targetElSelector).owlCarousel(options);*/
        angular.element(targetElSelector).carousel({
            interval: 5000, //changes the speed
            pause: "false"
        });
    };
    me.slideTo=function(index){
        var targetElSelector="#block"+$scope.block.id;
        angular.element(targetElSelector).carousel(index);
    }
    me.getImageOptions=function(){
        return({
            height:blockConfig.imageHeight,
            width:blockConfig.imageWidth ? blockConfig.imageWidth : angular.element("#block"+$scope.block.id).width(),
            mode:blockConfig.imageResizeMode
        });
    };
    if (blockConfig.query){
        me.getContents();
    }
}]);
