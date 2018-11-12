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
        me.isTranslated = function(lang){
            if ($scope.rubedo.current.site.locStrategy=="fallback") {
                return true;
            }
            else if($scope.rubedo.current.page.i18n) return $scope.rubedo.current.page.i18n.hasOwnProperty(lang);
												else if ($scope.rubedo.current.page.parentId=='root' ) return true;
            else return false;
        };
        me.getFlagUrl = function(flagCode){
            return '/assets/flags/16/'+flagCode+'.png';
        };
        me.changeLang = function(lang) {
            if (lang == me.currentLang.lang) return;
            console.log('LANG', lang, me.currentLang)
        }
        me.changeLang2 = function (lang) {
            if(lang != me.currentLang.lang){
                console.log('--in lang1')
                RubedoModuleConfigService.changeLang(lang);
                if ($scope.rubedo.current.site.locStrategy == 'fallback'){
                    console.log('--in lang fallback')
                    RubedoModuleConfigService.addFallbackLang($scope.rubedo.current.site.defaultLanguage);
                }
                RubedoPagesService.getPageById($scope.rubedo.current.page.id,true).then(function(response){
                    if (response.data.success){
                        console.log('--in lang getpagebyid success')
                        if($scope.rubedo.current.page.contentCanonicalUrl) {
                            // Get content id
                            urlArray = $route.current.params.routeline.split("/");
                            contentId = urlArray[urlArray.length-2];

                            // Redirect without title
                            //window.location.href = response.data.url + "/" + contentId + "/title";

                            //Redirect with title
                            RubedoContentsService.getContentById(contentId).then(function(contentResponse){
                                if (contentResponse.data.success){
                                    console.log('--in lang getcontentbyid success')
                                    //console.log(contentResponse.data.content);
                                    var contentSegment=contentResponse.data.content.text;
                                    if (contentResponse.data.content.fields.urlSegment&&contentResponse.data.content.fields.urlSegment!=""){
                                        contentSegment=contentResponse.data.content.fields.urlSegment;
                                    }
                                    //window.location.href =response.data.url + "/" + contentId + "/" + angular.lowercase(contentSegment.replace(/ /g, "-"));
                                } else {
                                    //window.location.href =  response.data.url;
                                }
                            },
                            function(){
                                console.log('--in lang3')
                                window.location.href =  response.data.url;
                            });
                        } else {
                            console.log('--in lang4')
                            var currentParams = angular.element.param($location.search());
                            var url = response.data.url;

                            if(currentParams != "") {
                                console.log('--in lang5')
                                if(response.data.url.indexOf("?") > -1) {
                                    url = response.data.url + currentParams;
                                } else {
                                    url = response.data.url + "?" + currentParams;
                                }
                            }

                            //window.location.href =  url;
                        }
                    }
                });
            }
        };
        $scope.clearORPlaceholderHeight();
    }]);
