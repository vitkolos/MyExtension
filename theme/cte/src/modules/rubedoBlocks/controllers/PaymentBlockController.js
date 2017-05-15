angular.module("rubedoBlocks").lazy.controller("PaymentBlockController",['$scope','$compile','RubedoContentsService',function($scope,$compile,RubedoContentsService){
    var me = this;
    me.contentList=[];
    var config=$scope.blockConfig;
    var pageId=$scope.rubedo.current.page.id;
    var siteId=$scope.rubedo.current.site.id;
    var alreadyPersist = false;
   
    var options = {
        start: 0,
        limit: 50,
        'fields[]' : ["text","summary"]
    };
    
    me.titleOnly = config.showOnlyTitle;
    me.getContents = function (queryId, pageId, siteId, options, add){
        RubedoContentsService.getContents(queryId,pageId,siteId, options).then(function(response){
            if (response.data.success){
                me.count = response.data.count;
                me.queryType=response.data.queryType;
                me.usedContentTypes=response.data.usedContentTypes;
                me.contents = response.data.contents;


            }
        });
    };

    

    if(config.query){
        me.getContents(config.query, pageId, siteId, options, false);
    }

    
				
				me.currentStage=1;
    
    
}]);

