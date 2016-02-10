 angular.module("rubedoBlocks").lazy.controller("MenuController",['$scope','$location','RubedoMenuService','RubedoPagesService','$http','$route',function($scope,$location,RubedoMenuService,RubedoPagesService,$http,$route){
        var me=this;
        me.menu={};
        me.currentRouteline=$location.path();
        var config=$scope.blockConfig;
        var lang = $route.current.params.lang;
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
            	$scope.rubedo.translations = JSON.parse((JSON.stringify($scope.rubedo.translations) + JSON.stringify(res.data)).replace(/}{/g,","))
		console.log($scope.rubedo.translations);
          });	
        }
      $scope.rubedo.getCustomTranslations(); 
    }]);


