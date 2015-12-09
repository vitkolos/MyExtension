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
        FB = null;
         (function(d, s, id) {
         var js, fjs = d.getElementsByTagName(s)[0];
         //if (d.getElementById(id)) return;
         js = d.createElement(s); js.id = id;
         js.src = "//connect.facebook.net/pt_BR/sdk.js#xfbml=1&version=v2.3";
         fjs.parentNode.insertBefore(js, fjs);
       }(document, 'script', 'facebook-jssdk'));
    };
    $timeout(function() {
            me.loadFcb();
        }, 1000);
}]);



