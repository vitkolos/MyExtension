blocksConfig.buttonToPage={
           "template": "/templates/blocks/buttonToPage.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/buttonToPage.js"]
};

blocksConfig.simpleContact={
           "template": "/templates/blocks/simpleContact.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/simpleContact.js"]
};
blocksConfig.navigation = {
            "template": "/templates/blocks/navigation.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/MenuController.js","/src/modules/rubedoBlocks/controllers/LanguageMenuController.js"]
        },


angular.module('rubedoBlocks').filter('firstUpper', function() {
    return function(input, scope) {
        return input ? input.substring(0,1).toUpperCase()+input.substring(1).toLowerCase() : "";
    }
});



angular.module('rubedoBlocks').directive('jwplayer', ['$compile', function ($compile) {
    return {
        restrict: 'EC',
        link: function (scope, element, attrs) {
           var filmUrl = attrs.videoUrl;
            var id = 'random_player_' + Math.floor((Math.random() * 999999999) + 1),
            getTemplate = function (playerId) {
                      
                return '<div id="' + playerId + '"></div>';
            };
           var options = {
                      file: filmUrl,
                      modestbranding:0,
                      showinfo:1,
                      width:"100%",
                      aspectratio:"16:9",
                      logo: {
                                 file: '/theme/netforgod/img/favicon.png',
                                 link: 'http://test.netforgod.org/'
                      }
           };
            element.html(getTemplate(id));
            $compile(element.contents())(scope);
            jwplayer(id).setup(options);

            scope.$watch(function () {
                    return attrs.videoUrl;
                }, function (value) {
                      jwplayer(id).load([{
                                 file: attrs.videoUrl,
                                 modestbranding:0,
                                 showinfo:1,
                                 width:"100%",
                                 aspectratio:"16:9"
                      }]);
                });
        }
    };
}]);


    angular.module('rubedoDataAccess').factory('RubedoMailService', ['$http',function($http) {
        var serviceInstance={};
        serviceInstance.sendMail=function(payload){
            return ($http({
                url:"api/v1/mail",
                method:"POST",
                data : payload
            }));
        };
        return serviceInstance;
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
                                 description : ''        
                      });
		/*if ($window.addthis.layers && $window.addthis.layers.refresh) {
                        $window.addthis.layers.refresh();
                    }*/
		$scope.nbOfLikes=0;
		$http({method: 'GET',url: 'http://graph.facebook.com/?id='+contentUrl})
		.then(function successCallback(response) {
			$scope.nbOfLikes += response.data.shares;
		},
		function errorCallback(response) {
		});
		$http({method: 'GET',url: 'http://cdn.api.twitter.com/1/urls/count.json?url='+contentUrl})
		.then(function successCallback(response) {
			$scope.nbOfLikes += response.data.count;
		},
		function errorCallback(response) {
		});		

		});
	    }
	};
}]);

