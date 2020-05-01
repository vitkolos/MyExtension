angular.module("rubedoBlocks").lazy.controller("CarouselController",["$scope","RubedoContentsService","RubedoPagesService","$filter",function($scope,RubedoContentsService,RubedoPagesService,$filter){
    var me=this;
    me.contents=[];
    var blockConfig=$scope.blockConfig;
    var queryOptions={
        start: blockConfig.resultsSkip ? blockConfig.resultsSkip : 0,
        limit: blockConfig.pageSize ? blockConfig.pageSize : 6,
        'fields[]' : ["text","summary",blockConfig.imageField,"propositionReferencee","propositionReferenceeInterne"],   
        ismagic: blockConfig.magicQuery ? blockConfig.magicQuery : false
    };
    if (blockConfig.imageField && blockConfig.imageField!="") {
    	queryOptions['requiredFields[]'] = [blockConfig.imageField];
    }
    if(blockConfig.singlePage){
        queryOptions.detailPageId = blockConfig.singlePage;
    }
    var pageId=$scope.rubedo.current.page.id;
    var siteId=$scope.rubedo.current.site.id;
    $scope.isArray = angular.isArray;
    me.getContents=function(){
        RubedoContentsService.getContents(blockConfig.query,pageId,siteId, queryOptions).then(
            function(response){
                if (response.data.success){
                    me.contents=response.data.contents;
                    setTimeout(function(){me.initCarousel();},100);
                    /*définir l"image de la page (balise meta)*/
                    //$scope.rubedo.current.page.image = $scope.rubedo.imageUrl.getUrlByMediaId(me.contents[0].fields[blockConfig.imageField],{width:'800px'});
                    if (!me.contents || me.contents.length == 0) return;
                    $scope.rubedo.setPageMetaImage(me.contents[0].fields[blockConfig.imageField]);
                        angular.forEach(me.contents, function(content){
                            if (content.fields.propositionReferenceeInterne && content.fields.propositionReferenceeInterne !=""){
                                if (content.fields.propositionReferenceeInterne == pageId) {
                                    content.isSamePage= true;
                                }
                                else {
                                    RubedoPagesService.getPageById(content.fields.propositionReferenceeInterne).then(function(response){
                                        if (response.data.success){
                                            content.contentLinkUrl = $filter('cleanUrl')(response.data.url);
                                        }
                                    });
                                }
                            }
                            else if (content.fields.propositionReferencee && content.fields.propositionReferencee !="") {
                                content.contentLinkUrl = content.fields.propositionReferencee;
                                content.isExternal = true;
                            }
                            else content.contentLinkUrl = $filter('cleanUrl')(content.detailPageUrl);                        
                    });
                }
            }
        );
    };
    
    me.initCarousel=function(){
        var targetElSelector="#block"+$scope.block.id;
        var owlOptions={
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
								if ($scope.block.code && $scope.block.code!='') {
												owlOptions.items = $scope.block.code;
												owlOptions.singleItem=false;
								}
        angular.element(targetElSelector).owlCarousel(owlOptions);
        $scope.clearORPlaceholderHeight();
    };
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
