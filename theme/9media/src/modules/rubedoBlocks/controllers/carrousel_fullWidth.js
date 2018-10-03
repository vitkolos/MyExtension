angular.module("rubedoBlocks").lazy.controller("FWCarouselController",["$scope","RubedoContentsService",function($scope,RubedoContentsService){
    var me=this;
    me.contents=[];
    me.currentSlideIndex=1;
    var blockConfig=$scope.blockConfig;
    var queryOptions={
        start: blockConfig.resultsSkip ? blockConfig.resultsSkip : 0,
        limit: blockConfig.pageSize ? blockConfig.pageSize : 6,
        'fields[]' : ["text","summary",blockConfig.imageField,"titre2"],
        'requiredFields[]':[blockConfig.imageField]
    };
    var stopOnHover=blockConfig.stopOnHover;
    if(blockConfig.stopOnHover==true) stopOnHover="hover";
    else stopOnHover="false";
    var pageId=$scope.rubedo.current.page.id;
    var siteId=$scope.rubedo.current.site.id;
    me.getContents=function(){
        RubedoContentsService.getContents(blockConfig.query,pageId,siteId, queryOptions).then(
            function(response){
                if (response.data.success){
                    me.contents=response.data.contents;
                    setTimeout(function(){me.initCarousel();},100);
                    $scope.rubedo.setPageMetaImage(me.contents[0].fields[blockConfig.imageField]);
                }
            }
        );
    };
    me.initCarousel=function(){
        var targetElSelector="#block"+$scope.block.id;

        angular.element(targetElSelector).carousel({
            interval: blockConfig.duration*1000, //changes the speed
            pause: blockConfig.stopOnHover?"hover":"false"
        });
        $scope.clearORPlaceholderHeight();
    };
    me.slideTo=function(index){
        if (index==0) index=me.contents.length;
        var targetElSelector="#block"+$scope.block.id;
        angular.element(targetElSelector).carousel(index);
        me.currentSlideIndex=index;
        console.log(me.currentSlideIndex);

        
    }
    me.getImageOptions=function(){
        var height = angular.element("#block"+$scope.block.id).height();
        var width = angular.element("#block"+$scope.block.id).width();
        if(width>1.6*height){
            return({
            //height:blockConfig.imageHeight? blockConfig.imageHeight : angular.element("#block"+$scope.block.id).height(),
            width:Math.ceil(width/300)*300 ,
            mode:blockConfig.imageResizeMode
            });
        }
        else {
        return({
            height:Math.ceil(height/200)*200,
            //width:blockConfig.imageWidth ,
            mode:blockConfig.imageResizeMode
        });    
        }
        
    };
    if (blockConfig.query){
        me.getContents();
    }
}]);
