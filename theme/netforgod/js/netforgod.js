blocksConfig.buttonToPage={
           "template": "/templates/blocks/buttonToPage.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/buttonToPage.js"]
};
blocksConfig.contactBlock={
           "template": "/templates/blocks/contactBlock.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/contactBlock.js"]
};
blocksConfig.form={
           "template": "/templates/blocks/form.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/form.js"]
};
blocksConfig.simpleContact={
           "template": "/templates/blocks/simpleContact.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/simpleContact.js"]
};




angular.module('rubedoBlocks').directive('loadModal', function () {
    return {
        restrict: 'A',
        link: function(scope, $elm, attrs) {
            $elm.bind('click', function(event) {
                event.preventDefault();
                /*angular.element('#myModal iframe').attr('src', src);*/
                angular.element('#myModal').appendTo('body').modal('show');
            });
        }
    }
});


angular.module('rubedoBlocks').filter('homepage', function() {
    return function(input){
		  var delimiter = '/';
		  var array = input.split(delimiter);
                  var url ="";
                  for (i = 0; i < array.length-2; i++) {url = url + array[i]+'/'}
                  return url;
    }
});


 angular.module('rubedoBlocks').directive('jwplayer', ['$compile','$http', function ($compile,$http) {
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
           $http({
    		method: 'JSONP',
    		url: 'http://www.netforgod.tv/s/HD.php?l=EN&y=15&m=5&callback=JSON_CALLBACK'
		})
		.success(function(data) {
  			filmUrl = data;
  			
           var options = {
           	      file:filmUrl,/*
                      file:"http://www.netforgod.tv/videos/FOI_15_06/FR_HD.mp4",
                      file: "http://www.netforgod.tv/VOD/FOI_"+filmId+"/FR_divx.flv",*/
                      image: "http://www.netforgod.tv/VOD/FOI_"+filmId+"/affiche.jpg",
                      width:"100%",
                      aspectratio:"16:9"};
            element.html(getTemplate(id));
            $compile(element.contents())(scope);
            jwplayer(id).setup(options);
            
			
  			
  			
		})
		.error(function(data, status) {
  			console.error('Repos error', status, data);
	    });
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
