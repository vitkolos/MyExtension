    angular.module("rubedoBlocks").lazy.controller("MenuController",['$scope','$location','$route','RubedoMenuService','RubedoPagesService',function($scope,$location,$route,RubedoMenuService,RubedoPagesService){
        var me=this;
        me.menu={};
        me.pagesBlocks={};
        me.currentRouteleine=$location.path();
        var config=$scope.blockConfig;
        me.searchEnabled = (config.useSearchEngine && config.searchPage);
        if (config.rootPage){
            var pageId=config.rootPage;
        } else if (config.fallbackRoot&&config.fallbackRoot=="parent"&&mongoIdRegex.test($scope.rubedo.current.page.parentId)){
            var pageId=$scope.rubedo.current.page.parentId;
        } else {
            var pageId=$scope.rubedo.current.page.id;
        }
        me.onSubmit = function(){
            var paramQuery = me.query?'?query='+me.query:'';
            RubedoPagesService.getPageById(config.searchPage).then(function(response){
                if (response.data.success){
                    $location.url(response.data.url+paramQuery);
                }
            });
        };
        RubedoMenuService.getMenu(pageId, config.menuLevel).then(function(response){
            if (response.data.success){
                me.menu=response.data.menu;
 
 
        angular.forEach(me.menu.pages, function(page, key) {
            me.pagesBlocks[key]={}
            me.pagesBlocks[key]["title"] = page.title;
            me.pagesBlocks[key]["url"] = page.url;
            me.pagesBlocks[key].blocks=[]; 
            var lang = $route.current.params.lang;
            angular.forEach(page.blocks, function(block, key2){
                if (block.bType=="contentDetail" && block.orderValue==1) {
                    me.pagesBlocks[key].blocks.push({"title":block.title});
                    if(block.i18n[lang]) console.log(block.i18n[lang]);
                    else console.log(block.i18n.fr);
                
                 }
                 else {}
               })
     
     
     })

 
             } else {
                me.menu={};
            }
        });
 
}]);
