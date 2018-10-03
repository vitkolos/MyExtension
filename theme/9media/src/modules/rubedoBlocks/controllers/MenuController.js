angular.module("rubedoBlocks").lazy.controller("MenuController",['$scope','$rootScope','$location','$route','RubedoMenuService','RubedoPagesService','$http',
	function($scope,$rootScope,$location,$route,RubedoMenuService,RubedoPagesService,$http){
        var DEBUG = true;
        var log = function(msg, o) {if(DEBUG) console.log(msg,o)}
	var me=this;
	me.menu={};
	me.pagesBlocks={};
	me.currentRouteleine=$location.path();console.log($location.path());
	var config=$scope.blockConfig;
	var lang = $route.current.params.lang;
	me.searchEnabled = (config.useSearchEngine && config.searchPage);
    
    log("parentid",$scope.rubedo.current.page.parentId)
    log("currpageid",$scope.rubedo.current.page.id)
	if (config.rootPage){
        var pageId=config.rootPage;
        log('1', pageId)
	} else if (config.fallbackRoot&&config.fallbackRoot=="parent"&&mongoIdRegex.test($scope.rubedo.current.page.parentId)){
        var pageId=$scope.rubedo.current.page.parentId;
        log('2', pageId)
	} else {
        var pageId=$scope.rubedo.current.page.id;
        log('3', pageId)
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
    log("$route.current", $route.current)

	RubedoMenuService.getMenu(pageId, config.menuLevel).then(function(response){
		if (response.data.success){
            console.log('OK RubedoMeuService.getMenu', response)
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
            console.log('DEBUG', me)
		}
		else {
            console.log('ERROR in RubedoMenuService.getMenu', response)
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


	

angular.module("rubedoBlocks").lazy.controller("LanguageMenuController", ['$scope', 'RubedoPagesService','RubedoModuleConfigService', 'RubedoContentsService', '$route', '$location',
    function ($scope, RubedoPagesService,RubedoModuleConfigService, RubedoContentsService, $route, $location) {
        var me = this;
        var config = $scope.blockConfig;
        var themePath="/theme/"+window.rubedoConfig.siteTheme;
        var urlArray = [];
        var contentId = "";
        me.languages = $scope.rubedo.current.site.languages;
        me.currentLang = $scope.rubedo.current.site.languages[$route.current.params.lang];
        me.getFlagUrl = function(flagCode){
            return themePath+'/img/flags/'+flagCode+'.png';
        };
 
        me.changeLang = function (lang) {
            if(lang != me.currentLang.lang){
                RubedoModuleConfigService.changeLang(lang);
                if ($scope.rubedo.current.site.locStrategy == 'fallback'){
                    RubedoModuleConfigService.addFallbackLang($scope.rubedo.current.site.defaultLanguage);
                }
                RubedoPagesService.getPageById($scope.rubedo.current.page.id,true).then(function(response){
                    if (response.data.success){
                        if($scope.rubedo.current.page.contentCanonicalUrl) {
                            // Get content id
                            urlArray = $route.current.params.routeline.split("/");
                            contentId = urlArray[urlArray.length-2];

                            // Redirect without title
                            //window.location.href = response.data.url + "/" + contentId + "/title";

                            //Redirect with title
                            RubedoContentsService.getContentById(contentId).then(function(contentResponse){
                                if (contentResponse.data.success){
                                    console.log(contentResponse.data.content);
                                    var contentSegment=contentResponse.data.content.text;
                                    if (contentResponse.data.content.fields.urlSegment&&contentResponse.data.content.fields.urlSegment!=""){
                                        contentSegment=contentResponse.data.content.fields.urlSegment;
                                    }
                                    window.location.href =response.data.url + "/" + contentId + "/" + angular.lowercase(contentSegment.replace(/ /g, "-"));
                                } else {
                                    window.location.href =  response.data.url;
                                }
                            },
                            function(){
                                window.location.href =  response.data.url;
                            });
                        }                        
                        else{
                            var currentParams = angular.element.param($location.search());
                            var url = response.data.url;

                            if(currentParams != "") {
                                if(response.data.url.indexOf("?") > -1) {
                                    url = response.data.url + currentParams;
                                } else {
                                    url = response.data.url + "?" + currentParams;
                                }
                            }

                            window.location.href =  url;
                        }
                    }
                });
            }
        };
        log('DEBUG LANG', me)
        $scope.clearORPlaceholderHeight();
    }]);       

