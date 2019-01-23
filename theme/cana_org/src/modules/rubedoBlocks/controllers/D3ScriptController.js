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
	
	// Fonction de récupération des données des pays (Contents > Z_Pays)
	$scope.retrieveData = async function(params, successFunction, failureFunction) {
		let http_res;
        try {
			// on prépare les champs que l'on veut récupérer pour chaque pays
			let fields = ['1418', '1830', 'id', 'presence', 'url', 'cana', 'foyers', 'jet', 'netforgod'];
			let fields_url_params = 'fields%5B%5D=' + fields.join('&fields%5B%5D=');

			http_res = await $http({
				url: '/api/v1/contents?' + fields_url_params,
				method: "GET",
				params: {
					queryId: '5c4826b03965883c72f64c93', // la query enregistrée pour récupérer les contenus Z_pays
					start: 0,
					limit: 1000,
				}
			});
			console.log('HTTP RES', http_res);

			// une fois les données récupérées, on les parse dans le bon format pour la carte intéractive
			parseMapData(http_res.data.contents);
			//console.log('countryList1', me.countryList);
			successFunction(me.countryList);
			return;
        } catch(e) {
			console.log("Erreur dans retrieveData lors de la récupération des données des pays", e);
			failureFunction(e);
        }
	}

	// fonction de parsing des données des pays pour les mettre dans le bon format pour la carte interactive
	function parseMapData(data) {
		me.countryList = {};
		/* let country_iso = {
			UKR: 'ua',
			POL: 'pl',
			MAU: 'mu',
			MAT: 'fr',
			ISR: 'il',
			SYC: 'sc',
		} */
		for (let country of data) {
			let id = country.fields.id;
			//let id_iso = id.substr(0, 2).toLowerCase();
			me.countryList[id] = {
				name: country.text,
				fillKey: country.fields.presence,
				//id_iso: (country_iso[id_iso]) ? country_iso[id_iso] : id_iso,
				text: ''
			}
			if (mapType != 'cte') {
				if (country.fields[mapType] && country.fields[mapType] != "") me.countryList[id].url = country.fields[mapType];
				else if (country.fields.presence == "active") me.countryList[id]['fillKey'] = 'not';
			}
			else {
				if (country.fields.url) me.countryList[id].url = country.fields.url;
				let missions = ["cana","1418","1830","foyers","jet","netforgod"];
				for (let i = 0; i < missions.length; i++) {
					if (country.fields[missions[i]] && country.fields[missions[i]]!="") {
						me.countryList[id]['text'] += (translations['Missions.'+missions[i]]) ? translations['Missions.'+missions[i]]+'<br/>' : '';
					}
				}
			}
		}
	}
    me.html=$sce.trustAsHtml(d3Code);

}]);

