angular.module("rubedoBlocks").lazy.controller("LanguageMenuController", ['$scope', 'RubedoPagesService','RubedoModuleConfigService', 'RubedoContentsService', '$route', '$location',
    function ($scope, RubedoPagesService,RubedoModuleConfigService, RubedoContentsService, $route, $location) {
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
 
        me.changeLang = function (lang) {
            if(lang != me.currentLang.lang){
                RubedoModuleConfigService.changeLang(lang);
                RubedoPagesService.getPageById($scope.rubedo.current.page.id).then(function(response){
                    if (response.data.success){
                        $location.path(response.data.url);
                    }
                });
            }
        };
    }]);       
     /*  
        me.changeLang = function (lang) {
            if(lang != me.currentLang.lang){
                RubedoModuleConfigService.changeLang(lang);
                RubedoPagesService.getPageById($scope.rubedo.current.page.id).then(function(response){
                    if (response.data.success){
                        if($scope.rubedo.current.page.contentCanonicalUrl) {
                            // Get content id
                            urlArray = $scope.rubedo.current.page.contentCanonicalUrl.split("/");
                            contentId = urlArray[urlArray.length-2];

                            // Redirect without title
                            $location.url(response.data.url + "/" + contentId + "/");

                            //Redirect with title
                            //RubedoContentsService.getContentById(contentId).then(function(contentResponse){
                            //    if (contentResponse.data.success){
                            //        $location.url(response.data.url + "/" + contentId + "/" + angular.lowercase(contentResponse.data.content.text.replace(/ /g, "-")));
                            //    }
                            //});
                        } else {
                            $location.url(response.data.url);
                        }
                    }
                });
            }
        };
    }]);*/
