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

    me.shareCounter=0;
    me.shares = function(){   
        var shares = 0;
        addthis.sharecounters.getShareCounts(['facebook', 'twitter'], function(obj) {
            for (var i = 0; i < 2; i++) {
                if(obj[i].service=="twitter") {shares+=obj[i].count; }
                else if(obj[i].service=="facebook") shares+=obj[i].share.total_count;
            }
            
        });
        me.shareCounter = share;
        return shares;
    };



    me.loadAddThis = function(){
        addthis.toolbox('.addthis_toolbox');

        };
}]);
