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
});
angular.module('rubedoBlocks').directive('pauseOnClose', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
											scope.pause="notpaused";
            element.on('hidden.bs.modal', function (e) {
                // Find elements by video tag
																//var video = element.find("jwplayer");
																//playerid = playerid.split("_")[2];
																//jwplayer(playerid).pause();
																//console.log(playerid);
																//video.attr('pause', 'pause');
																scope.pause = "pause";
																console.log(scope.pause);
            });
													element.on('shown.bs.modal', function (e) {
                // Find elements by video tag
																//var video = element.find("jwplayer");
																//playerid = playerid.split("_")[2];
																//jwplayer(playerid).pause();
																//console.log(playerid);
																//video.attr('pause', 'notpaused');
																scope.pause = "notpaused";
																console.log(scope.pause);
            });
        }
    }
});

 angular.module('rubedoBlocks').directive('jwplayer', ['$compile',function ($compile) {
    return {
        restrict: 'EC',
        link: function (scope, element, attrs) {
           var filmUrl = attrs.videoUrl;
											var format = attrs.format;
											var pause = attrs.pause;
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

											//modelObject is a scope property of the parent/current scope
            scope.$watch(attrs.pause, function(value){
                console.log("in new loop" +value);
            });
											
                        /*watch for pause status update*/
           scope.$watch(function () {
                    return attrs.pause;
                }, function (newValue) {
																						console.log(newValue);
                      if (newValue=="pause") {
																																jwplayer(id).pause();
																																console.log(newValue);
																						}
																						else console.log("not in condition " + newValue);
           });    
            
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
    /*
$(document).ready(function(){
dot_kill= '';
dot = '';



$(window).bind("scroll", function(){
    if ($('#infos').length)  {
        $("nav").attr("class"," infos");
    }
    else if ($('#inscriptions').length)  {
        $("nav").attr("class","inscriptions");
    }       
    else if ($('#stage').length && $(window).scrollTop() > $('#stage').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-stage');
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","stage");
    }
    else if ($('#retraite').length && $(window).scrollTop() > $('#retraite').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-retraite');
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","retraite");
    }                
    else if ($('#volontaires').length && $(window).scrollTop() > $('#volontaires').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-volontaires');
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","volontaires");
    }  
    else if ($('#groupe').length && $(window).scrollTop() > $('#groupe').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-groupe');
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","groupe");
    }  
    else if ($('#jpros').length && $(window).scrollTop() > $('#jpros').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-jpros');
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","jpros");
    }
    else if ( $('#hozana').length && $(window).scrollTop() > $('#hozana').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-hozana');
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","hozana");
    }            
    else if ($('#manaim').length && $(window).scrollTop() > $('#manaim').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-manaim');
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","manaim");
    }  
    else if ($('#studilac').length && $(window).scrollTop() > $('#studilac').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-studilac');
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","studilac");
    }  
    else if ($('#cte').length && $(window).scrollTop() > $('#cte').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-cte');
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","cte");
    }
    else if ($('#kawaco').length && $(window).scrollTop() > $('#kawaco').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-kawaco');
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","kawaco");
    }  
    else if ( $('#ateliers').length && $(window).scrollTop() > $('#ateliers').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-ateliers');
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","ateliers");
    }  
    else if ( $('#coeur-a-coeur').length && $(window).scrollTop() > $('#coeur-a-coeur').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-coeur-a-coeur');
        $(dot_kill).removeClass('dots-active');
         $("nav").attr("class","coeur-a-coeur");
   }  
    else if ($('#temps-forts').length && $(window).scrollTop() > $('#temps-forts').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-temps-forts');
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","temps-forts");
    }  
    else if ($('#workshops').length && $(window).scrollTop() > $('#workshops').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-workshops');
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","workshops");
    }  
    else if ($('#fit-fun').length && $(window).scrollTop() > $('#fit-fun').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-fit-fun');
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","fit-fun");
    }  
    else if ($('#intervenants').length && $(window).scrollTop() > $('#intervenants').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-intervenants');
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","intervenants");
    }  
    else if ($('#top').length && $(window).scrollTop() >= $('#top').offset().top) {
		dot_kill= dot;
        dot= '';
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","bg-0");
    }
    $(dot).addClass('dots-active');
});




})*/
