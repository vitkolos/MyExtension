angular.module('rubedoBlocks').lazy.directive('fbPage', ['$window', function($window) {
    return {
      restrict: 'A',
      scope: {},
      template: '<div class="fb-page" data-href="{{page}}" data-hide-cover="{{hide}}" data-width="{{width}}" data-show-facepile="{{faces}}" data-height="{{height}}" data-show-posts="{{posts}}"></div>',
      link: function($scope, $element, $attrs) {
        var requested = false;
        
        $scope.height = '550';
        $scope.faces = 'false';
        $scope.posts = 'true';
        $scope.hide = 'false';
        $scope.width = $element.parent().width();
        
        ['page','faces','height','width','hide','posts'].forEach(function(name){
            $attrs.$observe('fb' + name.charAt(0).toUpperCase() + name.slice(1), function(val){
                $scope[name] = val;
            });
        });
        
        function request(){
            if (!requested) {
                requested = true;
                requestAnimationFrame(update);
            }
        }
        
        function update(){
            $scope.$evalAsync(function() {
                $scope.width = $element.parent().width();
                $scope.$evalAsync(function() {
                    FB.XFBML.parse($element[0], function(){
                        requested = false;
                    });
                });
            });
        }

        $window.addEventListener('resize', request);
        
        $window.fbAsyncInit = function() {
            FB.init({
                version    : 'v2.1' // use version 2.1
            });
        }
      }
    };
}]);
