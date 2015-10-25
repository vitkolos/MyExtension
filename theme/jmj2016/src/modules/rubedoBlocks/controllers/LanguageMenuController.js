angular.module("rubedoBlocks").lazy.controller("LanguageMenuController", ['$scope', 'RubedoPagesService','RubedoModuleConfigService', 'RubedoContentsService', '$route', '$location',
    function ($scope, RubedoPagesService,RubedoModuleConfigService, RubedoContentsService, $route, $location) {
        var me = this;
        var config = $scope.blockConfig;
        var urlArray = [];
        var contentId = "";
        me.languages = $scope.rubedo.current.site.languages;
        me.currentLang = $scope.rubedo.current.site.languages[$route.current.params.lang];
        if(!config.showCurrentLanguage){
            delete me.languages[$route.current.params.lang];
        }
        me.getFlagUrl = function(flagCode){
            return '/assets/flags/16/'+flagCode+'.png';
        };
 
        me.changeLang = function (lang) {
            if(lang != me.currentLang.lang){
                RubedoModuleConfigService.changeLang(lang);
                if ($scope.rubedo.current.site.locStrategy == 'fallback'){
                    RubedoModuleConfigService.addFallbackLang($scope.rubedo.current.site.defaultLanguage);
                }
                RubedoPagesService.getPageById($scope.rubedo.current.page.id).then(function(response){
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
    }]);       

