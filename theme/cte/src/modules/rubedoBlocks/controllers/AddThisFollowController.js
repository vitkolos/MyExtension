angular.module("rubedoBlocks").lazy.controller('AddThisFollowController',['$scope','$timeout',function($scope,$timeout){
    var me = this;
    var config = $scope.blockConfig;
    me.networks = [];
    me.divClass = 'addthis_toolbox';
    if(config.small == 1){
        me.divClass += ' addthis_32x32_style';
    }
    if(config.disposition == 'Horizontal'){
        me.divClass += ' addthis_default_style';
    } else {
        me.divClass += ' addthis_vertical_style';
    }
    me.networkClass = function(network){
        return 'addthis_button_'+network.name+'_follow';
    };
				me.networkIcon = function(network){
								var icon = '';
								switch (network) {
												case "facebook" : icon='fa fa-facebook-official'; break;
												case "twitter" : icon='fa fa-twitter-square'; break;
												case "youtube" : icon='fa fa-youtube-square'; break;
								}
        return icon;
    };
    angular.forEach(config, function(value,key){
        if(key != 'disposition' && key != 'small'){
            var network = {
                name: key,
                id: value
            };
            me.networks.push(network);
        }
    });
				//me.nbOfNetworks = me.networks.length;
				//me.colClass="col-sm-"+12/me.nbOfNetworks;
				
    $timeout(function() {
        addthis.toolbox('.addthis_toolbox');
        $scope.clearORPlaceholderHeight();
    }, 500);

}]);