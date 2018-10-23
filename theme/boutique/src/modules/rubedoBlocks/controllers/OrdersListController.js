angular.module("rubedoBlocks").lazy.controller('OrdersListController',['$scope','RubedoOrdersService',function($scope,RubedoOrdersService){
    var me = this;
    var config = $scope.blockConfig;
    var options={};
    if (config.orderDetailPage){
        options.orderDetailPage = config.orderDetailPage;
    }
    console.log($scope.rubedo.current.user);
    options.allCommands = true;
    RubedoOrdersService.getMyOrders(options).then(
        function(response){
            if (response.data.success){
                me.orders = response.data.orders;
                if (response.data.orderDetailPageUrl){
                    me.orderDetailPageUrl = response.data.orderDetailPageUrl;
                }
                $scope.clearORPlaceholderHeight();
            }
        }
    );

}]);