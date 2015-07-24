blocksConfig.buttonToPage={
           "template": "/templates/blocks/buttonToPage.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/buttonToPage.js"]
};
blocksConfig.simpleContact={
           "template": "/templates/blocks/simpleContact.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/simpleContact.js"]
};
blocksConfig.carrousel2={
           "template": "/templates/blocks/carrousel_fullWidth.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/carrousel_fullWidth.js"]
};

angular.module('rubedoBlocks').directive('scrollToAnchor', function ($location, $anchorScroll) {
    return  function(scope, element, attrs) {
            /*var idToScroll = attrs.scrollToAnchor;
            var idToScroll = attrs.href;
            var target=$elm;*/
           element.bind('click', function(event) {
                      event.stopPropagation();
                      var off = scope.$on('$locationChangeStart', function(ev) {
                                 off();
                                 ev.preventDefault();
                      });
                      var location = attrs.scrollToAnchor;
                      var target = angular.element("#"+location);
                      angular.element("body,html").animate({scrollTop: target.offset().top}, "slow");

            });
        }
    
});
angular.module('rubedoBlocks').directive('loadModal', function () {
    return {
        restrict: 'A',
        link: function(scope, $elm, attrs) {
            $elm.bind('click', function(event) {
                event.preventDefault();
                /*angular.element('#myModal iframe').attr('src', src);*/
                angular.element('#myModal').appendTo('body').modal('show');
            });
            scope.dismiss = function() {
                      angular.element('#myModal').modal('hide');
           };
        }
    }
});

angular.module('rubedoBlocks').directive('scrollDelay',['$timeout', '$location','$anchorScroll', function (timer, $location,$anchorScroll) {
    return {
        link: function (scope, elem, attrs, ctrl) {
            var scroll = function () {                
               if ($location.hash && $location.hash() == attrs.id) {
                       $location.hash(attrs.id);
                       $anchorScroll();

               }
            }
            // hello();
            timer(scroll, 3000);
            // It works even with a delay of 0s
        }
    }   
          
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




 angular.module('rubedoFields').filter('split', function() {
        return function(input, splitChar, splitIndex) {
            // do some bounds checking here to ensure it has that index
            if (!splitChar) {
                     splitChar = "_";
            }
            return input.split(splitChar)[splitIndex];
        }
    });
    
    


 



