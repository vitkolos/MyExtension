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
    $scope.rubedo.showSearchList = false;
    $scope.showFilters=false;
    me.showFilters = function(){
        if ($scope.showFilters) {
            $scope.rubedo.showSearchList = false;
        }
        $scope.showFilters = !$scope.showFilters;
    }
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
        //options.foContributeMode = true;
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
        options.start += me.limit;
        options.limit += me.limit;
        me.getContents(config.query, pageId, siteId, options, true);
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
                    
                    if (!add) {
                        var columnContentList = [];
                    }
                    var currentSeason = null;
                    angular.forEach(response.data.contents,function(newContent, key){
                        newContent.anneeFormatted = (newContent.fields.annee>=10)? '20'+newContent.fields.annee : '200'+newContent.fields.annee;
                        if( (currentSeason && newContent.fields.annee != currentSeason) || currentSeason==0){
                            me.contentList.push(columnContentList);
                            columnContentList = [];
                        }
                        columnContentList.push(newContent);
                        currentSeason = newContent.fields.annee;
                    });
                    if (columnContentList.length > 0){
                        me.contentList.push(columnContentList);
                    }
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
//get taxonomy
    var taxonomiesArray = {};
    taxonomiesArray[0] = '54cb636245205e0110db058f';//taxo de thématiques
    // taxo de lieux : '54d6299445205e7877a6b28e'

    TaxonomyService.getTaxonomyByVocabulary(taxonomiesArray).then(function(response){
         if(response.data.success){
            var tax = response.data.taxo;
            me.taxo={};
            angular.forEach(tax, function(taxonomie){
               me.taxo[taxonomie.vocabulary.id] = {};
               //get taxonomies
               angular.forEach(taxonomie.terms, function(term){
                   me.taxo[taxonomie.vocabulary.id][term.id] = term;
               });                  
            });

         }
         
     });
    me.previewIndex = -1; me.seasonIndex = -1;
    /*liste des films : toggle preview*/
  
    me.setIndex = function(index){
        me.previewIndex = index; 
    }
    // pour fermer le modal quand on clique sur un lien
    $scope.$on("$locationChangeStart",function(event, newLoc,currentLoc){
        angular.element('body .modal-backdrop ').remove();
    });
    
    
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
        $scope.locale = $scope.rubedo.current.site.locale;
        var themePath="/theme/"+window.rubedoConfig.siteTheme;
        me.taxo=$scope.contentListCtrl.taxo;
        me.data = [];
        me.facets = [];
        me.activeFacets = [];
        me.start = 0;
        me.limit = $routeParams.limit?$routeParams.limit:20;
        me.orderBy = $routeParams.orderby?$routeParams.orderby:"date";
        var resolveOrderBy = {
            'lastUpdateTime': 'date',
            'authorName': 'author',
            'text': 'title'
        };
        me.displayOrderBy = $routeParams.orderby?resolveOrderBy[$routeParams.orderby]:$scope.rubedo.translate('Search.Label.OrderByRelevance');
        var predefinedFacets = {"type":"54cb447145205e7d09db0590"};
        var facetsId = ['objectType','type','damType','userType','author','userName','lastupdatetime','price','inStock','query'];
        var displayedFacets = [];
        displayedFacets.push({"name":"54cb636245205e0110db058f","operator":"AND"});
        //displayedFacets.push({"name":"54d6299445205e7877a6b28e","operator":"AND"});
        me.options = {};
       me.options = {
            start: me.start,
            limit: 20,
            constrainToSite: false,
            predefinedFacets: predefinedFacets,
            displayMode: 'checkbox',
            displayedFacets: JSON.stringify(displayedFacets),
            orderby: me.orderBy,
            pageId: $scope.rubedo.current.page.id,
            siteId: $scope.rubedo.current.site.id
        };

       
        if(predefinedFacets.query) {
            me.options.query =  predefinedFacets.query;
            me.updateSearch();
        }
        me.filter = function(termId) {
            $scope.rubedo.showSearchList = true;
            me.clickOnFacets('54cb636245205e0110db058f',termId);
        };
        /*$scope.$on('$routeUpdate', function(scope, next, current) {
            options = angular.copy(defaultOptions);
            options.start = me.start;
            options.limit = me.limit;
            options.orderBy = me.orderBy;
            parseQueryParamsToOptions();
            me.searchByQuery(options, true);
        });*/
        me.checkedFacets = {};
        me.checked = function(term){
            var checked = false;
            angular.forEach(me.checkedFacets,function(facet){
                if (facet[term]){
                    checked = true;
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
            $scope.rubedo.showSearchList = true;
            me.options.start = 0;
            me.options.limit = me.limit;
            me.options.query = me.query;
            me.updateSearch();
        };
        me.changeOrderBy = function(orderBy){
            if(me.orderBy != orderBy){
                me.orderBy = orderBy;
                me.displayOrderBy = resolveOrderBy[orderBy];
                me.start = 0;
                me.updateSearch();
            }
        };
        me.changeLimit = function(limit){
            if(me.limit != limit){
                me.limit = limit;
                me.start = 0;
                $location.search('limit',me.limit);
            }
        };

        me.updateSearch = function() {
            me.options.start = me.start;
            me.options.limit = me.limit;
            me.options.orderBy = me.orderBy;
            me.searchByQuery(me.options, true);
        };
        me.clickOnFacets =  function(facetId,term){
            var del = false;
            if (!me.checkedFacets[facetId]) {
                me.checkedFacets[facetId]={};
                me.checkedFacets[facetId][term]=1;
            }
            else {
                if (me.checkedFacets[facetId][term]) {
                    del=true;
                    delete me.checkedFacets[facetId][term];
                }
                else me.checkedFacets[facetId][term]=1;
            }
            if(del){
                if(facetsId.indexOf(facetId)==-1){
                    me.options.taxonomies[facetId].splice(me.options.taxonomies[facetId].indexOf(term),1);
                    if(me.options.taxonomies[facetId].length == 0){
                        delete me.options.taxonomies[facetId];
                    }
                    me.updateSearch();
                } else if (facetId == 'query') {
                    delete me.options.query;
                    me.updateSearch();
                } else if(facetId == 'lastupdatetime'||facetId == 'price'||facetId == 'inStock') {
                    delete me.options[facetId];
                    me.updateSearch();
                } else {
                    if(angular.isArray(me.options[facetId+'[]'])){
                        me.options[facetId+'[]'].splice(me.options[facetId+'[]'].indexOf(term),1);
                    } else {
                        delete me.options[facetId+'[]'];
                    }
                    if(!me.options[facetId+'[]'] || me.options[facetId+'[]'].length == 0){
                        me.updateSearch();
                    } else {
                        me.updateSearch();
                    }
                }
            } else {
                if(facetsId.indexOf(facetId)==-1){
                    if(!me.options.taxonomies){
                        me.options.taxonomies = {};
                    }
                    if(!me.options.taxonomies[facetId]){
                        me.options.taxonomies[facetId] = [];
                    }
                    me.options.taxonomies[facetId].push(term);
                    me.updateSearch();
                } else if(facetId == 'lastupdatetime'||facetId == 'price'||facetId == 'inStock') {
                    me.options[facetId] = term;
                    me.updateSearch();
                } else {
                    if(!me.options[facetId+'[]']){
                        me.options[facetId+'[]'] = [];
                    }
                    me.options[facetId+'[]'].push(term);
                    me.updateSearch();
                }
            }
            me.start = 0;
            me.options.start = me.start;
        };
        var firstTime=false;
        me.searchByQuery = function(options){
            RubedoSearchService.searchByQuery(options).then(function(response){
                if(response.data.success){
                    me.query = response.data.results.query;
                    me.count = response.data.count;
                    me.data =  response.data.results.data;
                    me.facets = response.data.results.facets;
                   if (!firstTime) {
                        angular.forEach(me.taxo["54cb636245205e0110db058f"], function(term){
                            if(term.count) delete(term.count);
                        });
                   }
                   angular.forEach(me.facets[0].terms, function(term){
                       if(me.taxo["54cb636245205e0110db058f"][term.term]) me.taxo["54cb636245205e0110db058f"][term.term].count = term.count;
                   });
                }
            })
        };
        //parseQueryParamsToOptions();
        me.searchByQuery(me.options);
        
    }]);