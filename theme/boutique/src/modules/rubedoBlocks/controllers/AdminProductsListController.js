angular.module("rubedoBlocks").lazy.controller('AdminProductsListController',['$scope', '$http', 'RubedoOrdersService',function($scope, $http, RubedoOrdersService){
    var me = this;
    me.lodatedio = "Lodate Dio !";
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

    me.getProducts = async function() {
        let result = await $http({
            url: '/api/v1/ecommerce/products',
            method: "GET",
            params: {
                //pageId: '55c8777145205ef317c62e2a',
                queryId: '5bf289d439658803678022b7',
                siteId: '55c8777145205ef317c62e09',
                specialOffersOnly: false,
                page: 1,
                start: 0,
                limit: 100
            }
        });
        return result;
    }
    me.getProducts().then(res => console.log('products', res)).catch(err => console.log('err products', err));

}]);