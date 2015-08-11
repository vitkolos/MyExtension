angular.module("rubedoBlocks").lazy.controller('AddThisShareController',['$scope','$http','$location',function($scope,$http,$location){
    var me = this;
    var config = $scope.blockConfig;
    me.like = config.like == 1;
    me.disposition = config.disposition;
    me.class = 'addthis_toolbox';
    if(me.like){
        if(config.disposition == 'Horizontal'){
            me.class += ' addthis_default_style';
        } else {
            me.class += ' addthis_floating_style addthis_counter_style addthis-pos';
        }
    } else {
        if(config.disposition == 'Horizontal'){
            me.class += ' addthis_default_style';
            if(config.small == 1){
                me.class += ' addthis_32x32_style'
            }
        } else {
            me.class += ' addthis_floating_style';
            if(config.small == 0){
                me.class += ' addthis_16x16_style addthis-pos';
            } else {
                me.class += ' addthis_32x32_style addthis-pos'
            }
        }
    }

    /*$http.jsonp('https://cdn.api.twitter.com/1/urls/count.json' + '?url='+$location.absUrl() +'&callback=JSON_CALLBACK')
         .success(function(data, status) {
            me.shareCounter = Number(data.count);
            console.log("count twitter : "+me.shareCounter);
            $http.jsonp("https://graph.facebook.com/fql?q=SELECT like_count, total_count, share_count, click_count, comment_count FROM link_stat WHERE url = 'http://perl.org'")
                .success(function(data2, status) {
                    me.shareCounter=me.shareCounter + Number(data2.count);
                    console.log("count facebook : "+data2.count);
                    console.log("count total : "+me.shareCounter);
                });
        
        
    });*/
    me.shareCounter=0
    addthis.sharecounters.getShareCounts(['facebook', 'twitter'], function(obj) {
        console.log()obj[0];
    });
        
        

   

    me.loadAddThis = function(){
        addthis.toolbox('.addthis_toolbox');
    };
}]);
