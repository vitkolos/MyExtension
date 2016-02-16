angular.module("rubedoBlocks").lazy.controller("SearchResultsController",["$scope","$location","$routeParams","$compile","RubedoSearchService",
    function($scope,$location,$routeParams,$compile,RubedoSearchService){
        var me = this;
        var config = $scope.blockConfig;
        var themePath="/theme/"+window.rubedoConfig.siteTheme;
        me.data = [];
        me.facets = [];
        me.activeFacets = [];
        me.start = 0;
        me.limit = $routeParams.limit?$routeParams.limit:20; // nombre de résultats affichés par défaut
        me.orderBy = $routeParams.orderby?$routeParams.orderby:"lastUpdateTime";
       var resolveOrderBy = {
            '_score': $scope.rubedo.translate('Search.Label.OrderByRelevance'),
            'lastUpdateTime': $scope.rubedo.translate('Search.Label.OrderByDate'),
            'authorName': $scope.rubedo.translate('Search.Label.OrderByAuthor'),
            'text': $scope.rubedo.translate('Blocks.Search.Label.OrderByTitle')
        };
        me.displayOrderBy = $routeParams.orderby?resolveOrderBy[$routeParams.orderby]:$scope.rubedo.translate('Search.Label.OrderByDate');
        me.template = themePath+"/templates/blocks/searchResults/"+config.displayMode+".html";
        me.template_dons = themePath+"/templates/blocks/searchResults/dons.html";
        var predefinedFacets = !config.predefinedFacets?{}:JSON.parse(config.predefinedFacets);
        me.displayedResults = 20; // nombre de résultats affichés par défaut
        var facetsId = ['objectType','type','damType','userType','author','userName','lastupdatetime','query'];
        me.options = {};
        me.options = {
            start: me.start,
            limit: me.limit,
            constrainToSite: config.constrainToSite,
            predefinedFacets: config.predefinedFacets,
            displayMode: config.displayMode,
            displayedFacets: config.displayedFacets,
            orderby: me.orderBy,
            pageId: $scope.rubedo.current.page.id,
            siteId: $scope.rubedo.current.site.id,
            taxonomies:{}
        };
        me.options["type[]"] = $scope.block.code? $scope.block.code.split(","):[];
        me.options.taxonomies = config.taxonomies? JSON.parse(config.taxonomies):{};
        var taxonomiesReset =config.taxonomies? JSON.parse(config.taxonomies):{};
        if (config.singlePage){
            me.options.detailPageId = config.singlePage;
        }
        if(config.profilePage){
            me.options.profilePageId = config.profilePage;
        }
        var parseQueryParamsToOptions = function(){
            angular.forEach($location.search(), function(queryParam, key){
                if(typeof queryParam !== "boolean"){
                    if(key == 'taxonomies'){
                        me.options[key] = JSON.parse(queryParam);
                    }
                    else {
                        if(key == 'query'){
                            me.options.query = queryParam;
                        }
                        else {
                        me.options[key] = queryParam;
                        }
                    }
                }
            });
        };
        if(predefinedFacets.query) {
            me.options.query =  predefinedFacets.query;
            me.updateSearch();
        }

        me.updateSearch = function() {
            me.options.start = me.start;
            me.options.limit = me.limit;
            me.options.orderBy = me.orderBy;
            me.searchByQuery(me.options, true);
        };
        me.checked = function(term){
            var checked = false;
            angular.forEach(me.activeTerms,function(activeTerm){
                checked = activeTerm.term==term;
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
            me.options.start = me.start;
            me.searchByQuery(me.options);
        };
        me.onSubmit = function(){
            me.options.start = 0;
            me.options.limit = 10;
            me.options.query = me.query;
            me.options.taxonomies={};
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
        me.target = function(data){
            var res = '';
            if (data.objectType == 'dam'){
                res = '_blank';
            }
            return res;
        };
        me.clickOnFacetsType= function(term){
            if (me.options["type[]"].indexOf(term)>-1) {
                me.options["type[]"].splice(me.options["type[]"].indexOf(term),1);
            }
            else me.options["type[]"]=$scope.block.code.split(",");
            me.updateSearch();
        };
        me.clickOnFacetsRadio = function(facetId,term){
            if (me.options.taxonomies[facetId]) {
                var del=false;
                for (var i = 0; i < me.options.taxonomies[facetId].length; i++) {
                    if (me.options.taxonomies[facetId][i] == term) {
                        del=true;
                    }
                }
                if (del) {
                   me.options.taxonomies[facetId].splice(me.options.taxonomies[facetId].indexOf(term),1);
                }
                else {
                    me.options.taxonomies={};
                    me.options.taxonomies = angular.copy(taxonomiesReset);
                    if (!me.options.taxonomies[facetId]) me.options.taxonomies[facetId]=[];
                     me.options.taxonomies[facetId].push(term);
                }
            }
            else {
                me.options.taxonomies[facetId] = [];
                if (!me.options.taxonomies[facetId]) me.options.taxonomies[facetId]=[];
                me.options.taxonomies[facetId].push(term);
           }
            me.updateSearch();
        }
        
 
  

 
        
        me.clickOnFacets =  function(facetId,term){
            var del = false;
            angular.forEach(me.activeTerms,function(activeTerm){
                if(!del){
                    del = (activeTerm.term==term && activeTerm.facetId==facetId);
                }
            });
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
                } else if(facetId == 'lastupdatetime') {
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
                } else if(facetId == 'lastupdatetime') {
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
        me.searchByQuery(me.options);
        
        
        
        me.loadMore = function(){
            me.displayedResults=me.displayedResults+20; // nombre de résultats à ajouter en load more
            if (me.displayedResults>=me.options.limit) {
                me.options.limit+=40;// nombre de résultats à ajouter à la liste si elle est trop courte
                me.searchByQuery(me.options);
            }
        }
  }]);
