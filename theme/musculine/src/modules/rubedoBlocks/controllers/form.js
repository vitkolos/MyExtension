angular.module("rubedoBlocks").lazy.controller('FormController',['$scope','$http','MusculinePaymentService','RubedoProductsService','$filter',function($scope,$http,MusculinePaymentService,RubedoProductsService,$filter){
    var me = this;
    var config = $scope.blockConfig;
    me.loading=false;
    $scope.Math = Math;
    me.user={};
    me.facture={};
    // get prices of products
    me.stprice = 0;
    me.soprice = 0;
    me.btprice =0;
    me.boprice = 0;
    var pageId=$scope.rubedo.current.page.id;
    var siteId=$scope.rubedo.current.site.id;
    var queryId = "5601574645205ebc536e124c";
    RubedoProductsService.getContents(queryId,pageId,siteId).then(function(response){
        if (response.data.success){
            me.contents = {};
            angular.forEach(response.data.contents,function(content){
                        me.contents[content.productProperties.sku]= {
                                    'prix': content.productProperties.lowestFinalPrice,
                                    'titre' : content.text,
                                    'id' : content.id,
                                    'quantite':0,
                                    'poids' : content.productProperties.variations[0].poids
                        };
            });
        me.stprice = me.contents['MUS250T'].prix;
        me.soprice = me.contents['MUS250O'].prix;
        me.btprice =me.contents['MUS700T'].prix;
        me.boprice = me.contents['MUS700O'].prix;
        }
        console.log(me.contents);
    });
    me.small_trad=0;
    me.small_or=0;
    me.big_trad=0;
    me.big_or=0;

    me.exp = 0;
    me.total = me.small_trad*me.stprice + me.small_or*me.soprice + me.big_trad*me.btprice + me.big_or*me.boprice + me.exp;
    me.totalPrice = function(){
        return $filter('number')(me.small_trad*me.stprice + me.small_or*me.soprice + me.big_trad*me.btprice + me.big_or*me.boprice + me.fraisExp(), 2);
    };
    me.fraisExp = function(){
        var poids = 340 * (me.small_trad + me.small_or) + 850 * (me.big_or + me.big_trad);
        var fraisExp = 0;
        if (poids>0 && poids<=500) {
           fraisExp = 6.13;
        }
        else if (poids>500 && poids<=750) {
            fraisExp = 6.89;
        }
        else if (poids>750 && poids<=1000) {
            fraisExp =7.51;
        }
        else if (poids>1000 && poids<=2000) {
            fraisExp =8.50;
        }
        else if (poids>2000) {
            fraisExp =10.93;
        }
        return fraisExp;
    }
    
    
    me.copy_address = function(){
        if (me.copy_adress) {
            me.facture.name = me.facture.name;
            me.facture.surname = me.facture.surname;
            me.facture.address = me.facture.address;
            me.facture.city = me.facture.city;
            me.facture.cp = me.facture.cp;
            me.facture.telephone = me.facture.telephone;
            me.facture.email = me.facture.email;
        }
        else {
           me.expedition.name = "";
            me.expedition.surname = "";
            me.expedition.address = "";
            me.expedition.city = "";
            me.expedition.cp = "";
            me.expedition.telephone = "";
            me.expedition.email = "";            
        }
 
    };
    me.payment = function(valide){
        me.contents['MUS250T'].quantite = me.small_trad;
        me.contents['MUS250O'].quantite = me.small_or;
        me.contents['MUS700T'].quantite = me.big_trad;
        me.contents['MUS700O'].quantite = me.big_or;
        if (me.totalPrice() == 0 ) {
            alert("Votre panier est vide");
        }
        else if (!valide) {
            alert("Merci de remplir tous les champs obligatoires");
        }
        else {
            alert("Redirect");
            me.loading=true;
            MusculinePaymentService.paymentService(me.contents, me.facture, me.expedition).then(function(response){
                if (response.data.success) {
                    window.location.href= response.data.url;
                    me.loading = false;
                }
                else {
                    me.loading = false;
                    alert("Connexion au service de payement impossible");
                }
            });
        }
       
    }
}]);