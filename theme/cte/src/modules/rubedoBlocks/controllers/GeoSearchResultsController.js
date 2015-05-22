angular.module("rubedoBlocks").lazy.controller("GeoSearchResultsController",["$scope","$location","$routeParams","$compile","RubedoSearchService","$element",
    function($scope,$location,$routeParams,$compile,RubedoSearchService,$element){
        var me = this;
        var config = $scope.blockConfig;
        var themePath="/theme/"+window.rubedoConfig.siteTheme;
        me.data = [];
        me.facets = [];
        me.activeFacets = [];
        me.activateSearch=config.activateSearch;
        me.start = 0;
        me.limit = config.pageSize ? config.pageSize : 5000;
        me.height = config.height ? config.height + "px" : "500px";
        me.map={
            center:{
                latitude:48.8567,
                longitude:2.3508
            },
            zoom:config.zoom ? config.zoom : 14
        };
        me.geocoder = new google.maps.Geocoder();
        //places search
        if (config.showPlacesSearch){
            me.activatePlacesSearch=true;
            me.placesSearchTemplate=themePath+"/templates/blocks/geoSearchResults/placesSearch.html";
        }
        var clusterStyles = [
          {
            textColor: 'white',
            url: '/assets/icons/cluster-02.png',
            height: 60,
            width: 60
          },
        ];
        //clustering options
        me.clusterOptions={
            batchSize : 20000,
            averageCenter : false,
            gridSize : 40,
            zoomOnClick:false,
            batchSizeIE : 20000,
            /*maxZoom : 15,*/
            enableRetinaIcons :true,
            styles : clusterStyles
           
        };
        //api clustering options
        me.apiClusterOptions={
            batchSize : 20000,
            averageCenter : false,
            minimumClusterSize:1,
            zoomOnClick:false,
            maxZoom : 15,
            styles : clusterStyles,
            calculator:function (markers, numStyles) {
                var index = 0;
                var count = 0;
                angular.forEach(markers,function(marker){
                    if (marker&&marker.counter){
                        count=count+marker.counter;
                    }
                });
                var dv = count;
                while (dv !== 0) {
                    dv = parseInt(dv / 10, 10);
                    index++;
                }
                index = Math.min(index, numStyles);
                return {
                    text: count,
                    index: index
                };
            },
            gridSize : 40,
            batchSizeIE : 20000
        };
        //set initial map center
        if (config.useLocation&&navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(position) {
                me.map.center={
                    latitude:position.coords.latitude,
                    longitude:position.coords.longitude
                };
                me.getLocationCenter();

            }, function() {
                //handle geoloc error
            });
        } else if (config.centerAddress){
            me.geocoder.geocode({
                'address' : config.centerAddress
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    me.map.center={
                        latitude:results[0].geometry.location.lat(),
                        longitude:results[0].geometry.location.lng()
                    };
                    me.getLocationCenter();

                }
            });

        } else if (config.centerLatitude && config.centerLongitude){
            me.map.center={
                latitude:config.centerLatitude,
                longitude:config.centerLongitude
            };
            me.getLocationCenter();

        }
        me.getLocationCenter = function(){
            me.geocoder.geocode(
                            {
                                'latLng' : new google.maps.LatLng(me.map.center.latitude, me.map.center.longitude)
                            },
                            function(results, status) {
                                if (status == google.maps.GeocoderStatus.OK) {
                                    if (results[1]) {
        
                                        var arrAddress = results;
                                        // iterate through address_component array
                                        $
                                                .each(
                                                        arrAddress,
                                                        function(i, address_component) {
        
                                                            if (address_component.types[0] == "locality") {
                                                                me.city =address_component.address_components[0].long_name;
                                                            }
                                                            if (address_component.types[0] == "country") {me.city +=", "+address_component.address_components[0].long_name}
                                                        });
        
                                    } else {
                                        /*alert("No results found");*/
                                    }
                                } else {
                                   /* alert("Geocoder failed due to: " + status);*/
                                }
                            });
        }
        
        //map control object recieves several control methods upon map render
        me.mapControl={ };
        //map events
        me.mapTimer = null;
        me.mapEvents = {
            "bounds_changed": function (map) {
                clearTimeout(me.mapTimer);
                me.mapTimer = setTimeout(function() {
                    me.searchByQuery(me.options);
                }, 300);
            }
        };
        //marker events
        me.markerEvents = {
            click: function (gMarker, eventName, model) {
                if ($element.find('#gmapitem'+$scope.block.id+model.id).length==0){
                    if (me.activeInfoWindow){
                        me.activeInfoWindow.close();
                    }
                    var newInfoWin = new google.maps.InfoWindow({
                        content : '<div class="rubedo-gmapitem" id="gmapitem'+$scope.block.id+model.id+'" ng-include="\''+themePath+'/templates/blocks/geoSearchResults/detail/'+model.objectType+'.html\'"></div>'
                    });
                    newInfoWin.open(gMarker.getMap(),gMarker);
                    me.activeInfoWindow=newInfoWin;
                    gMarker.hasIWindow=true;
                    setTimeout(function(){
                        var newScope=$element.find('#gmapitem'+$scope.block.id+model.id).scope();
                        newScope.itemData=model.itemData;
                        $compile($element.find('#gmapitem'+$scope.block.id+model.id)[0])(newScope);
                        gMarker.getMap().setCenter(gMarker.getMap().getCenter());
                    }, 140);
                }
            }
        };
        me.clusterEvents= {
            click: function(cluster){
                var map=cluster.getMap();
                map.setCenter(cluster.getCenter());
                map.setZoom(map.getZoom()+3); // zoom +3 if big clusters
            }
        };
        me.smallClusterEvents= {
            click: function(cluster,markers){
                if (cluster.getMap().getZoom()>15){
                    var targetId=markers[0].id;
                    var markerHolder=cluster.getMarkerClusterer().getMarkers().get(targetId);

                    if ($element.find('#gmapitem'+targetId).length==0){
                        if (me.activeInfoWindow){
                            me.activeInfoWindow.close();
                        }
                        var newInfoWin = new google.maps.InfoWindow({
                            content : '<div class="rubedo-gmapitem" id="gmapitem'+targetId+'" ><div ng-repeat="mData in mDatas" ng-init="itemData = mData.itemData" ng-include="\''+themePath+'/templates/blocks/geoSearchResults/detail/\'+itemData.objectType+\'.html\'"></div></div>',
                            position : markerHolder.getPosition()
                        });
                        var map=cluster.getMap();
                        newInfoWin.open(map);
                        me.activeInfoWindow=newInfoWin;
                        setTimeout(function(){
                            var newScope=$element.find('#gmapitem'+targetId).scope();
                            newScope.mDatas=markers;
                            $compile($element.find('#gmapitem'+targetId)[0])(newScope);
                            cluster.getMap().setCenter(cluster.getMap().getCenter());
                        }, 200);
                    }
                } else {
                    var map=cluster.getMap();
                    map.setCenter(cluster.getCenter());
                    map.setZoom(map.getZoom()+5);  // zoom +5 if small clusters
                }
            }
        };
        if (config.activateSearch){
            if (!config.displayMode){
                config.displayMode="default";
            }
            me.template = themePath+"/templates/blocks/geoSearchResults/"+config.displayMode+".html";
        } else {
            me.template = themePath+"/templates/blocks/geoSearchResults/map.html";
        }
        var predefinedFacets = config.predefinedFacets==""?{}:JSON.parse(config.predefinedFacets);
        var facetsId = ['objectType','type','damType','userType','author','userName','lastupdatetime','query'];
        if (config.displayedFacets=="all"){
            config.displayedFacets="['all']";
        }
        me.options = {
            start: me.start,
            limit: me.limit,
            constrainToSite: config.constrainToSite,
            predefinedFacets: config.predefinedFacets,
            displayMode: config.displayMode,
            displayedFacets: config.displayedFacets,
            pageId: $scope.rubedo.current.page.id,
            siteId: $scope.rubedo.current.site.id,
            taxonomies:{}
        };
        if (config.singlePage){
            me.options.detailPageId = config.singlePage;
        }
        /*var options = angular.copy(defaultOptions);*/
        var parseQueryParamsToOptions = function(){
            angular.forEach($location.search(), function(queryParam, key){
                if(typeof queryParam !== "boolean"){
                    if(key == 'taxonomies'){
                        me.options[key] = JSON.parse(queryParam);
                    } else {
                        if(key == 'query'){
                            me.options.query = queryParam;
                        }
                        me.options[key] = queryParam;
                    }
                }
            });
        };
        if(predefinedFacets.query) {
            me.options.query  = predefinedFacets.query;
            $location.search('query',me.query);
        }
        $scope.$on('$routeUpdate', function(scope, next, current) {
            me.options.start = me.start;
            me.options.limit = me.limit;
            parseQueryParamsToOptions();
            me.searchByQuery(me.options, true);
        });
        me.checked = function(term){
            var checked = false;
            angular.forEach(me.activeTerms,function(activeTerm){
                checked = activeTerm.term==term;
            });
            return checked;
        };
        me.checkedRadio = function(term){
            var checked = false;
           angular.forEach(me.options.taxonomies,function(taxonomy){
                for (var i = 0; i < taxonomy.length; i++) {

                    if (taxonomy[i] == term) { checked=true;}
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
        me.onSubmit = function(){
            me.start = 0;
            me.options.start = me.start;
            me.options.limit = me.limit;
            me.options.query = me.query;
            me.searchByQuery(me.options, true);
        };
        
        me.clickOnFacetsRadio = function(facetId,term){
            // si la taxonomie est déjà présente
            if (me.options.taxonomies[facetId]) {
                var del=false;
                //vérifier si la facette demandée est déjà présente
                for (var i = 0; i < me.options.taxonomies[facetId].length; i++) {
                    if (me.options.taxonomies[facetId][i] == term) {
                        del=true;
                    }
                }
                // si présente, alors supprimer la taxonomie
                if (del) {
                   me.options.taxonomies[facetId].splice(me.options.taxonomies[facetId].indexOf(term),1);
                }
                // si nouvelle facette, supprimer l'ancienne valeur et l'ajouter
                else {
                    me.options.taxonomies[facetId]=[];
                     me.options.taxonomies[facetId].push(term);
                }
            }

            // si la taxonomie n'est pas présente
            else {
                //reset taxonomies : supprimer toutes les autres taxos présentes
                me.options.taxonomies={};
                me.options.taxonomies[facetId] = [];//créer taxonomie
                me.options.taxonomies[facetId].push(term);// ajouter facette
           }
            me.searchByQuery(me.options, true);
        }        
        me.clickOnFacetsCheckbox = function(facetId,term){
            // si la taxonomie est déjà présente
            if (me.options.taxonomies[facetId]) {
                var del=false;
                //vérifier si la facette demandée est déjà présente
                for (var i = 0; i < me.options.taxonomies[facetId].length; i++) {
                    if (me.options.taxonomies[facetId][i] == term) {
                        del=true;
                    }
                }
                // si présente, alors supprimer la taxonomie
                if (del) {
                   me.options.taxonomies[facetId].splice(me.options.taxonomies[facetId].indexOf(term),1);
                }
                // si nouvelle facette de la même taxonomie, l'ajouter
                else {
                     me.options.taxonomies[facetId].push(term);
                }
            }

            // si la taxonomie n'est pas présente
            else {
                //reset taxonomies : supprimer toutes les autres taxos présentes
                me.options.taxonomies={};
                me.options.taxonomies[facetId] = [];//créer taxonomie
                me.options.taxonomies[facetId].push(term);// ajouter facette
           }
            me.searchByQuery(me.options, true);
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
                    if(options.taxonomies[facetId].length == 0){
                        delete options.taxonomies[facetId];
                    }
                    if(Object.keys(me.options['taxonomies']).length == 0){
                        $location.search('taxonomies',null);
                    } else {
                        $location.search('taxonomies',JSON.stringify(me.options.taxonomies));
                    }
                } else if (facetId == 'query') {
                    $location.search('query',null);
                    delete me.options.query;
                } else if(facetId == 'lastupdatetime') {
                    delete me.options[facetId];
                    $location.search(facetId,null);
                } else {
                    if(angular.isArray(me.options[facetId+'[]'])){
                        me.options[facetId+'[]'].splice(me.options[facetId+'[]'].indexOf(term),1);
                    } else {
                        delete me.options[facetId+'[]'];
                    }
                    if(!me.options[facetId+'[]'] || me.options[facetId+'[]'].length == 0){
                        $location.search(facetId+'[]',null)
                    } else {
                        $location.search(facetId+'[]',options[facetId+'[]']);
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
                    $location.search('taxonomies',JSON.stringify(me.options.taxonomies));
                } else if(facetId == 'lastupdatetime') {
                    me.options[facetId] = term;
                    $location.search(facetId,me.options[facetId]);
                } else {
                    if(!me.options[facetId+'[]']){
                        me.options[facetId+'[]'] = [];
                    }
                    me.options[facetId+'[]'].push(term);
                    $location.search(facetId+'[]',me.options[facetId+'[]']);
                }
            }
            me.start = 0;
            me.options.start = me.start;
        };
        me.preprocessData=function(data){
            var refinedData=[];
            if (data.count>me.limit){
                me.apiClusterMode=true;
                angular.forEach(data.results.Aggregations.buckets,function(item){
                    refinedData.push({
                        id:item.key+item["doc_count"],
                        coordinates:{
                            latitude:item.medlat,
                            longitude:item.medlon
                        },
                        markerOptions:{
                            counter:item["doc_count"]
                        }
                    });
                });
            } else {
                me.apiClusterMode=false;
                angular.forEach(data.results.data,function(item){
                    switch(item['type']) {
                        case "Point Net":
                            item['groupe']="rencontre"; break;
                        case "NLieu":
                            item['groupe']="lieux"; break;
                        case "FProposition":
                            item['groupe']="evenement"; break;
                        default:
                            item['groupe']="";
                    }
                    if (item['fields.position.location.coordinates']&&item['fields.position.location.coordinates'][0]){
                        var coords=item['fields.position.location.coordinates'][0].split(",");
                        var icon = new google.maps.MarkerImage("/assets/icons/gmaps-"+item.groupe+".png", null, null, null, new google.maps.Size(50, 50));
                        if (coords[0]&&coords[1]){
                            refinedData.push({
                                coordinates:{
                                    latitude:coords[0],
                                    longitude:coords[1]
                                },
                                distance:me.distance(coords[0],coords[1]),
                                id:item.id,
                                objectType:item.objectType,
                                title:item.title,
                                itemData:item,
                                markerOptions:{
                                    title:item.title,
                                    icon: icon
                                }
                            });
                        }
                    }
                });
            }
            return refinedData;
        };

        me.distance = function(lat2, lon2){
            var lat1=me.map.center.latitude;
            var lon1=me.map.center.longitude;
            var R = 6371000; // metres
            var φ1 = lat1 * Math.PI / 180;
            var φ2 = lat2 * Math.PI / 180;
            var Δφ = (lat2-lat1) * Math.PI / 180;
            var Δλ = (lon2-lon1)* Math.PI / 180;
               
            var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                       Math.cos(φ1) * Math.cos(φ2) *
                       Math.sin(Δλ/2) * Math.sin(Δλ/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
               
            var d = R * c;
            return d;
        };
        
        
        me.searchByQuery = function(options, adjustZoom){
            if (typeof adjustZoom === 'undefined') { adjustZoom = false; }
            var bounds=me.mapControl.getGMap().getBounds();
            options.inflat=bounds.getSouthWest().lat();
            options.suplat=bounds.getNorthEast().lat();
            options.inflon=bounds.getSouthWest().lng();
            options.suplon=bounds.getNorthEast().lng();
            RubedoSearchService.searchGeo(options).then(function(response){
                if(response.data.success){
                    me.query = response.data.results.query;
                    me.count = response.data.count;
                    if (adjustZoom) {
                        if (me.count==0 && me.mapControl.getGMap().getZoom()>5) {
                            me.mapControl.getGMap().setZoom(me.mapControl.getGMap().getZoom()-1);
                            me.searchByQuery(me.options, true);
                        }
                    }
                    me.data =  me.preprocessData(response.data);
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
        if (me.activatePlacesSearch){
            setTimeout(function(){
                var input=$element.find(".rubedo-places-search");
                var searchBox = new google.maps.places.SearchBox(input[0]);
                google.maps.event.addListener(searchBox, 'places_changed', function() {
                    var places = searchBox.getPlaces();
                    me.mapControl.getGMap().setCenter(places[0].geometry.location);
                    if (config.zoomOnAddress) {
                        me.mapControl.getGMap().setZoom(config.zoomOnAddress);
                    } else {
                        me.mapControl.getGMap().setZoom(14);
                    }
                    me.getLocationCenter();

                });
            },4000);
        }
        me.display = function () {
            /**
             * Hack to avoid the partial loading map (gray parts)
             *
             * With this hack, the map will be added to the dom after the HTML rendering
             */
            return true;
        }
        if (config.height&&config.height!=500){
            setTimeout(function(){
                $element.find(".angular-google-map-container").height(config.height);
            },190);
        }
    }]);

