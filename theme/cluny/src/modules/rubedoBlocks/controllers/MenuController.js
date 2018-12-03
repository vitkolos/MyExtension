angular.module("rubedoBlocks").lazy.controller("MenuController",['$scope','$rootScope','$location','$route','RubedoMenuService','RubedoPagesService','$http',
function($scope,$rootScope,$location,$route,RubedoMenuService,RubedoPagesService,$http){
    var me = this;
    var themePath = "/theme/" + window.rubedoConfig.siteTheme;
    me.menu = {};
    var lang = $route.current.params.lang;
    me.pagesBlocks={};
    me.currentRouteline = $location.path();
    var config = $scope.blockConfig;

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

    //==============================
    // Get Menu
    //==============================
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
                    if (block.bType=="contentDetail" && me.pagesBlocks[key]["id"]=="5ac8da58396588d65471b982" && block.orderValue<=1) {
                        if(block.i18n[lang]) me.pagesBlocks[key].blocks.push({"title":block.i18n[lang].title,"code":(block.code).split("/")[1],"order":(block.code).split("/")[0]});
                        else me.pagesBlocks[key].blocks.push({"title":block.title,"code":(block.code).split("/")[1],"order":(block.code).split("/")[0]});

                        //if(block.i18n[lang]) me.pagesBlocks[key].blocks.push({"title":block.i18n[lang].title,"code":(block.code).split("/")[1],"order":(block.code).split("/")[0]});
                        //else me.pagesBlocks[key].blocks.push({"title":block.i18n.fr.title});
                    }
                    else {}
                });
            });
            $scope.clearORPlaceholderHeight();
        } else {
            me.menu={};
            $scope.clearORPlaceholderHeight();
        }
    });
                            
    $rootScope.toggleNav = "false";
    $rootScope.ToggleNav = function(){$rootScope.toggleNav = !$rootScope.toggleNav};
                            

    var lang = $route.current.params.lang;
    /*Ajouter les traductions*/
    $scope.rubedo.getCustomTranslations = function(){
        $http.get('/theme/cte/localization/' + lang + '/Texts.json').then(function(res){
            $scope.rubedo.translations = JSON.parse((JSON.stringify($scope.rubedo.translations) + JSON.stringify(res.data)).replace(/}{/g,","))
        });	
    }
    $scope.rubedo.getCustomTranslations(); 

}]);


angular.module("rubedoBlocks").lazy.controller("LanguageMenuController", ['$scope', 'RubedoPagesService','RubedoModuleConfigService', 'RubedoContentsService', '$route', '$location', '$http',
function ($scope, RubedoPagesService,RubedoModuleConfigService, RubedoContentsService, $route, $location, $http) {
    var me = this;
    var config = $scope.blockConfig;
    var urlArray = [];
    var contentId = "";
    me.languages = $scope.rubedo.current.site.languages;
    me.currentLang = $scope.rubedo.current.site.languages[$route.current.params.lang];
    me.mode = config.displayAs == "select";
    me.showFlags = config.showFlags;
    me.isDisabled =  function(lang){
        return me.currentLang.lang == lang;
    };
    if(!config.showCurrentLanguage){
        delete me.languages[$route.current.params.lang];
    }
    me.getFlagUrl = function(flagCode){
        return '/assets/flags/16/'+flagCode+'.png';
    };
    
    me.changeLang = async function (lang) {
        if(lang == me.currentLang.lang) return;
        RubedoModuleConfigService.changeLang(lang);
        
        if ($scope.rubedo.current.site.locStrategy == 'fallback') RubedoModuleConfigService.addFallbackLang($scope.rubedo.current.site.defaultLanguage);
        
        let response = await RubedoPagesService.getPageById($scope.rubedo.current.page.id, true);
        if (!response.data.success) return console.log("in languageCtrl.changeLang : could not find page with id " + $scope.rubedo.current.page.id);
        
        // if this is a content
        if($scope.rubedo.current.page.contentCanonicalUrl) {
            console.log("$route", $route);
            urlArray = $route.current.params.routeline.split("/");
            contentId = urlArray[urlArray.length-2];
            try {
                let contentResponse = await RubedoContentsService.getContentById(contentId);
                if (!contentResponse.data.success) {window.location.href = response.data.url; return}

                let contentSegment = contentResponse.data.content.text;
                if (contentResponse.data.content.fields.urlSegment && contentResponse.data.content.fields.urlSegment != ""){
                    contentSegment = contentResponse.data.content.fields.urlSegment;
                }
                window.location.href = response.data.url + "/" + contentId + "/" + angular.lowercase(contentSegment.replace(/ /g, "-")); return
            } catch(e) {
                window.location.href =  response.data.url; return
            }
        }

        // if this is a normal page
        let currentParams = angular.element.param($location.search());

        if (currentParams == "") {
            window.location.href =  response.data.url; return
        }
        if (response.data.url.indexOf("?") > -1) {
            window.location.href = response.data.url + currentParams; return
        } else {
            window.location.href = response.data.url + "?" + currentParams; return
        }
    }
}])