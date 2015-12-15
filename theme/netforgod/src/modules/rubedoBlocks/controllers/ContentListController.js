angular.module("rubedoBlocks").lazy.controller("ContentListController",['$scope','$compile','RubedoContentsService',"$route","RubedoContentTypesService","RubedoPagesService","$location","TaxonomyService",
                                                                        function($scope,$compile,RubedoContentsService,$route,RubedoContentTypesService,RubedoPagesService,$location,TaxonomyService){
    var me = this;
    me.contentList=[];
    var config=$scope.blockConfig;
    var blockPagingIdentifier=$scope.block.bType+$scope.block.id.substring(21)+"Page";
    var pageId=$scope.rubedo.current.page.id;
    var siteId=$scope.rubedo.current.site.id;
    var alreadyPersist = false;
    me.contentHeight = config.summaryHeight?config.summaryHeight:80;
    me.start = config.resultsSkip?config.resultsSkip:0;
    me.limit = config.pageSize?config.pageSize:12;
    me.ismagic = config.magicQuery ? config.magicQuery : false;
    me.filmsList = false;
    $scope.showFilters=false;
    var urlCurrentPage=$location.search()[blockPagingIdentifier];
    if (urlCurrentPage){
        me.start=(urlCurrentPage-1)*me.limit;
    }
    var options = {
        start: me.start,
        limit: me.limit,
        ismagic: me.ismagic
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
        $location.search(blockPagingIdentifier,(me.start/me.limit)+1);
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
        RubedoContentsService.getContents(queryId,pageId,siteId, options).then(function(response){
            if (response.data.success){
                me.count = response.data.count;
                me.queryType=response.data.queryType;
                me.usedContentTypes=response.data.usedContentTypes;
                if (me.usedContentTypes[0]=="54cb447145205e7d09db0590" && me.limit>1) {
                    me.filmsList = true;
                    var columnContentList = [];
                    var currentSeason = null;
                    angular.forEach(response.data.contents,function(newContent, key){
                        newContent.anneeFormatted = (newContent.fields.annee>=10)? '20'+newContent.fields.annee : '200'+newContent.fields.annee;
                        if(currentSeason && newContent.fields.annee != currentSeason){
                            me.contentList.push(columnContentList);
                            columnContentList = [];
                        }
                        columnContentList.push(newContent);
                        currentSeason = newContent.fields.annee;
                    });
                    if (columnContentList.length > 0){
                        me.contentList.push(columnContentList);
                    }
                    
                    var taxonomiesArray = {};
                    taxonomiesArray[0] = '54cb636245205e0110db058f';//taxo de thématiques
                    // taxo de lieux : '54d6299445205e7877a6b28e'
                    TaxonomyService.getTaxonomyByVocabulary(taxonomiesArray).then(function(response){
                         if(response.data.success){
                            var tax = response.data.taxo;
                            me.taxo={};
                            angular.forEach(tax, function(taxonomie){
                                me.taxo[taxonomie.vocabulary.id] = taxonomie.terms;
                            });

                         }
                         
                     });
                    
                    
                }
                else {
                    var columnContentList = [];
                    if (add){
                        angular.forEach(response.data.contents,function(newContent){
                            columnContentList.push(newContent);
                        });
                        me.contentList.push(columnContentList);
                    } else {
                        me.contentList=[];
                        angular.forEach(response.data.contents,function(newContent, key){
                            columnContentList.push(newContent);
                            if(config.columns && (key+1) % (Math.ceil(response.data.contents.length/config.columns)) == 0){
                                me.contentList.push(columnContentList);
                                columnContentList = [];
                            }
                        });
                        if (columnContentList.length > 0){
                            me.contentList.push(columnContentList);
                        }
                    }                    
                }
                
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
    }
    me.launchFOContribute=function(){
        if(me.editorPageUrl){
            $location.url(me.editorPageUrl);
        }
    }

    me.previewIndex = -1; me.seasonIndex = -1;
    /*liste des films : toggle preview*/
    me.togglePreview = function(parentIndex,index){
        var preview = Math.floor(index/4)+1;
        var actualPreview = Math.floor(me.previewIndex/4)+1;
       if(me.seasonIndex==parentIndex && me.previewIndex  == index) {angular.element("#preview"+parentIndex+"_"+preview).collapse("hide"); me.previewIndex = -1; me.seasonIndex = -1; console.log("same");}// même saison,même index= -> on toggle
       else if((me.seasonIndex==parentIndex && preview != actualPreview) || me.seasonIndex!=parentIndex) { // même saison mais autre preview OU différente saison
            angular.element("#preview"+parentIndex+"_"+preview).collapse("show");
            angular.element("#preview"+me.seasonIndex+"_"+actualPreview).collapse("hide");
            me.previewIndex = index; me.seasonIndex=parentIndex;
        }
        else {me.previewIndex = index; me.seasonIndex=parentIndex;}
       
    }    
    $scope.isExpanded = function(parentIndex, index){
        if (me.seasonIndex==parentIndex && me.previewIndex  == index) {
            return true;
        }
        else return false;
    };   
    me.setIndex = function(parentIndex,index){
        me.previewIndex = index; me.seasonIndex=parentIndex;
    }
}]);
angular.module("rubedoBlocks").lazy.controller("ContentListDetailController",['$scope','$compile','RubedoContentsService',function($scope,$compile,RubedoContentsService){
    var me = this;
    
    me.index = $scope.$index;
    me.parentIndex = $scope.columnIndex;
    me.content = $scope.content;
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


angular.module("rubedoBlocks").lazy.controller("SearchFilmsController",["$scope","$location","$routeParams","$compile","RubedoSearchService",
    function($scope,$location,$routeParams,$compile,RubedoSearchService){
        var me = this;
        var themePath="/theme/"+window.rubedoConfig.siteTheme;
        me.data = [];
        me.facets = [];
        me.activeFacets = [];
        me.start = 0;
        me.limit = $routeParams.limit?$routeParams.limit:10;
        me.orderBy = $routeParams.orderby?$routeParams.orderby:"date";
        var resolveOrderBy = {
            'lastUpdateTime': 'date',
            'authorName': 'author',
            'text': 'title'
        };
        me.displayOrderBy = $routeParams.orderby?resolveOrderBy[$routeParams.orderby]:$scope.rubedo.translate('Search.Label.OrderByRelevance');
        var predefinedFacets = {"type":"54cb447145205e7d09db0590"};
        var facetsId = ['objectType','type','damType','userType','author','userName','lastupdatetime','price','inStock','query'];
        var defaultOptions = {
            start: 0,
            limit: 20,
            constrainToSite: true,
            predefinedFacets: predefinedFacets,
            displayMode: 'checkbox',
            displayedFacets: [{"name":"54cb636245205e0110db058f","operator":"OR"},{"name":"54d6299445205e7877a6b28e","operator":"AND"}],
            orderby: me.orderBy,
            pageId: $scope.rubedo.current.page.id,
            siteId: $scope.rubedo.current.site.id
        };
        /*if (config.singlePage){
            defaultOptions.detailPageId = config.singlePage;
        }
        if(config.profilePage){
            defaultOptions.profilePageId = config.profilePage;
        }*/
        var options = angular.copy(defaultOptions);
        var parseQueryParamsToOptions = function(){
            angular.forEach($location.search(), function(queryParam, key){
                if(typeof queryParam !== "boolean"){
                    if(key == 'taxonomies'){
                        options[key] = JSON.parse(queryParam);
                    } else {
                        if(key == 'query'){
                            me.query = queryParam;
                        }
                        options[key] = queryParam;
                    }
                }
            });
        };
        if(predefinedFacets.query) {
            me.query = options.query = predefinedFacets.query;
            $location.search('query',me.query);
        }
        $scope.$on('$routeUpdate', function(scope, next, current) {
            options = angular.copy(defaultOptions);
            options.start = me.start;
            options.limit = me.limit;
            options.orderBy = me.orderBy;
            parseQueryParamsToOptions();
            me.searchByQuery(options, true);
        });
        me.checked = function(term){
            var checked = false;
            angular.forEach(me.activeTerms,function(activeTerm){
                if (!checked){
                    checked = activeTerm.term==term;
                }
            });
            return checked;
        };
        me.disabled = function(term){
            var disabled = false;
            angular.forEach(me.notRemovableTerms,function(notRemovableTerm){
                disabled = notRemovableTerm.term == term;
            });
        };
        me.changePageAction = function(){
            options.start = me.start;
            me.searchByQuery(options);
        };
        me.onSubmit = function(){
            me.start = 0;
            options = angular.copy(defaultOptions);
            options.start = me.start;
            options.limit = me.limit;
            options.query = me.query;
            options.orderBy = me.orderBy;
            $location.search('query',me.query);
        };
        me.changeOrderBy = function(orderBy){
            if(me.orderBy != orderBy){
                me.orderBy = orderBy;
                me.displayOrderBy = resolveOrderBy[orderBy];
                me.start = 0;
                $location.search('orderby',me.orderBy);
            }
        };
        me.changeLimit = function(limit){
            if(me.limit != limit){
                me.limit = limit;
                me.start = 0;
                $location.search('limit',me.limit);
            }
        };
        me.target = function(data){
            var res = '';
            if (data.objectType == 'dam'){
                res = '_blank';
            }
            return res;
        };
        me.clickOnFacets =  function(facetId,term){
            var del = false;
            angular.forEach(me.activeTerms,function(activeTerm){
                if(!del){
                    del = (activeTerm.term==term && activeTerm.facetId==facetId);
                }
            });
            if(del){
                if(facetsId.indexOf(facetId)==-1){
                    options.taxonomies[facetId].splice(options.taxonomies[facetId].indexOf(term),1);
                    if(options.taxonomies[facetId].length == 0){
                        delete options.taxonomies[facetId];
                    }
                    if(Object.keys(options['taxonomies']).length == 0){
                        $location.search('taxonomies',null);
                    } else {
                        $location.search('taxonomies',JSON.stringify(options.taxonomies));
                    }
                } else if (facetId == 'query') {
                    $location.search('query',null);
                    delete options.query;
                } else if(facetId == 'lastupdatetime'||facetId == 'price'||facetId == 'inStock') {
                    delete options[facetId];
                    $location.search(facetId,null);
                } else {
                    if(angular.isArray(options[facetId+'[]'])){
                        options[facetId+'[]'].splice(options[facetId+'[]'].indexOf(term),1);
                    } else {
                        delete options[facetId+'[]'];
                    }
                    if(!options[facetId+'[]'] || options[facetId+'[]'].length == 0){
                        $location.search(facetId+'[]',null)
                    } else {
                        $location.search(facetId+'[]',options[facetId+'[]']);
                    }
                }
            } else {
                if(facetsId.indexOf(facetId)==-1){
                    if(!options.taxonomies){
                        options.taxonomies = {};
                    }
                    if(!options.taxonomies[facetId]){
                        options.taxonomies[facetId] = [];
                    }
                    options.taxonomies[facetId].push(term);
                    $location.search('taxonomies',JSON.stringify(options.taxonomies));
                } else if(facetId == 'lastupdatetime'||facetId == 'price'||facetId == 'inStock') {
                    options[facetId] = term;
                    $location.search(facetId,options[facetId]);
                } else {
                    if(!options[facetId+'[]']){
                        options[facetId+'[]'] = [];
                    }
                    options[facetId+'[]'].push(term);
                    $location.search(facetId+'[]',options[facetId+'[]']);
                }
            }
            me.start = 0;
            options.start = me.start;
        };

        me.searchByQuery = function(options){
            RubedoSearchService.searchByQuery(options).then(function(response){
                if(response.data.success){
                    me.query = response.data.results.query;
                    me.count = response.data.count;
                    me.data =  response.data.results.data;
                    me.facets = response.data.results.facets;
                    me.notRemovableTerms = [];
                    me.activeTerms = [];
                    var previousFacetId;
                    angular.forEach(response.data.results.activeFacets,function(activeFacet){
                        if(activeFacet.id != 'navigation'){
                            angular.forEach(activeFacet.terms,function(term){
                                var newTerm = {};
                                newTerm.term = term.term;
                                newTerm.label = term.label;
                                newTerm.facetId = activeFacet.id;
                                if(previousFacetId == activeFacet.id){
                                    newTerm.operator =' '+(activeFacet.operator)+' ';
                                } else if (previousFacetId && me.notRemovableTerms.length != 0){
                                    newTerm.operator = ', ';
                                }
                                if(predefinedFacets.hasOwnProperty(activeFacet.id) && predefinedFacets[activeFacet.id]==term.term){
                                    me.notRemovableTerms.push(newTerm);
                                } else {
                                    me.activeTerms.push(newTerm);
                                }
                                previousFacetId = activeFacet.id;
                            });
                        }
                    });
                }
            })
        };
        parseQueryParamsToOptions();
        me.searchByQuery(options);
    }]);