angular.module("rubedoBlocks").lazy.controller('FacebookController',['$scope',function($scope){
    var me = this;
    var config = $scope.blockConfig;

 
    me.loadFcb = function(){
        window.twttr = (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/fr_FR/sdk.js#xfbml=1&version=v2.3";
            fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk'));
    };
    me.loadFcb();
}]);
