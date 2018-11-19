angular.module("rubedoBlocks").lazy.controller('AdminProductsListController',['$scope', '$http', 'RubedoOrdersService',function($scope, $http, RubedoOrdersService){
    var me = this;
    console.log("$http", $http)
    
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
            {id: "575e74b124564068118bfd42", label: "5.5 Librairie"},
            {id: "57c93550245640eb2b8c0cba", label: "2.1 Revue FOI"},
            {id: "580b29be24564092558b95fd", lable: "20 Films Net for God"},
            {id: "5810a72f24564001018bc024", label: "5.5 Epicerie"},
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
        if ($event !== "skip") {
            let keyCode = $event.which || $event.keyCode;
            if (keyCode !== 13) return;
        }

        if (me.subfields[me.search_field] && me.search_subfield) {
            console.log('in subfield search fun')
            me.products = me.allProducts.filter(el => el[me.search_field] && el[me.search_field] == me.search_subfield && (!el['text'] || el['text'].indexOf(me.search_text) >= 0));
        } else if (me.search_field != 'all') {
            console.log('in field normal')
            me.products = me.allProducts.filter(el => el[me.search_field] && new RegExp(me.search_text, 'gi').test(el[me.search_field]));
        } else {
            // search_field == all

        }
        console.log("new product list", me.products.length, me.products);
    }

    $http.get('https://www.laboutique-chemin-neuf.com/backoffice/contents/get-stock?_dc=1542638855666&type-id=55c87ae245205e8019c62e08&page=1&start=0&limit=100000&workingLanguage=fr&token=2f3e3188a8392ba1d5d3d750c6fb45357f294d927ad51a18c0deafaf35c978af6262ef7166ce7aa5cef12f9b94c57c687627e6e5aae12a7c2bb12e1691fba582').then(res => console.log('sku', res)).catch(err => console.log('sku err', err))

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
        me.products = result.data.contents.slice(0, 10);
        me.allProducts = result.data.contents;
        return result;
    }
    me.getProducts().then(res => console.log('products', res, me)).catch(err => console.log('err products', err));
}]);