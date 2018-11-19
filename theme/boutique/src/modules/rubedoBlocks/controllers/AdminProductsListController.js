angular.module("rubedoBlocks").lazy.controller('AdminProductsListController',['$scope', '$http', 'RubedoOrdersService',function($scope, $http, RubedoOrdersService){
    var me = this;
    
    me.fields = [
        //{id: 'all', label: 'Tout'}, 
        {id: 'text', label: 'Nom de produit'}, 
        {id: 'typeId', label: 'Type de produit'},
        {id: 'status', label: 'Statut'},
    ]
    me.subfields = {
        typeId: [
            {id: "", label: ""},
            {id: "56014a7d45205e42506e124b", label: "Musculine"},
            {id: "55c87ae245205e8019c62e08", label: "20 Produits boutique"},
            {id: "56bcb849c445ec56018b5051", label: "Pdf Boutique"},
        ],
        status: [
            {id: 'published', label: "Publié"},
            {id: 'draft', label: "Brouillon"},
        ]
    }

    me.products = [];
    me.allProducts = [];
    me.loading = false;
    me.search_text = "";
    me.search_field = "";
    me.search_subfield = "";

    
    var config = $scope.blockConfig;
    var options={};
    if (config.orderDetailPage){
        options.orderDetailPage = config.orderDetailPage;
    }
    console.log($scope.rubedo.current.user);
    options.allCommands = true;

    me.search = function($event) {
        let keyCode = $event.which || $event.keyCode;
        if (keyCode !== 13) return;

        if (me.subfields[me.search_field] && me.search_subfield) {
            console.log('in subfield search fun')
            me.products = me.allProducts.filter(el => el[me.search_field] && el[me.search_field] == me.search_subfield && (!el['text'] || el['text'].indexOf(me.search_text) >= 0));
        } else if (me.search_field != 'all') {
            me.products = me.allProducts.filter(el => el[me.search_field] && new RegExp(me.search_text, 'gi').test(el[me.search_field]) >= 0);
        } else {
            // search_field == all

        }
        console.log("new product list", me.products.length, me.products);
    }

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
        me.products = result.data.contents.slice(10);
        me.allProducts = result.data.contents;
        return result;
    }
    me.getProducts().then(res => console.log('products', res, me)).catch(err => console.log('err products', err));
}]);