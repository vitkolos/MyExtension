angular.module("rubedoBlocks").lazy.controller('AdminProductsListController',['$scope', '$http', 'RubedoOrdersService',function($scope, $http, RubedoOrdersService){
    var me = this;
    
    me.fields = [{id: 'text', label: 'Nom de produit'}, {id: 'typeId', label: 'Type de produit'}]

    me.products = [];
    me.allProducts = [];
    me.loading = false;
    me.search_text = "";

    
    var config = $scope.blockConfig;
    var options={};
    if (config.orderDetailPage){
        options.orderDetailPage = config.orderDetailPage;
    }
    console.log($scope.rubedo.current.user);
    options.allCommands = true;

    me.getProducts = async function() {
        me.loading = true;
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
        me.loading = false;
        me.products = result.data.contents;
        me.allProducts = result.data.contents;
        return result;
    }
    me.getProducts().then(res => console.log('products', res, me)).catch(err => console.log('err products', err));
}]);