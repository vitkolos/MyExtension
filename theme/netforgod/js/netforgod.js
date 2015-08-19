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


 angular.module('rubedoBlocks').service('NFGFilms', function($http) {
	delete $http.defaults.headers.common['X-Requested-With'];
	this.getData = function(callbackFunc) {
	    $http({
	        method: 'JSONP',
	        url: 'http://www.netforgod.tv/s/HD.php?l=EN&y=15&m=5'/*,
	        params: 'limit=10, sort_by=created:desc'*/,
	        headers: {'Authorization': 'Token token=xxxxYYYYZzzz'}
	     }).success(function(data){
	        // With the data succesfully returned, call our callback
	        callbackFunc(data);
	    }).error(function(){
	        alert("error");
	    });
	 }
});



 angular.module('rubedoBlocks').directive('jwplayer', ['$compile','$http','NFGFilms', function ($compile,$http, NFGFilms) {
    return {
        restrict: 'EC',
        link: function (scope, element, attrs) {
           var filmId = attrs.filmid;
           var languages = attrs.lang;
           var filmUrl="";
            var id = 'random_player_' + Math.floor((Math.random() * 999999999) + 1),
            getTemplate = function (playerId) {
                      
                return '<div id="' + playerId + '"></div>';
            };/*
            NFGFilms.getData(function(dataResponse) {
       		filmUrl = dataResponse;
    		});*/
    		$http.get('http://www.netforgod.tv/s/HD.php?l=EN&y=15&m=5', { 
			// params: j your jason 
			})
			.success(function (data) {
				alert(data); 
				})
			.error(function (data) { 
				alert("error"); 
		});

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
