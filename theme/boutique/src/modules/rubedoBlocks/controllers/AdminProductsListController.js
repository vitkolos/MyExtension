angular.module("rubedoBlocks").lazy.controller('AdminProductsListController',['$scope', '$http', 'RubedoOrdersService',function($scope, $http, RubedoOrdersService){
    var me = this;
    me.products = [];
    
    var config = $scope.blockConfig;
    var options={};
    if (config.orderDetailPage){
        options.orderDetailPage = config.orderDetailPage;
    }
    console.log($scope.rubedo.current.user);
    options.allCommands = true;
    /* RubedoOrdersService.getMyOrders(options).then(
        function(response){
            if (response.data.success){
                me.orders = response.data.orders;
                if (response.data.orderDetailPageUrl){
                    me.orderDetailPageUrl = response.data.orderDetailPageUrl;
                }
                $scope.clearORPlaceholderHeight();
            }
        }
    ); */

    me.getProducts = async function() {
        let result = await $http({
            url: '/api/v1/ecommerce/products',
            method: "GET",
            params: {
                queryId: '5bf289d439658803678022b7',
                siteId: '55c8777145205ef317c62e09',
                specialOffersOnly: false,
                preview_draft: true,
                page: 1,
                start: 0,
                limit: 1000
            }
        });
        me.products = result.data.contents;
        return result;
    }
    //me.getProducts().then(res => console.log('products', res, me)).catch(err => console.log('err products', err));

    me.getProductsByType = function(typeid) {
        let result = await $http({
            url: '/backoffice/contents',
            method: "GET",
            params: {
                _dc: '1542632894911',
                tFilter: [{"property":"typeId","value":typeid}],
                sort: [{"property":"lastUpdateTime","direction":"DESC"}],
                workingLanguage: 'fr',
                page: 1,
                start: 0,
                limit: 1000
            }
        });
        return result
    }
    me.getProductsByType().then(res => console.log('products', res, me)).catch(err => console.log('err products', err));
}]);