    angular.module("rubedoBlocks").lazy.controller("MenuController",['$scope','$rootScope','$location','$route','RubedoMenuService','RubedoPagesService','$http',
																																																																					function($scope,$rootScope,$location,$route,RubedoMenuService,RubedoPagesService,$http){
        var me=this;
        me.menu={};
        me.pagesBlocks={};
        me.currentRouteleine=$location.path();
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
	        me.currentLang = $route.current.params.lang;

        RubedoMenuService.getMenu(pageId, config.menuLevel).then(function(response){
            if (response.data.success){
                me.menu=response.data.menu;
																angular.forEach(me.menu.pages, function(page, key) {
																				me.pagesBlocks[key]={};
																				me.pagesBlocks[key]["title"] = page.text;
																				me.pagesBlocks[key]["url"] = page.url;
																				me.pagesBlocks[key]["id"] = page.id;
																				me.pagesBlocks[key].blocks=[]; 
																				var lang = $route.current.params.lang;
																				angular.forEach(page.blocks, function(block, key2){
																								if (block.bType=="contentDetail" && block.orderValue<=1) {
																												if(block.i18n[lang]) me.pagesBlocks[key].blocks.push({"title":block.i18n[lang].title,"code":(block.code).split("/")[1],"order":(block.code).split("/")[0]});
																												else me.pagesBlocks[key].blocks.push({"title":block.title,"code":(block.code).split("/")[1],"order":(block.code).split("/")[0]});

																												//if(block.i18n[lang]) me.pagesBlocks[key].blocks.push({"title":block.i18n[lang].title,"code":(block.code).split("/")[1],"order":(block.code).split("/")[0]});
																												//else me.pagesBlocks[key].blocks.push({"title":block.i18n.fr.title});
																								}
																								else {}
																				});
																});
																$scope.clearORPlaceholderHeight();

            }
												else {
                me.menu={};
																$scope.clearORPlaceholderHeight();
            }
        });
	
								$rootScope.toggleNav = "false";
								$rootScope.ToggleNav = function(){$rootScope.toggleNav = !$rootScope.toggleNav};
								/*Ajouter les traductions*/
								$scope.rubedo.getCustomTranslations = function(){
												$http.get('/theme/'+window.rubedoConfig.siteTheme+'/localization/'+lang+'/Texts.json').then(function(res){
																$scope.rubedo.translations = JSON.parse((JSON.stringify($scope.rubedo.translations) + JSON.stringify(res.data)).replace(/}{/g,","))
												});	
        }
								$scope.rubedo.getCustomTranslations();

    }]);

