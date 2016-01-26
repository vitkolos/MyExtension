angular.module("rubedoBlocks").lazy.controller("MenuController",['$scope','$location','RubedoMenuService','RubedoPagesService',function($scope,$location,RubedoMenuService,RubedoPagesService){
    var me=this;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    me.menu={};
    me.currentRouteline=$location.path();
    me.ShoppingCartConfig={displayMode:"button" , cartDetailPage:"55c8777145205ef317c62e2d" , checkoutPage:"55c8ac3545205e972cc62e12" ,};
    me.sayBlockConfig="blockConfig="
    var config=$scope.blockConfig;
    me.menuTab = false;
     if ($scope.block.code && $scope.block.code!="") {
        me.menuTab = true;
    }
    me.searchEnabled = (config.useSearchEngine && config.searchPage);
    if (config.rootPage){
        var pageId=config.rootPage;
    } else if (config.fallbackRoot&&config.fallbackRoot=="parent"&&mongoIdRegex.test($scope.rubedo.current.page.parentId)){
        var pageId=$scope.rubedo.current.page.parentId;
    } else {
        var pageId=$scope.rubedo.current.page.id;
    }
    me.onSubmit = function(){
        var paramQuery = me.query?'?query='+me.query:'';
        RubedoPagesService.getPageById(config.searchPage).then(function(response){
            if (response.data.success){
                $location.url(response.data.url+paramQuery);
            }
        });
    };
    RubedoMenuService.getMenu(pageId, config.menuLevel).then(function(response){
        if (response.data.success){
            me.menu=response.data.menu;
        } else {
            me.menu={};
        }
    });
    me.showMenu =function(){
        $scope.menu = !$scope.menu;
        if($scope.menu) angular.element('#menuModal').modal('show');
        else angular.element('#menuModal').modal('hide');
    };
    // pour fermer le modal quand on clique sur un lien
    $scope.$on("$locationChangeStart",function(event, newLoc,currentLoc){
        angular.element('body .modal-backdrop ').remove();
    });

}]);