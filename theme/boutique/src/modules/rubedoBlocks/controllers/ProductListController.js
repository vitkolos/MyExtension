angular.module("rubedoBlocks").lazy.controller("ProductListController",['$scope','$compile','RubedoProductsService',"$route","RubedoContentTypesService","RubedoContentsService","RubedoPagesService",function($scope,$compile,RubedoProductsService,$route,RubedoContentTypesService,RubedoContentsService,RubedoPagesService){
    var me = this;
    me.contentList=[];
    var config=$scope.blockConfig;
    var pageId=$scope.rubedo.current.page.id;
    var siteId=$scope.rubedo.current.site.id;
    var alreadyPersist = false;
    me.contentHeight = config.summaryHeight ? config.summaryHeight : null;
    me.summaryStyle={};
    if (me.contentHeight){
        me.summaryStyle['height']=me.contentHeight+"px";
        me.summaryStyle['overflow']="hidden";
    }
    me.start = config.resultsSkip?config.resultsSkip:0;
    me.limit = config.pageSize?config.pageSize:12;
    me.ismagic = config.magicQuery ? config.magicQuery : false;
    me.imageField= config.imageField ? config.imageField : "image";
    me.imageHeight= config.imageHeight ? config.imageHeight : null;
    me.imageWidth= config.imageWidth ? config.imageWidth : null;
    me.imageStyle={};
    if (me.imageHeight){
        me.imageStyle['height']=me.imageHeight+"px";
        me.imageStyle['overflow']="hidden";
    }
    me.imageResizeMode= config.imageResizeMode ? config.imageResizeMode : "boxed";
    var options = {
        start: me.start,
        limit: me.limit,
        ismagic: me.ismagic,
        'fields[]' : ["text","summary",me.imageField]
    };
    if(config.singlePage){
        options.detailPageId = config.singlePage;
    }
    if(config.enableFOContrib&&$scope.rubedo.current.user){
        options.foContributeMode = true;
        me.isFOContributeMode=true;
        if (config.editorPageId){
            RubedoPagesService.getPageById(config.editorPageId).then(function(response){
                if (response.data.success){
                    me.editorPageUrl=response.data.url;
                }
            });
        }
    }
    me.titleOnly = config.showOnlyTitle;
    me.columns = config.columns && !config.infiniteScroll ? 'col-md-'+(12/config.columns):'col-md-12';
    me.showPaginator = config.showPager && !config.infiniteScroll;
    me.changePageAction = function(){
        options.start = me.start;
        me.getContents(config.query, pageId, siteId, options);
    };
    $scope.$watch('rubedo.fieldEditMode', function(newValue) {
        alreadyPersist = false;
        me.showPaginator = newValue ? false : config.showPager && !config.infiniteScroll;
        if (newValue&&me.queryType&&me.queryType=="manual"&&!me.creatableContentTypes){
            RubedoContentTypesService.getContentTypes().then(
                function(response){
                    if (response.data.success){
                        me.creatableContentTypes=response.data.contentTypes;
                        if (response.data.contentTypes.length>0){
                            me.selectedManualType=response.data.contentTypes[0].id;
                        }

                    }
                }
            );
        }
    });
    if (config.infiniteScroll){
        me.limit = options['limit'];
        me.blockStyle = {
            height: (me.limit * me.contentHeight - me.contentHeight)+'px',
            'overflow-y': 'scroll'
        };
        me.timeThreshold = config['timeThreshold'] ? config['timeThreshold']:200;
        me.scrollThreshold = config['scrollThreshold'] ? config['scrollThreshold']:300;
    } else {
        me.blockStyle = {
            'overflow-y': 'visible'
        };
    }
    me.getContents = function (queryId, pageId, siteId, options, add){
        RubedoProductsService.getContents(queryId,pageId,siteId, options).then(function(response){
            if (response.data.success){
                me.count = response.data.count;
                me.queryType=response.data.queryType;
                me.usedContentTypes=response.data.usedContentTypes;
                var columnContentList = [];
                if (add){
                    angular.forEach(response.data.contents,function(newContent){
                        columnContentList.push(newContent);
                    });
                    me.contentList.push(columnContentList);
                    //setTimeout(function(){me.initCarousel();},100);
                } else {
                    me.contentList=[];
                    angular.forEach(response.data.contents,function(newContent, key){
                        columnContentList.push(newContent);
                        if(config.columns && (key+1) % (Math.ceil(response.data.contents.length/config.columns)) == 0){
                            me.contentList.push(columnContentList);
                            columnContentList = [];
                        }
                    });
                    //setTimeout(function(){me.initCarousel();},100);

                    if (columnContentList.length > 0){
                        me.contentList.push(columnContentList);
                        //setTimeout(function(){me.initCarousel();},100);

                    }
                }
                setTimeout(function(){me.initCarousel();},100);
            }
        });
    };
    me.canAddToList=function(){
        return ($scope.rubedo.fieldEditMode&&me.queryType&&(me.queryType=="simple"||me.queryType=="manual"));
    };
    me.launchContribute=function(){
        if ($scope.rubedo.fieldEditMode){
            if (me.queryType=="simple"){
                me.displayEditorModal(me.usedContentTypes[0]);
            } else if (me.queryType=="manual"&&me.selectedManualType){
                me.displayEditorModal(me.selectedManualType);
            }

        }
    };
    me.displayEditorModal=function(typeId){
        var modalUrl = "/backoffice/content-contributor?typeId=" + typeId + "&queryId=" + config.query + "&current-page=" + $scope.rubedo.current.page.id + "&current-workspace=" + "global" +"&workingLanguage="+$route.current.params.lang;
        var availHeight=window.innerHeight*(90/100);
        var properHeight=Math.max(400,availHeight);
        var iframeHeight=properHeight-10;
        angular.element("#content-contribute-frame").empty();
        angular.element("#content-contribute-frame").html("<iframe style='width:100%;  height:"+iframeHeight+"px; border:none;' src='" + modalUrl + "'></iframe>");
        angular.element('#content-contribute-modal').appendTo('body').modal('show');
        window.confirmContentContribution=function(){
            angular.element("#content-contribute-frame").empty();
            angular.element('#content-contribute-modal').modal('hide');
            $scope.rubedo.addNotification("success","Success","Contents created.");
            me.getContents(config.query, pageId, siteId, options, false);
        };
        window.cancelContentContribution=function(){
            angular.element("#content-contribute-frame").empty();
            angular.element('#content-contribute-modal').modal('hide');
        };
    };
    $scope.loadMoreContents = function(){
        if (options['start'] + options['limit'] < me.count && !$scope.rubedo.fieldEditMode){
            options['start'] += options['limit'];
            me.getContents(config.query, pageId, siteId, options, true);
        }
    };
    $scope.persistAllChanges = function(){
        var contentsToPerist = [];
        var keysContent = [];
        if(!alreadyPersist){
            angular.forEach($scope.rubedo.registeredEditCtrls, function(contentCtrl){
                if(contentCtrl.index || contentCtrl.index === 0){
                    delete (contentCtrl.content.type);
                    contentsToPerist.push(contentCtrl.content);
                    keysContent.push({
                        index: contentCtrl.index,
                        parentIndex: contentCtrl.parentIndex
                    });
                }
            });
            RubedoContentsService.updateContents(contentsToPerist).then(
                function(response){
                    if (response.data.success){
                        var notUpdateContents = [];
                        angular.forEach(response.data.versions, function(version, key){
                            if(version){
                                me.contentList[keysContent[key]['parentIndex']][keysContent[key]['index']]['version'] = version;
                            } else {
                                notUpdateContents.push(me.contentList[keysContent[key]['parentIndex']][keysContent[key]['index']]['fields']['text']);
                            }
                        });
                        if (notUpdateContents.length === 0){
                            $scope.rubedo.addNotification("success","Success","Contents updated.");
                        } else {
                            $scope.rubedo.addNotification("warning","Warning","Some contents have not been updated",6000);
                            angular.forEach(notUpdateContents, function(notUpdate){
                                $scope.rubedo.addNotification("danger","Error","Contents update error : "+notUpdate, 6000);
                            });
                        }
                    } else {
                        $scope.rubedo.addNotification("danger","Error","Contents update error.");
                    }

                },
                function(response){
                    $scope.rubedo.addNotification("danger","Error","Contents update error.");
                }
            );
            alreadyPersist = true;
        }
    };
    if(config.query){
        me.getContents(config.query, pageId, siteId, options, false);
    };
    me.initCarousel=function(){
        var targetElSelector="owl-id";
        var owlOptions={
            responsiveBaseWidth:targetElSelector,
            singleItem:true,
            pagination: false,
            navigation: false,
            autoPlay: true,
            stopOnHover: true,
            paginationNumbers:false,
            navigationText: ['<span class="glyphicon glyphicon-chevron-left"></span>','<span class="glyphicon glyphicon-chevron-right"></span>'],
            lazyLoad:true
        };
        angular.element(targetElSelector).owlCarousel(owlOptions);
    };
}]);
angular.module("rubedoBlocks").lazy.controller("ProductListDetailController",['$scope','$compile','RubedoProductsService','RubedoShoppingCartService','$rootScope',function($scope,$compile,RubedoProductsService,RubedoShoppingCartService,$rootScope){
    var me = this;
    me.index = $scope.$index;
    me.parentIndex = $scope.columnIndex;
    me.content = $scope.content;
    me.canOrder=function(){
        return !(me.content.productProperties.manageStock&&(me.content.productProperties.canOrderNotInStock=="false")&&(me.content.productProperties.variations[0].stock < me.content.productProperties.outOfStockLimit)) ;
    };
    me.addToCart=function(){
        var options={
            productId:me.content.id,
            variationId:me.content.productProperties.variations[0].id,
            amount:1
        };
        RubedoShoppingCartService.addToCart(options).then(
            function(response){
                $rootScope.$broadcast("shoppingCartUpdated",{emitter:"listProductBox"});
            }
        );
    };
    $scope.fieldEntity=angular.copy(me.content.fields);
    $scope.fieldLanguage=me.content.locale;
    $scope.fieldInputMode=false;
    $scope.$watch('rubedo.fieldEditMode', function(newValue) {
        $scope.fieldEditMode=$scope.content.content&&me.content.readOnly ? false : newValue;

    });
    me.registerEditChanges=function(){
        $scope.rubedo.registerEditCtrl(me);
    };
    me.persistChanges = function(){
        me.content.fields = angular.copy($scope.fieldEntity);
        $scope.$parent.$parent.$parent.persistAllChanges();
    };
    me.revertChanges = function(){
        $scope.fieldEntity = angular.copy(me.content.fields);
    };
    $scope.content.type = {
        title:
        {
            cType:"textfield",
            config:{
                name:"text",
                fieldLabel:"Title",
                allowBlank:false
            }
        },
        summary:
        {
            cType:"textarea",
            config:{
                name:"summary",
                fieldLabel:"Summary",
                allowBlank:false
            }
        }
    };
    $scope.registerFieldEditChanges = me.registerEditChanges;
}]);