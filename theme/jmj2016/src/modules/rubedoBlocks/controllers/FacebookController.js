angular.module("rubedoBlocks").lazy.controller('FacebookController',['$scope','$timeout',function($scope,$timeout){
    var me = this;
    var config = $scope.blockConfig;
    me.showFaces = true;
    me.hideCover=false;
    me.showPosts=true;
    if(config.options){
        angular.forEach(config.options, function(option, key){
            if (option=="showFaces") {
                me.showFaces = false;
            }
            else if (option=="hideCover") {
                me.showCover = true;
            }
            else if (option=="showPosts") {
                me.showPosts = false;
            }
        });
    }
 
    me.loadFcb = function(){
         (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/fr_FR/sdk.js#xfbml=1&version=v2.5";
            fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk'));
    };
    $timeout(function() {
            me.me.loadFcb()
        }, 1000);
}]);



