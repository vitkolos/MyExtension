angular.module("rubedoBlocks").lazy.controller('AdminProductsListController',['$scope', '$http', 'RubedoPagesService', 'RubedoContentsService', 'RubedoOrdersService',function($scope, $http, RubedoPagesService, RubedoContentsService, RubedoOrdersService){
    var me = this;
    console.log("scope",$scope)
    
    me.fields = [
        {value: 'text', label: 'Nom de produit'}, 
        {value: 'typeId', label: 'Type de produit'},
        {value: 'online', label: 'Statut'},
        {value: 'details/stock/min', label: "Stock"},
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
        online: [
            {id: 'true', label: "En ligne"},
            {id: 'false', label: "Hors ligne"},
        ],
        'details/stock/min': [
            {id: '=', label: '='},
            {id: '<', label: '<'},
            {id: '>', label: '>'},
        ]
    }
    me.field_types = {
        online: 'boolean',
        'details/stock/min': 'quantity',
    }

    me.raccourcis = [
        {
            id: 'tout', label: 'Tous les produits',
            rule: {search_field: 'text', search_subfield: '', search_text: ''}
        },
        {
            id: 'rupture_stock', label: 'En rupture de stock',
            rule: {search_field: 'details/stock/min', search_subfield: '=', search_text: '0'}
        },
        {
            id: 'hors_ligne', label: 'Hors ligne',
            rule: {search_field: 'online', search_subfield: 'false', search_text: ''}
        },
    ]

    me.products = [];
    me.allProducts = [];
    me.loading = false;
    me.loading_one = ''; // contient l'id du produit qui est en cours d'update
    me.search_text = "";
    $scope.search_field = "text";
    me.search_subfield = "";

    
    var config = $scope.blockConfig;
    var options={};
    if (config.orderDetailPage){
        options.orderDetailPage = config.orderDetailPage;
    }
    console.log($scope.rubedo.current.user);
    options.allCommands = true;

    // lance une recherche à partir du raccourci en paramètre
    me.setRaccourci = function(raccourci) {
        console.log('setting raccourci', raccourci)
        //$scope.search_field = raccourci.rule.search_field;
        $scope.search_field = raccourci.rule.search_field;
        me.search_subfield = raccourci.rule.search_subfield;
        me.search_text = raccourci.rule.search_text;
        me.search('skip')
        $('#raccourci_' + raccourci.id).addClass('raccourci_active');
    }

    me.search = function($event) {
        $('div.raccourci').removeClass('raccourci_active');
        if ($event !== "skip") {
            let keyCode = $event.which || $event.keyCode;
            if (keyCode !== 13) return;
        }

        if (me.subfields[$scope.search_field] && me.search_subfield) {
            console.log('in subfield search fun')
            if (me.field_types[$scope.search_field] == 'quantity') {
                let qte = parseInt(me.search_text);
                console.log('quantity', qte, me.search_subfield);
                if (me.search_subfield == '=') return me.products = me.allProducts.filter(el => getAttr(el, $scope.search_field) == qte);
                if (me.search_subfield == '>') return me.products = me.allProducts.filter(el => getAttr(el, $scope.search_field) > qte);
                if (me.search_subfield == '<') return me.products = me.allProducts.filter(el => getAttr(el, $scope.search_field) < qte);
            } else if (me.field_types[$scope.search_field] == 'boolean') {
                let v = (me.search_subfield == 'true') ? true: false;
                me.products = me.allProducts.filter(el => el[$scope.search_field] == v)
            } else {
                let texte = RemoveAccents(me.search_text);
                me.products = me.allProducts.filter(el => el[$scope.search_field] == me.search_subfield && (!el['text'] || new RegExp(texte, 'gi').test(RemoveAccents(el['text']))));
            }
        } else if ($scope.search_field != 'all') {
            console.log('in field normal')
            if (me.search_text == "") return me.products = me.allProducts;
            let texte = RemoveAccents(me.search_text);
            me.products = me.allProducts.filter(el => el[$scope.search_field] && new RegExp(texte, 'gi').test(RemoveAccents(el[$scope.search_field])));
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
        let http_result = await Promise.all(plist);
        console.log('http resultproducts', http_result)
        me.allProducts = flatten(http_result.map(res => res.data.data));

        // on ajoute quelques meta-données dans 'details'
        for (let i = 0; i < me.allProducts.length; i++) {
            let stocks = me.allProducts[i].productProperties.variations.map(el => el.stock);
            me.allProducts[i].details = {
                stock: {
                    min: Math.min(...stocks),
                    max: Math.max(...stocks),
                }
            }
        }

        /* plist = typeid_list.map(tid => {
            return $http({url: '/backoffice/contents/get-stock', method:'GET', params: {_dc:'1542638855666', 'type-id':tid, 'page':1,'start':0,'limit':100000,'workingLanguage':'fr'}})
        })
        let stock_list = await Promise.all(plist);
        stock_list = flatten(stock_list.map(res => res.data.data));
        console.log('stocks', stock_list)

        me.allProducts = mergeList(me.allProducts, 'id', 'details', stock_list, 'productId');*/

        me.products = me.allProducts.slice(0, 20);
        console.log('products1', me.allProducts.length, me.allProducts)

        me.loading = false;
        return me.allProducts;
    }
    me.getProducts().then(res => console.log('products', me)).catch(err => console.log('err products', err));

    // trie les produits par ...
    me.sortProducts = function(field) {
        let sorted = _.sortBy(me.products, pr => RemoveAccents(getAttr(pr, field)));
        if (sorted.slice(0,4).map(e => e.id).join(',,') == me.products.slice(0,4).map(e => e.id).join(',,')) me.products = sorted.reverse();
        else me.products = sorted;
        console.log("sorted by " + field, me.products)
    }

    me.changeStatus = function(event, content_id, online_or_offline) {
        event.preventDefault();
        event.stopPropagation();
        let new_status = (online_or_offline == 'online');
        if (!confirm(`Es-tu sûr(e) de vouloir mettre ce contenu ${(online_or_offline == 'online') ? 'en': 'hors'} ligne ?`)) return;
        me.updateProduct(event, content_id, {online: new_status});
    }

    // met à jour le produit avec l'id @content_id avec les éléments dans new_content (e.g. new_content = {online: false} pour mettre offline)
    me.updateProduct = async function(event, content_id, new_content) {
        event.preventDefault();
        me.loading_one = content_id;

        // on récupère le contenu du produit tout frais
        let res;
        try {
            res = await $http({url: '/backoffice/contents/find-one', method: 'GET', params: {_dc: '1542808296999', id: content_id, page: 1, start: 0, limit: 25, workingLanguage: 'fr'}});
        } catch(e) {
            me.loading_one = '';
            console.log("Erreur lors de la mise à jour du produit (impossible de trouver le produit " + content_id + ")", e)
            $scope.rubedo.addNotification("danger",$scope.rubedo.translate("Block.Error", "Error !"),$scope.rubedo.translate("Blocks.Contrib.Status.UpdateError", "Content update error"));
            return
        }
        console.log('PO', res)
        if (!res.data.success && !res.data.succes) {
            me.loading_one = '';
            console.log("updateProduct erreur", content_id, res)
            $scope.rubedo.addNotification("danger",$scope.rubedo.translate("Block.Error", "Error !"),$scope.rubedo.translate("Blocks.Contrib.Status.UpdateError", "Content update error..."));
            return
        }
        
        let ind = me.allProducts.findIndex(pr => pr.id == content_id);
        if (ind < 0) return console.log('Impossible de trouver le produit ' + content_id + ' dans les objets locaux !')

        let content_full = angular.copy(res.data.data);
        content_full = updateAssign(content_full, new_content);
        console.log("updating product...",res.data.content, content_full)

        let res_update;
        try {
            res_update = await $http({
                url: '/backoffice/contents/update?_dc=1542806010167',
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(JSON.stringify(obj[p])));
                    return str.join("&");
                },
                data: {
                    tFilter: [{"property":" typeId", "value": content_full.typeId}],
                    workingLanguage: 'fr',
                    data: content_full
                }
            })
        } catch(e) {
            me.loading_one = '';
            console.log("Erreur lors de la mise à jour de " + content_id, e)
            $scope.rubedo.addNotification("danger", $scope.rubedo.translate("Block.Error", "Error !"),$scope.rubedo.translate("Blocks.Contrib.Status.UpdateError", "Content update error"));
            return
        }
        if (!res_update.data.success && !res_update.data.succes) {
            me.loading_one = '';
            console.log("Erreur lors de la mise à jour du produit " + content_id, res_update)
            $scope.rubedo.addNotification("danger", $scope.rubedo.translate("Block.Error", "Error !"),$scope.rubedo.translate("Blocks.Contrib.Status.UpdateError", "Content update error"));
            return
        }

        // on met à jour les listes de produits locales
        me.allProducts[ind] = content_full;
        ind = me.products.findIndex(pr => pr.id == content_id);
        if (ind >= 0) me.products[ind] = content_full;
        me.loading_one = '';
        $scope.$apply();

        console.log("update success", res_update);
        return content_full
    }

    // redirige vers la page de détail du produit avec l'id contentId
    me.goToContentPage = async function(contentId, enligne) {
        if (!enligne) return console.log("ce contenu est hors ligne");
        let response = await RubedoPagesService.getPageById($scope.rubedo.current.page.id, true);
        if (!response.data.success) return console.log("in languageCtrl.changeLang : could not find page with id " + $scope.rubedo.current.page.id);
        try {
            let contentResponse = await RubedoContentsService.getContentById(contentId);
            if (!contentResponse.data.success) return console.log('error in redirect', contentResponse)

            let contentSegment = contentResponse.data.content.text;
            if (contentResponse.data.content.fields.urlSegment && contentResponse.data.content.fields.urlSegment != ""){
                contentSegment = contentResponse.data.content.fields.urlSegment;
            }
            window.location.href = response.data.url + "/" + contentId + "/" + angular.lowercase(contentSegment.replace(/ /g, "-")); return
        } catch(e) {
            console.log('erreur redirect', e)
        }
    }

    // ==========================================================
    //                  HELPER FUNCTIONS
    // ==========================================================

    me.copyToClipboard = str => {
        const el = document.createElement('textarea');
        el.value = str;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      };

    // comme Object.assign mais plus intelligent
    function updateAssign(o1, o2) {
        for (let attr in o2) {
            if (typeof o2[attr] === 'object' && !Array.isArray(o2[attr])) {
                if (!o1[attr]) o1[attr] = {};
                let sub_o = updateAssign(o1[attr], o2[attr]);
                o1[attr] = sub_o
            } else {
                o1[attr] = o2[attr]
            }
        }
        return o1
    }

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
        if (typeof str !== 'string') return str;
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