angular.module("rubedoBlocks").lazy.controller('D3ScriptController',['$scope','$sce','RubedoSearchService','$http',function($scope,$sce,RubedoSearchService,$http){
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
	$scope.retrieveData = async function(params, successFunction, failureFunction) {
		console.log('retrieveData params : ', params);
		let http_res;
        try {
            http_res = await $http({
                url: '/backoffice/contents',
                method: "GET",
                params: {
					tFilter: [{"property":"typeId","value":"55e86ef445205e8a1848409f"}],
					workingLanguage: 'fr',
                    _dc: '1540472371822', page: 1, start: 0, limit: 5000
                }
            })
            console.log('res = ', http_res);
            me.countryList = http_res.data.data;
			successFunction(me.countryList);
			return;
        } catch(e) {
			console.log("Erreur dans getMailingListUsers", e);
			failureFunction(e);
        }
	}
    $scope.retrieveData2=function(params, successFunction, failureFunction ){
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
					me.countryList[id] = {
						'name':country["title"],
						'fillKey':country["presence"],
						'text':''
					};
					if (mapType!='cte') {
						if(country['fields.'+mapType] && country['fields.'+mapType]!="") me.countryList[id]['url'] = country['fields.'+mapType][0];
						else if(country["presence"]=="active") me.countryList[id]['fillKey']='not';
					}
					else {
						if(country["fields.url"]&&country["fields.url"][0]!="") me.countryList[id]['url']=country["fields.url"][0];
						var missions = ["cana","1418","1830","foyers","jet","netforgod"];
						for (var i = 0; i < missions.length; i++) {
							if(country[missions[i]]&&country[missions[i]]!="") {
								me.countryList[id]['text']+=translations['Missions.'+missions[i]]+'<br/>';
							}
						}

					}
								
				});
				console.log(me.results);
                successFunction(me.countryList);
            },
            function(response){
                failureFunction(response.data);
            }
        );
    };
    me.html=$sce.trustAsHtml(d3Code);

}]);

