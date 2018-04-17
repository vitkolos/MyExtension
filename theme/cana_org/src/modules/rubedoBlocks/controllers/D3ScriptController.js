angular.module("rubedoBlocks").lazy.controller('D3ScriptController',['$scope','$sce','RubedoSearchService',function($scope,$sce,RubedoSearchService){
    var me = this;
    var config = $scope.blockConfig;
				var themePath="/theme/"+window.rubedoConfig.siteTheme;
				me.ccnMap = themePath+"/templates/blocks/ccnMap.html";
    var d3Code = config.d3Code ? config.d3Code : "";
    $scope.predefinedFacets = config.predefinedFacets ? config.predefinedFacets : "{ }";
    $scope.pageSize = config.pageSize ? config.pageSize : 5000;
				$scope.loading = true;
				var mapType = config.mapType ? config.mapType : 'cte';
				//$scope.clearORPlaceholderHeight();
    $scope.retrieveData=function(params, successFunction, failureFunction ){
        var options={
            start: 0,
            limit: $scope.pageSize,
            predefinedFacets: $scope.predefinedFacets,
            displayedFacets: "['all']",
            pageId: $scope.rubedo.current.page.id,
            siteId: $scope.rubedo.current.site.id,
            searchMode:"aggregate"
        };
        angular.forEach(params, function(value, key){
            options[key]=value;
        });
        RubedoSearchService.searchByQuery(options).then(
            function(response){
																me.results = response.data.results.data;
																me.countryList = {};
																angular.forEach(me.results, function(country){
																				var id=country["fields.id"][0];
																				var id_iso = id.substr(0, 2).toLowerCase();
																				me.countryList[id] = {
																								'name':country["title"],
																								'fillKey':country["presence"],
																								'id_iso':id_iso,
																								'text':''
																				};
																				if (mapType!='cte') {
																								if(country[mapType] && country[mapType]!="") me.countryList[id]['url'] = country[mapType];
																								else if(country["presence"]=="active") me.countryList[id]['fillKey']='not';
																				}
																				else {
																								if(country["fields.url"]&&country["fields.url"][0]!="") me.countryList[id]['url']=country["fields.url"][0];

																								var missions = ["cana","1418","1830","foyers","jet","netforgod"];
																								for (var i = 0; i < missions.length; i++) {
																												if(country[missions[i]]&&country[missions[i]]!="") me.countryList[id]['text']+=translations['Missions.'+missions[i]]+'<br/>';
																								}

																				}
																				
																});
																console.log(me.results);
																console.log("countryList");
																console.log(me.countryList);
                successFunction(me.countryList);
            },
            function(response){
                failureFunction(response.data);
            }
        );
    };
    me.html=$sce.trustAsHtml(d3Code);

}]);

