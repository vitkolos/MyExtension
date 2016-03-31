angular.module("rubedoBlocks").lazy.controller("ProductSearchController",["$scope","$location","$routeParams","$compile","RubedoSearchService","RubedoShoppingCartService","$rootScope",
    function($scope,$location,$routeParams,$compile,RubedoSearchService,RubedoShoppingCartService,$rootScope){
        var me = this;
        var config = $scope.blockConfig;
        var themePath="/theme/"+window.rubedoConfig.siteTheme;
        me.contentHeight = config.summaryHeight ? config.summaryHeight : null;
        me.summaryStyle={};
        if (me.contentHeight){
            me.summaryStyle['height']=me.contentHeight+"px";
            me.summaryStyle['overflow']="hidden";
        }
        me.imageField= config.imageField ? config.imageField : "image";
        me.imageHeight= config.imageHeight ? config.imageHeight : null;
        me.imageWidth= config.imageWidth ? config.imageWidth : null;
        me.imageStyle={};
        if (me.imageHeight){
            me.imageStyle['height']=me.imageHeight+"px";
            me.imageStyle['overflow']="hidden";
        }
        me.imageResizeMode= config.imageResizeMode ? config.imageResizeMode : "boxed";
        me.canOrder=function(content){
            return !(content.productProperties.manageStock&&(content.productProperties.canOrderNotInStock=="false")&&(content.productProperties.variations[0].stock < content.productProperties.outOfStockLimit)) ;
        };
        me.addToCart=function(content){
            var options={
                productId:content.id,
                variationId:content.productProperties.variations[0].id,
                amount:1
            };
            RubedoShoppingCartService.addToCart(options).then(
                function(response){
                    $rootScope.$broadcast("shoppingCartUpdated",{emitter:"searchProductBox"});
                }
            );
        };
        me.data = [];
        me.facets = [];
        me.activeFacets = [];
        me.start = 0;
        me.limit = $routeParams.limit?$routeParams.limit:10;
        me.orderBy = $routeParams.orderby?$routeParams.orderby:"_score";
        me.orderByDirection=$routeParams.orderbyDirection?$routeParams.orderbyDirection:"asc";
        var resolveOrderBy = {
            '_score': 'relevance',
            'lastUpdateTime': 'date'
        };
        me.displayMode=config.displayMode ? config.displayMode : "default";
        me.productDisplayMode=config.productDisplayMode ? config.productDisplayMode : "grid";
        me.displayOrderBy = $routeParams.orderby?resolveOrderBy[$routeParams.orderby]:$scope.rubedo.translate('Search.Label.OrderByRelevance');
        me.displayOrderByDirection = $routeParams.orderbyDirection?$routeParams.orderbyDirection:$scope.rubedo.translate('Search.Label.OrderByPrice');
        me.template = themePath+"/templates/blocks/productSearch/"+me.displayMode+".html";
        var predefinedFacets = !config.predefinedFacets?{}:JSON.parse(config.predefinedFacets);
        var facetsId = ['objectType','type','damType','userType','author','userName','lastupdatetime','price','inStock','query'];
        var defaultOptions = {
            start: me.start,
            limit: me.limit,
            constrainToSite: config.constrainToSite,
            predefinedFacets: config.predefinedFacets,
            displayMode: config.displayMode,
            displayedFacets: config.displayedFacets,
            orderby: me.orderBy,
            orderbyDirection:me.orderByDirection,
            pageId: $scope.rubedo.current.page.id,
            siteId: $scope.rubedo.current.site.id
        };
        if (config.singlePage){
            defaultOptions.detailPageId = config.singlePage;
        }
        if(config.profilePage){
            defaultOptions.profilePageId = config.profilePage;
        }
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
            options.orderbyDirection = me.orderByDirection;
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
            options.orderbyDirection = me.orderByDirection;
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
        me.changeOrderByDirection= function(direction){
            if (me.orderByDirection!=direction){
                me.orderByDirection=direction;
                me.displayOrderByDirection=direction
                me.start=0;
                $location.search('orderbyDirection',direction);
            }
        }
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
            RubedoSearchService.searchProducts(options).then(function(response){
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
            });
        };
        parseQueryParamsToOptions();
        me.searchByQuery(options);
    }]);