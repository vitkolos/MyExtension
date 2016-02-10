 angular.module("rubedoBlocks").lazy.controller("MenuController",['$scope','$location','RubedoMenuService','RubedoPagesService','$http',function($scope,$location,RubedoMenuService,RubedoPagesService,$http){
        var me=this;
        me.menu={};
        me.currentRouteline=$location.path();
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
            } else {
                me.menu={};
            }
        });
        $scope.rubedo.getCustomTranslations = function(){
	        $http.get('/theme/wtp15/elements/tarifs.json').then(function(res){
            console.log(res.data);                     
          });	
        }
      $scope.rubedo.getCustomTranslations(); 
      console.log($scope.rubedo);
    }]);


