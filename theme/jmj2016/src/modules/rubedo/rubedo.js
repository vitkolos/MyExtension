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
        queue:[],
        rEvents:{},
        user:null,
        UXParams:{}
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

    app.factory('UXUserService',["RubedoModuleConfigService",function(RubedoModuleConfigService){
        var serviceInstance = {};
        serviceInstance.ISCONNECTED=function(){
            return(current.user ? true : false);
        };
        serviceInstance.RUID=function(){
            return(RubedoModuleConfigService.getConfig().fingerprint);
        };
        serviceInstance.emailRegex= /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        serviceInstance.ISEMAILVALID=function(){
            if (!current.user){
                return false;
            }
            return(serviceInstance.emailRegex.test(current.user.email));
        };
        serviceInstance.SUBSCRIBEDTO=function(mailingList){
            return current.user&&current.user.mailingLists&&current.user.mailingLists[mailingList]&&current.user.mailingLists[mailingList].status ? true : false;
        };
        serviceInstance.ISGEOLOCATED=function(){
            return navigator.geolocation ? true : false;
        };
        return serviceInstance;
    }]);

    app.factory('UXPageService',["RubedoFingerprintDataService",function(RubedoFingerprintDataService){
        var serviceInstance = {};
        serviceInstance.angReferrer=false;
        serviceInstance.lastPageLoad=Date.now() / 1000 | 0;
        serviceInstance.resetPageLoad=function(){
            serviceInstance.lastPageLoad=Date.now() / 1000 | 0;
        };
        serviceInstance.TIMEONPAGE=function(){
            var newTS=Date.now() / 1000 | 0;
            return (newTS-serviceInstance.lastPageLoad);
        };
        serviceInstance.setAngReferrer=function(newReferrer){
            serviceInstance.angReferrer=newReferrer;
        };
        serviceInstance.REFERRER=function(){
            if (serviceInstance.angReferrer) {
                return(serviceInstance.angReferrer);
            } else if (document.referrer&&document.referrer!=""){
                return(document.referrer);
            } else {
                return false
            }

        };
        serviceInstance.NBVIEWS=function(){
            var fingerprintData=RubedoFingerprintDataService.getFingerprintData();
            if(fingerprintData&&fingerprintData.pages&&fingerprintData.pages[current.page.id]&&fingerprintData.pages[current.page.id].nbViews){
                return(fingerprintData.pages[current.page.id].nbViews);
            } else {
                return(0);
            }
        };

        return serviceInstance;
    }]);

    app.factory('UXSessionService',['ipCookie',function(ipCookie){
        var serviceInstance = {};
        serviceInstance.DURATION=function(){
            var existingTS=ipCookie("sessionStartTS");
            if (!existingTS){
                return false;
            }
            var newTS=Date.now() / 1000 | 0;
            return (newTS-existingTS);
        };
        return serviceInstance;
    }]);

    app.factory('UXCore',['RubedoFingerprintDataService','$rootScope','$timeout',function(RubedoFingerprintDataService,$rootScope,$timeout){
        var serviceInstance = {};
        var SET=function(var1,var2){
            RubedoFingerprintDataService.logFDChange(var1,"set",var2);
        };
        var INC=function(var1,var2){
            RubedoFingerprintDataService.logFDChange(var1,"inc",var2);
        };
        var DEC=function(var1,var2){
            RubedoFingerprintDataService.logFDChange(var1,"dec",var2);
        };
        var HIDEBLOCK=function(bCode){
            if(!current.UXParams.hiddenBlocks){
                current.UXParams.hiddenBlocks={};
            }
            current.UXParams.hiddenBlocks[bCode]=true;
        };
        var SHOWBLOCK=function(bCode){
            if(!current.UXParams.hiddenBlocks){
                current.UXParams.hiddenBlocks={};
            }
            current.UXParams.hiddenBlocks[bCode]=false;
        };
        var SHOWMODAL=function(bCode,delay){
            if (delay){
                current.queue.push(
                    $timeout(function(){
                        $rootScope.$broadcast("RubedoShowModal",{block:bCode});
                    },delay)
                );
            } else {
                if (!current.UXParams.initialEvents){
                    current.UXParams.initialEvents={};
                }
                if(!current.UXParams.initialEvents[bCode]){
                    current.UXParams.initialEvents[bCode]=[];
                }
                $rootScope.$broadcast("RubedoShowModal",{block:bCode});
                current.UXParams.initialEvents[bCode]["RubedoShowModal"]=true;
            }

        };
        serviceInstance.evaluateCondition=function(condition){
            var replaceArray={
                'USER.DATA.':"serviceInstance.fingerprintData.",
                'USER.ISCONNECTED':'USER.ISCONNECTED()',
                'USER.ISGEOLOCATED':'USER.ISGEOLOCATED()',
                'USER.RUID':'USER.RUID()',
                'USER.ISEMAILVALID':'USER.ISEMAILVALID()',
                'SESSION.DURATION':'SESSION.DURATION()',
                'PAGE.NBVIEWS':'PAGE.NBVIEWS()',
                'PAGE.TIMEONPAGE':'PAGE.TIMEONPAGE()',
                'PAGE.REFERRER':'PAGE.REFERRER()',
                ' NOT = ':'!=',
                ' AND ':'&&',
                ' = ':'==',
                ' OR ':'||',
                ' NOT ':'!'
            };
            angular.forEach(replaceArray, function(value, key) {
                var regex = new RegExp(key, "g");
                condition = condition.replace(regex, value);
            });
            return(eval(condition));
        };
        serviceInstance.executeAction=function(action){
            var replaceArray={
                'USER.DATA.':"serviceInstance.fingerprintData.",
                'USER.ISCONNECTED':'USER.ISCONNECTED()',
                'USER.ISGEOLOCATED':'USER.ISGEOLOCATED()',
                'USER.RUID':'USER.RUID()',
                'USER.ISEMAILVALID':'USER.ISEMAILVALID()',
                'SESSION.DURATION':'SESSION.DURATION()',
                'PAGE.TIMEONPAGE':'PAGE.TIMEONPAGE()',
                'PAGE.REFERRER':'PAGE.REFERRER()',
                ' AND ':'&&',
                ' OR ':'||',
                ' NOT ':'!',
                'PAGE.NBVIEWS':"'pages."+current.page.id+".nbViews'"
            };
            angular.forEach(replaceArray, function(value, key) {
                var regex = new RegExp(key, "g");
                action = action.replace(regex, value);
            });
            eval(action);
        };
        serviceInstance.parse=function(instruction){
            if (instruction.indexOf("WHEN")>-1&&instruction.indexOf("DO")>-1){
                var splittedInstruction=instruction.replace("WHEN","").split("DO");
                var eventName=splittedInstruction[0].trim();
                if (!current.rEvents[eventName]){
                    current.rEvents[eventName]=[];
                }
                current.rEvents[eventName].push(splittedInstruction[1])

            } else if(instruction.indexOf("DELAY")>-1){
                var splittedInstruction=instruction.split("DELAY");
                current.queue.push(
                    $timeout(function(){
                        serviceInstance.segment(splittedInstruction[0]);
                    },parseInt(splittedInstruction[1]))
                );
            } else {
                serviceInstance.segment(instruction);
            }

        };
        serviceInstance.segment=function(instruction){
            serviceInstance.fingerprintData=RubedoFingerprintDataService.getFingerprintData();
            if(instruction.indexOf("IF")>-1&&instruction.indexOf("THEN")>-1){
                var splittedInstruction=instruction.replace("IF","").split("THEN");
                if(serviceInstance.evaluateCondition(splittedInstruction[0])){
                    serviceInstance.executeAction(splittedInstruction[1]);
                }
            } else {
                serviceInstance.executeAction(instruction);
            }
        };
        return serviceInstance;
    }]);
 
    app.controller("RubedoController",['RubedoBlockTemplateResolver','RubedoImageUrlService','RubedoAuthService','RubedoFieldTemplateResolver','snapRemote','RubedoPageComponents','RubedoTranslationsService','$scope','$routeParams','RubedoClickStreamService','$rootScope','UXUserService','UXPageService','UXSessionService',
        function(RubedoBlockTemplateResolver,RubedoImageUrlService,RubedoAuthService,RubedoFieldTemplateResolver,snapRemote, RubedoPageComponents, RubedoTranslationsService,$scope,$routeParams,RubedoClickStreamService,$rootScope,UXUserService,UXPageService,UXSessionService){
        var me=this;
        //break nav on non-page routes
        $scope.$on("$locationChangeStart",function(event, newLoc,currentLoc){
            if (newLoc.indexOf("file?file-id") > -1||newLoc.indexOf("dam?media-id") > -1){
                event.preventDefault();
                window.location.href=newLoc;
            } else if (newLoc.indexOf("#") > -1){
                event.preventDefault();
                var target=angular.element("[name='"+newLoc.split("#")[1]+"']");
                if (target&&target.length>0){
                    angular.element("body,html").animate({scrollTop: target.offset().top}, "slow");
                } else {
                    window.location.href=newLoc.slice(0,newLoc.indexOf("#"));
                }
            } else {
                if (window.ga) {
                    window.ga('send', 'pageview', newLoc);
                }
                if (currentLoc&&currentLoc!=""&&currentLoc!=newLoc){
                    UXPageService.setAngReferrer(currentLoc);
                }
                UXPageService.resetPageLoad();

            }
        });
        $scope.$on("$locationChangeSuccess",function(scope, newLoc,currentLoc){
            if(newLoc.indexOf("?") > -1){
// if change of page -> wait for load
                if (currentLoc.split("?")[0] != newLoc.split("?")[0]) {
                    setTimeout(function(){
                        var target=angular.element("[name='"+$routeParams.anchor+"']");
                        if (target){
                                angular.element("body,html").animate({scrollTop: target.offset().top-50}, "slow");
                        }
                    },3000);
               }
               else{
// if first page with anchor (direct access) -> wait for load
                    if ( currentLoc.split("?")[1] == newLoc.split("?")[1]) {
                        setTimeout(function(){
                            var target=angular.element("[name='"+$routeParams.anchor+"']");
                            if (target){
                                    angular.element("body,html").animate({scrollTop: target.offset().top-50}, "slow");
                            }
                        },3000);
                    }
// if same page and different anchor -> scroll
                    else {
                        var target=angular.element("[name='"+$routeParams.anchor+"']");
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
            me.setPageTitle=function(newTitle){
                me.current.page.title=newTitle;
            };
            me.setPageDescription=function(newDescription){
                me.current.page.description=newDescription;
            };
            me.sendGaEvent = function(cat, label) {
                if(window.ga) {
                    window.ga('send', 'pageview', cat+label);
                }
            };
            $scope.$on("ClickStreamEvent",function(event,args){
                if (typeof(Fingerprint2)!="undefined"&&args&&args.csEvent){
                    RubedoClickStreamService.logEvent(args.csEvent,args.csEventArgs);
                }
            });

            me.fireCSEvent=function(event,args){
                $rootScope.$broadcast("ClickStreamEvent",{csEvent:event,csEventArgs:args});
            };

            USER=UXUserService;
            $scope.USER=USER;

            PAGE=UXPageService;
            $scope.PAGE=PAGE;

            SESSION=UXSessionService;
            $scope.SESSION=SESSION;

    }]);

    app.controller("PageBodyController",['RubedoPagesService', 'RubedoModuleConfigService','$scope','RubedoBlockDependencyResolver','$rootScope','UXCore','$timeout',function(RubedoPagesService, RubedoModuleConfigService,$scope,RubedoBlockDependencyResolver,$rootScope,UXCore,$timeout){
        var me=this;
        if ($scope.rubedo.fieldEditMode){
            $scope.rubedo.revertChanges();
        }
        angular.forEach(current.queue,function(task){
            $timeout.cancel(task);
        });
        current.queue=[];
        current.rEvents={ };
        $scope.$on("ClickStreamEvent",function(event,args){
            if(args.csEvent&&current.rEvents[args.csEvent]){
                angular.forEach(current.rEvents[args.csEvent],function(instructionToHandle){
                    if(instructionToHandle!=""){
                        UXCore.parse(instructionToHandle);
                    }
                });
            }
        });
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
                //UX
                if (newPage.pageProperties&&newPage.pageProperties.UXInstructions&&newPage.pageProperties.UXInstructions!=""){
                    if (newPage.pageProperties.UXInstructions.indexOf("\n")>-1){
                        var maskInstructionsArray=newPage.pageProperties.UXInstructions.split("\n");
                        angular.forEach(maskInstructionsArray,function(instruction){
                            if(instruction!=""){
                                UXCore.parse(instruction);
                            }
                        });
                    } else {
                        UXCore.parse(newPage.pageProperties.UXInstructions);
                    }

                }
                if (newPage.UXInstructions&&newPage.UXInstructions!=""){
                    if (newPage.UXInstructions.indexOf("\n")>-1){
                        var instructionsArray=newPage.UXInstructions.split("\n");
                        angular.forEach(instructionsArray,function(instruction){
                            if(instruction!=""){
                                UXCore.parse(instruction);
                            }
                        });
                    } else {
                        UXCore.parse(newPage.UXInstructions);
                    }

                }
                //Page load
                $rootScope.$broadcast("ClickStreamEvent",{csEvent:"pageView",csEventArgs:{
                    pageId:newPage.id,
                    siteId:response.data.site.id,
                    pageTaxo:newPage.taxonomy
                }});

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
