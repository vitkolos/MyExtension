blocksConfig.buttonToPage={
           "template": "/templates/blocks/buttonToPage.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/buttonToPage.js"]
};
blocksConfig.bg_image={
           "template": "/templates/blocks/bg_image.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/BgImageController.js"]
};
blocksConfig.contactBlock={
           "template": "/templates/blocks/contactBlock.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/contactBlock.js"]
};
blocksConfig.simpleContact={
           "template": "/templates/blocks/simpleContact.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/simpleContact.js"]
};
blocksConfig.form={
           "template": "/templates/blocks/form.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/form.js"]
};
blocksConfig.carrousel2={
           "template": "/templates/blocks/carrousel_fullWidth.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/carrousel_fullWidth.js"]
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
});/*
angular.module('rubedoBlocks').directive('pauseOnClose', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
											scope.props={};
											scope.props.pause="notpaused";
            element.on('hidden.bs.modal', function (e) {
                // Find elements by video tag
																//var video = element.find("jwplayer");
																//playerid = playerid.split("_")[2];
																//jwplayer(playerid).pause();
																//console.log(playerid);
																//video.attr('pause', 'pause');
																scope.props.pause = "pause";
            });
													element.on('shown.bs.modal', function (e) {
                // Find elements by video tag
																//var video = element.find("jwplayer");
																//playerid = playerid.split("_")[2];
																//jwplayer(playerid).pause();
																//console.log(playerid);
																//video.attr('pause', 'notpaused');
																scope.props.pause = "notpaused";
            });
        }
    }
});*/

 angular.module('rubedoBlocks').directive('jwplayer', ['$compile',function ($compile) {
    return {
        restrict: 'EC',
        link: function (scope, element, attrs) {
           var filmUrl = attrs.videoUrl;
											var format = attrs.format;
           var id = 'random_player_' + Math.floor((Math.random() * 999999999) + 1),
            getTemplate = function (playerId) {
                      
                return '<div id="' + playerId +'" ></div>';
            };
           var options = {
                      file: filmUrl,
                      modestbranding:0,
                      showinfo:1,
                      width:"100%",
                      aspectratio:format
											};
                      //to adress rmtp streaming
           if(filmUrl.slice(0,4) =='rtmp'){
           	options.primary= "flash";
           }
            element.html(getTemplate(id));
            $compile(element.contents())(scope);
            setTimeout(function(){
                      jwplayer(id).setup(options);
           }, 200);

											
            
        }
    };
}]);

angular.module('rubedoBlocks').filter('title', function() {
    return function(input){
		  var delimiter = '//';
		  return input.split(delimiter)[0];
    }
});
angular.module('rubedoBlocks').filter('section', function() {
    return function(input){
		  var delimiter = '//';
		  return input.split(delimiter)[1];
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


 angular.module('rubedoFields').filter('split', function() {
        return function(input, splitChar, splitIndex) {
            // do some bounds checking here to ensure it has that index
            if (!splitChar) {
                     splitChar = "_";
            }
            return input.split(splitChar)[splitIndex];
        }
    });  
    
angular.module('rubedoBlocks').directive('toggleclass', function() {
            return {
                      restrict: 'A',
                      link: function(scope, elm, attrs) {
                                 var element = $(elm);
                                  element.bind('click', function(event) {
                                            element.next().toggleClass("displayed");
                                 });
                      }
           }
 });
 

    angular.module('rubedoDataAccess').factory('TaxonomyService', ['$http',function($http) {
        var serviceInstance={};
        serviceInstance.getTaxonomyByContentId=function(pageId,contentIds){
            return ($http.get("/api/v1/taxonomies",{
                params:{
                    pageId:pageId,
                    type:contentIds
                }
            }));
        };
        return serviceInstance;
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
