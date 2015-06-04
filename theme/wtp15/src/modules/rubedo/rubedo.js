(function(){
    var app = angular.module('rubedo', ['rubedoDataAccess','rubedoBlocks','ngRoute','snap'])
        .config(function($locationProvider) {
            $locationProvider.html5Mode(true);
            $locationProvider.hashPrefix('!');
        });

    var themePath="/theme/"+window.rubedoConfig.siteTheme;

    var current={
        page:{
            blocks:[]
        },
        site:{

        },
        user:null
    };

    app.config(function($routeProvider,$locationProvider,$controllerProvider, $compileProvider, $filterProvider, $provide) {
        app.lazy = {
            controller: $controllerProvider.register,
            directive: $compileProvider.directive,
            filter: $filterProvider.register,
            factory: $provide.factory,
            service: $provide.service
        };
        $routeProvider.when('/:lang/:routeline*?', {
                template: '<ng-include src="pageBodyCtrl.currentBodyTemplate"></ng-include>',
                controller:'PageBodyController',
                controllerAs: "pageBodyCtrl",
                reloadOnSearch: false
            }).otherwise({
                templateUrl:themePath+'/templates/404.html'
        });
        $locationProvider.html5Mode(true);

    });

    app.controller("RubedoController",['RubedoBlockTemplateResolver','RubedoImageUrlService','RubedoAuthService','RubedoFieldTemplateResolver','snapRemote','RubedoPageComponents','RubedoTranslationsService','$scope','$routeParams',
        function(RubedoBlockTemplateResolver,RubedoImageUrlService,RubedoAuthService,RubedoFieldTemplateResolver,snapRemote, RubedoPageComponents, RubedoTranslationsService,$scope,$routeParams){
         var me=this;
        //break nav on non-page routes
        $scope.$on("$locationChangeStart",function(event, newLoc,currentLoc){
            if (newLoc.indexOf("file?file-id") > -1||newLoc.indexOf("dam?media-id") > -1){
                event.preventDefault();
                window.location.href=newLoc;
            } else if (newLoc.indexOf("#") > -1){
                event.preventDefault();
                if (newLoc.split("#")[0]!=currentLoc.split("#")[0]) {
                    window.location.href=newLoc;
                  }
                else {     
                }
            }
        });
        $scope.$on("$locationChangeSuccess",function(scope, newLoc,currentLoc){
            if(newLoc.indexOf("?") > -1){
// if change of page -> wait for load
                if (currentLoc.split("?")[0] != newLoc.split("?")[0]) {
                    setTimeout(function(){
                        var target=angular.element("[name='"+$routeParams.page+"']");
                        if (target){
                                angular.element("body,html").animate({scrollTop: target.offset().top-50}, "slow");
                        }
                    },3000);
               }
               else{
// if first page with anchor (direct access) -> wait for load
                    if ( currentLoc.split("?")[1] == newLoc.split("?")[1]) {
                        setTimeout(function(){
                            var target=angular.element("[name='"+$routeParams.page+"']");
                            if (target){
                                    angular.element("body,html").animate({scrollTop: target.offset().top-50}, "slow");
                            }
                        },3000);
                    }
// if same page and different anchor -> scroll
                    else {
                        var target=angular.element("[name='"+$routeParams.page+"']");
                        if (target){
                                angular.element("body,html").animate({scrollTop: target.offset().top-50}, "slow");
                        }
                    }
                    
               }}
              });
        

        
        //set context and page-wide services
        me.adminBtnIconClass="glyphicon glyphicon-arrow-right";
        me.snapOpts={
          disable:'right',
          tapToClose:false
        };

        snapRemote.getSnapper().then(function(snapper) {
            snapper.disable();
            snapper.on('open', function() {
                me.adminBtnIconClass="glyphicon glyphicon-arrow-left";
                angular.element(".rubedo-admin-drawer").show();
            });

            snapper.on('close', function() {
                me.adminBtnIconClass="glyphicon glyphicon-arrow-right";
                angular.element(".rubedo-admin-drawer").hide();
            });
        });
        me.translations={ };
        RubedoTranslationsService.getTranslations().then(
            function(response){
                if (response.data.success){
                    me.translations=response.data.translations;
                }
            }
        );
        me.translate=function(transKey,fallbackString,toReplaceArray,toReplaceWithArray){
            var stringToReturn="";
            if (me.translations[transKey]){
                stringToReturn=me.translations[transKey];
            } else {
                stringToReturn=fallbackString;
            }
            if (toReplaceArray&&toReplaceWithArray&&angular.isArray(toReplaceArray)&&angular.isArray(toReplaceWithArray)){
                angular.forEach(toReplaceArray, function(value, key) {
                    stringToReturn=stringToReturn.replace(value,toReplaceWithArray[key]);
                });
            }
            return(stringToReturn);
        };
        me.themePath=themePath;
        me.adminInterfaceViewPath=themePath+"/templates/admin/menuViews/home.html";
        me.changeAdminInterfaceView=function(viewName){
            me.adminInterfaceViewPath=themePath+"/templates/admin/menuViews/"+viewName+".html";
        };
        me.logOut=function(){
            RubedoAuthService.clearPersistedTokens();
            window.location.reload();
        };
        me.current=current;
        me.blockTemplateResolver=RubedoBlockTemplateResolver;
        me.fieldTemplateResolver=RubedoFieldTemplateResolver;
        me.componentsService=RubedoPageComponents;
        me.imageUrl=RubedoImageUrlService;
        me.registeredEditCtrls=[ ];
        me.fieldEditMode=false;
        me.refreshAuth=function(forceRefresh){
            var curentTokens=RubedoAuthService.getPersistedTokens();
            if (curentTokens.refreshToken&&(!curentTokens.accessToken||forceRefresh)){
                RubedoAuthService.refreshToken().then(
                    function(response){
                        me.current.user=response.data.currentUser;
                    }
                );
            } else if (curentTokens.refreshToken&&curentTokens.accessToken){
                RubedoAuthService.getAuthStatus().then(
                    function(response){
                        me.current.user=response.data.currentUser;
                    },function(response){
                        me.refreshAuth(true);
                    }
                );
            }
        };

        me.refreshAuth(false);
        setInterval(function () {me.refreshAuth(false);}, 60000);
        me.addNotification=function(type,title,text,timeout){
            angular.element.toaster({ priority : type, title : title, message : text, settings:{timeout:timeout}});
        };
        me.toggleAdminPanel=function(){
            snapRemote.toggle("left");
        };
        me.enterEditMode=function(){
            me.fieldEditMode=true;
            me.toggleAdminPanel();
        };
        me.revertChanges=function(){
            me.fieldEditMode=false;
            angular.forEach(me.registeredEditCtrls,function(ctrlRef){
                ctrlRef.revertChanges();
            });
            me.registeredEditCtrls=[];
        };
        me.persistChanges=function(){
            me.fieldEditMode=false;
            angular.forEach(me.registeredEditCtrls,function(ctrlRef){
                ctrlRef.persistChanges();
            });
            me.registeredEditCtrls=[];
        };
        me.registerEditCtrl=function(ctrlRef){
            if (angular.element.inArray(ctrlRef,me.registeredEditCtrls)){
                me.registeredEditCtrls.push(ctrlRef);
            }
        };

    }]);

    app.controller("PageBodyController",['RubedoPagesService', 'RubedoModuleConfigService','$scope','RubedoBlockDependencyResolver',function(RubedoPagesService, RubedoModuleConfigService,$scope,RubedoBlockDependencyResolver){
        var me=this;
        if ($scope.rubedo.fieldEditMode){
            $scope.rubedo.revertChanges();
        }
        RubedoPagesService.getPageByCurrentRoute().then(function(response){
            if (response.data.success){
                var newPage=angular.copy(response.data.page);
                newPage.pageProperties=angular.copy(response.data.mask.pageProperties);
                newPage.mainColumnId=angular.copy(response.data.mask.mainColumnId);
                if(newPage.keywords){
                    angular.forEach(newPage.keywords, function(keyword){
                       newPage.metaKeywords = newPage.metaKeywords?newPage.metaKeywords+','+keyword:keyword;
                    });
                } else if (response.data.site.keywords){
                    angular.forEach(response.data.site.keywords, function(keyword){
                        newPage.metaKeywords = newPage.metaKeywords?newPage.metaKeywords+','+keyword:keyword;
                    });
                }
                if (!newPage.description&&response.data.site.description){
                    newPage.description=response.data.site.description;
                }
                if (!newPage.title&&response.data.site.title){
                    newPage.title=response.data.site.title;
                }
                if(newPage.noIndex || newPage.noFollow){
                    newPage.metaRobots = (newPage.noIndex?'noindex':'') + (newPage.noFollow?',nofollow':'');
                }
                newPage.metaAuthor = response.data.site.author?response.data.site.author:'Rubedo by Webtales';
                current.page=newPage;
                current.site=angular.copy(response.data.site);
                current.breadcrumb=angular.copy(response.data.breadcrumb);
                if (response.data.site.locStrategy == 'fallback'){
                    RubedoModuleConfigService.addFallbackLang(response.data.site.defaultLanguage);
                }
                var usedblockTypes=angular.copy(response.data.blockTypes);
                var dependencies=RubedoBlockDependencyResolver.getDependencies(usedblockTypes);
                if (dependencies.length>0){
                    $script(dependencies, function() {
                        if (newPage.pageProperties.customTemplate){
                            me.currentBodyTemplate=themePath+'/templates/customPageBody.html';
                        } else {
                            me.currentBodyTemplate=themePath+'/templates/defaultPageBody.html';
                        }
                        $scope.$apply();
                    });
                } else {
                    if (newPage.pageProperties.customTemplate){
                        me.currentBodyTemplate=themePath+'/templates/customPageBody.html';
                    } else {
                        me.currentBodyTemplate=themePath+'/templates/defaultPageBody.html';
                    }
                }

            }
        },function(response){
            if (response.status==404){
                current.page={
                    text:"404",
                    blocks:[]
                };
                me.currentBodyTemplate=themePath+'/templates/404.html';
            }
            // @TODO handle other error codes or use generic error template
        });

    }]);

    app.directive("rubedoNotification",function(){
        return {
            restrict:"E",
            templateUrl:themePath+"/templates/notification.html"
        };
    });

})();
