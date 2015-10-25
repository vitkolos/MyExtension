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
        return function(input, splitChar) {
            // do some bounds checking here to ensure it has that index
            if (!splitChar) {
                     splitChar = "_";
            }
            return input.split(splitChar);
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
 
 /*
angular.module('rubedo').run(["$rootScope", "$anchorScroll" , function ($rootScope, $anchorScroll) {
    $rootScope.$on("$viewContentLoaded", function() {
                $anchorScroll();
    });
}]); 
 */
 

$(document).ready(function(){
dot_kill= '';
dot = '';



$(window).bind("scroll", function(){
    if ($('#cte').length)  {
        $("nav").attr("class","cte");
    }   
    else if ($('#infos').length)  {
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
    else if ( $('#alpha').length && $(window).scrollTop() > $('#alpha').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-alpha');
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","alpha");
    }            
    else if ($('#hozana').length && $(window).scrollTop() > $('#hozana').offset().top - 20)  {
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
    else if ($('#volontaires').length && $(window).scrollTop() > $('#volontaires').offset().top - 20)  {
    	dot_kill= dot;
        dot= $('#dots-volontaires');
        $(dot_kill).removeClass('dots-active');
        $("nav").attr("class","volontaires");
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




})
