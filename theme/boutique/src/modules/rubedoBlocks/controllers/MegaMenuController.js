angular.module("rubedoBlocks").lazy.controller("MegaMenuController",['$scope','$location','RubedoMenuService','RubedoPagesService','$http','RubedoContentsService',function($scope,$location,RubedoMenuService,RubedoPagesService,RubedoContentsService,$http){
    var me=this;
    me.menu={};
    me.currentRouteline=$location.path();
    var config=$scope.blockConfig;
    me.searchEnabled = (config.useSearchEngine && config.searchPage);
    me.contentWidth = config.contentWidth;
    if (config.rootPage&&config.rootPage!=""){
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
    me.hasSubPages=function(page){
        var hasSub=false;
        if (page.pages){
            angular.forEach(page.pages,function(somePage){
                if (!hasSub&&somePage.pages&&!angular.element.isEmptyObject(somePage.pages)){
                    hasSub=true;
                }
            });
        }
        return hasSub;
    };


    RubedoMenuService.getMenu(pageId, config.menuLevel,true).then(function(response){
        if (response.data.success){
            me.menu=response.data.menu;
            var menuMode = "simple";
            me.menu.pages.forEach(function(page) {
                page.menuMode = "simple";
                if (page.pages) {
                    page.pages.every(function(subpage) {
                        if (subpage.pages) {
                            page.menuMode = "mega";
                        }
                        return (!subpage.pages);
                    });
                }
            });
        } else {
            me.menu={};
        }
    });
    //$scope.rubedo.getCustomTranslations = function(){
    //    $http.get('/theme/cte/localization/'+lang+'/Texts.json').then(function(res){
    //        $scope.rubedo.translations = JSON.parse((JSON.stringify($scope.rubedo.translations) + JSON.stringify(res.data)).replace(/}{/g,","))
    //    });
    //}
    //$scope.rubedo.getCustomTranslations();

}]);