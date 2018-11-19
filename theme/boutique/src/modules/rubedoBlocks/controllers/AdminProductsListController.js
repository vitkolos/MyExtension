angular.module("rubedoBlocks").lazy.controller('AdminProductsListController',['$scope', '$http', 'RubedoOrdersService',function($scope, $http, RubedoOrdersService){
    var me = this;
    console.log("$http", $http)
    
    me.fields = [
        {id: 'text', label: 'Nom de produit'}, 
        {id: 'typeId', label: 'Type de produit'},
        {id: 'status', label: 'Statut'},
        {id: 'details/stock', label: "Stock"},
    ]
    me.subfields = {
        typeId: [
            {id: "", label: ""},
            {id: "56014a7d45205e42506e124b", label: "Musculine"},
            {id: "55c87ae245205e8019c62e08", label: "20 Produits boutique"},
            {id: "56bcb849c445ec56018b5051", label: "Pdf Boutique"},
            {id: "575e74b124564068118bfd42", label: "5.5 Librairie"},
            {id: "57c93550245640eb2b8c0cba", label: "2.1 Revue FOI"},
            {id: "580b29be24564092558b95fd", label: "20 Films Net for God"},
            {id: "5810a72f24564001018bc024", label: "5.5 Epicerie"},
            {id: "58145fd82456401c4b8b45a2", label: "20 Icônes"},
            {id: "581626ab2456408a078bd480", label: "20 Crèches"},
            {id: "59d7a1273965886f2d16e08a", label: "20 Artisanat"},
            {id: "59d8966b39658885019527f3", label: "20 Avent/Noël"},
            {id: "5a7ae7233965886b6d43ef80", label: "20 Pâques"},
            {id: "5bb3d8443965887e43c2b459", label: "Abonnement FOI"},
        ],
        status: [
            {id: 'published', label: "Publié"},
            {id: 'draft', label: "Brouillon"},
        ],
        'details/stock': [
            {id: '=', label: '='},
            {id: '<', label: '<'},
            {id: '>', label: '>'},
        ]
    }
    me.field_types = {
        'details/stock': 'quantity'
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
            if (me.field_types[me.search_field] && me.field_types[me.search_field] == 'quantity') {
                let qte = parseInt(me.search_text);
                console.log('quantity', qte, me.search_subfield);
                if (me.search_subfield == '=') return me.products = me.allProducts.filter(el => getAttr(el, me.search_field) == qte);
                if (me.search_subfield == '>') return me.products = me.allProducts.filter(el => getAttr(el, me.search_field) > qte);
                if (me.search_subfield == '<') return me.products = me.allProducts.filter(el => getAttr(el, me.search_field) < qte);
            } else {
                let texte = RemoveAccents(me.search_text);
                me.products = me.allProducts.filter(el => el[me.search_field] && el[me.search_field] == me.search_subfield && (!el['text'] || new RegExp(texte, 'gi').test(el['text'])));
            }
        } else if (me.search_field != 'all') {
            console.log('in field normal')
            let texte = RemoveAccents(me.search_text);
            me.products = me.allProducts.filter(el => el[me.search_field] && new RegExp(texte, 'gi').test(RemoveAccents(el[me.search_field])));
        } else {
            // search_field == all

        }
        console.log("new product list", me.products.length, me.products);
    }

    me.getProducts = async function() {
        me.loading = true;
        // on récupère tous les types de produits
        let typeid_list = me.subfields.typeId.map(el => el.id).filter(el => !!el);

        // on récupère les infos générales des produits
        let plist = typeid_list.map(tid => {
            return $http.get('/backoffice/contents?_dc=1542644195712&tFilter=%5B%7B"property"%3A"typeId"%2C"value"%3A"'+tid+'"%7D%5D&page=1&start=0&limit=50&sort=%5B%7B"property"%3A"lastUpdateTime"%2C"direction"%3A"DESC"%7D%5D&workingLanguage=fr')
        })
        /* let result = await $http({
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
        }); */
        let http_result = await Promise.all(plist);
        console.log('http resultproducts', http_result)
        me.allProducts = flatten(http_result.map(res => res.data.data));
        me.products = me.allProducts.slice(0, 20);
        console.log('products1', me.allProducts.length, me.allProducts)

        // on récupère les niveaux de stock
        plist = typeid_list.map(tid => {
            return $http({url: '/backoffice/contents/get-stock', method:'GET', params: {_dc:'1542638855666', 'type-id':tid, 'page':1,'start':0,'limit':100000,'workingLanguage':'fr'}})
        })
        let stock_list = await Promise.all(plist);
        stock_list = flatten(stock_list.map(res => res.data.data));
        console.log('stocks', stock_list)

        me.allProducts = mergeList(me.allProducts, 'id', 'details', stock_list, 'productId');
        me.products = me.allProducts.slice(0, 20);

        me.loading = false;
        return me.allProducts;
    }
    me.getProducts().then(res => console.log('products', me)).catch(err => console.log('err products', err));


    // ==========================================================
    //                  HELPER FUNCTIONS
    // ==========================================================

    // merge l2 in l1 on id_attr : l1[i][attr] = l2[j]
    function mergeList(l1, id_attr1, attr, l2, id_attr2) {
        for (let i = 0; i < l1.length; i++) {
            let el2 = l2.find(el => el[id_attr2] == l1[i][id_attr1]);
            if (el2) l1[i][attr] = el2;
        }
        return l1
    }

    function flatten(arr) {
        let newarr = [];
        for (let i = 0; i < arr.length; i++) {
            if (Array.isArray(arr[i])) newarr = newarr.concat(arr[i]);
            else newarr.push(arr[i]);
        }
        return newarr;
    }

    function getAttr(o, attr) {
        if (!o) return o;
        if (attr.indexOf('/') < 0) return o[attr];
        let fields = attr.split('/');
        return getAttr(o[fields[0]], fields.slice(1).join('/'));
    }

    function RemoveAccents(str) {
        var accents    = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
        var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
        str = str.split('');
        let x;
        for (let i = 0; i < str.length; i++) {
            if ((x = accents.indexOf(str[i])) != -1) {
                str[i] = accentsOut[x];
            }
        }
        return str.join('');
    }
}]);