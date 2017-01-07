angular.module("rubedoBlocks").lazy.controller("SiteMapController",['$scope','$timeout','$location','RubedoMenuService',function($scope,$timeout,$location,RubedoMenuService){
    var me=this;
    var config=$scope.blockConfig;
    var pageId=$scope.rubedo.current.page.id;
    var hiddenPages = {};

    var calculatePagesDiplay = function(pages, level) {
        angular.forEach(pages, function(value) {
            if(value.pages) {
                if(level < config.displayLevel) {
                    hiddenPages[value.id] = false;
                } else {
                    hiddenPages[value.id] = true;
                }

                calculatePagesDiplay(value.pages, level+1);
            }
        });
    };

    if(config.rootPage){
        $scope.menu=[];
        me.currentRouteline=$location.path();

        // get all pages for the menu
        RubedoMenuService.getMenu(config.rootPage, 5).then(function(response){
            if (response.data.success){
                $scope.menu=response.data.menu;

                if($scope.menu.pages) {
                    // hide home page children's if the display level is 0
                    if(config.displayLevel == 0) {
                        hiddenPages[$scope.menu.id] = true;
                    } else {
                        hiddenPages[$scope.menu.id] = false;
                    }

                    // calculate for all pages with children if they have to display them
                    calculatePagesDiplay($scope.menu.pages, 1);
                }
                $scope.clearORPlaceholderHeight();
            } else {
                $scope.menu=[];
                $scope.clearORPlaceholderHeight();
            }
        });

        // allow to change the "show" status of a page
        me.setPageDisplay = function(pageId){
            if(hiddenPages[pageId] == true) {
                hiddenPages[pageId] = false;
            } else {
                hiddenPages[pageId] = true;
            }
        };

        // allow to get the "show" status of a page
        me.getPageDisplay = function(pageId){
            return  hiddenPages[pageId];
        }
    }

/*networks*/
				me.networks = [];
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
        if(key != 'rootPage' && key != 'displayLevel' && key != 'follow_section'){
            var network = {
                name: key,
                id: value
            };
            me.networks.push(network);
        }
    });
				console.log(me.networks);
				me.nbOfNetworks = (me.networks).length;
				//me.colClass="col-sm-"+12/me.nbOfNetworks;
				
    $timeout(function() {
        addthis.toolbox('.addthis_toolbox');
        $scope.clearORPlaceholderHeight();
    }, 500);

}]);