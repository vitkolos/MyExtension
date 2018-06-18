blocksConfig.bg_image={
           "template": "/templates/blocks/bg_image.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/BgImageController.js"]
};

angular.module('rubedoBlocks').directive('addthisToolbox', ['$timeout','$location','$http', function($timeout,$location,$http) {
  return {
    restrict : 'A',
	  transclude : true,
	  replace : true,
	  template : '<div ng-transclude></div>',
	  link : function($scope, element, attrs) {
		$timeout(function () {
                      addthis.init();
                      var contentUrl = $location.absUrl();
                      addthis.toolbox(angular.element('.addthis_toolbox').get(), {}, {
                                 url: contentUrl,
                                 title : attrs.title,
                                 description : attrs.summary     
                      });

		$scope.nbOfLikes=0;
		$http({method: 'GET',url: 'https://graph.facebook.com/?id='+contentUrl})
		.then(function successCallback(response) {
			$scope.nbOfLikes += response.data.share.share_count;
		},
		function errorCallback(response) {
		});
		

		});
	    }
	};
}]);

    angular.module('rubedoDataAccess').factory('TaxonomyService', ['$http',function($http) {
        var serviceInstance={};
	serviceInstance.getTaxonomyByVocabulary=function(vocabularies){
            return ($http.get("/api/v1/taxonomies",{
                params:{
                    vocabularies:vocabularies
                }
            }));
	};
        return serviceInstance;
    }]);