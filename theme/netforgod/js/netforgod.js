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





 angular.module('rubedoBlocks').directive('jwplayer', ['$compile', function ($compile) {
    return {
        restrict: 'EC',
        link: function (scope, element, attrs) {
           var filmId = attrs.filmid;
           var languages = attrs.lang;
           var filmUrl="";
            var id = 'random_player_' + Math.floor((Math.random() * 999999999) + 1),
            getTemplate = function (playerId) {
                      
                return '<div id="' + playerId + '"></div>';
            };


           var options = {
           	      /*file:filmUrl,*/
                      file:"http://www.netforgod.tv/VOD/FOI_15_05/FR_HD.mp4",
                      /*file: "http://www.netforgod.tv/VOD/FOI_"+filmId+"/FR_divx.flv",*/
                      image: "http://www.netforgod.tv/VOD/FOI_"+filmId+"/affiche.jpg",
                      width:"100%",
                      aspectratio:"16:9"};
            element.html(getTemplate(id));
            $compile(element.contents())(scope);
            jwplayer(id).setup(options);
 
             scope.loadVideo = function(lang) { 
                   jwplayer().load([{
                     file: "http://www.netforgod.tv/VOD/FOI_"+filmId+"/"+lang+"_divx.flv"
                   }]);
                   jwplayer().play();
           };    

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
            return ($http.get("/api/v1/taxonomy",{
                params:{
                    vocabularies:vocabularies
                }
            }));
	};
        return serviceInstance;
    }]);  
angular.module('rubedoBlocks').directive('addthisToolbox', ['$timeout','$location', function($timeout,$location) {
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
	           addthis.counter(angular.element('.addthis_counter').get(), {}, {url: contentUrl});
           /*addthis.sharecounters.getShareCounts({service: ['facebook','twitter'], countUrl: $location.absUrl()}, function(obj) {
                      console.log(obj)
           });*/
      });
	  }
	};
}]);


