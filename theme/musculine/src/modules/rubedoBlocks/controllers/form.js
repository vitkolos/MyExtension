angular.module("rubedoBlocks").lazy.controller('FormController',['$scope','RubedoContentsService','$http','MusculinePaymentService','RubedoProductsService','$filter',function($scope,RubedoContentsService,$http,MusculinePaymentService,RubedoProductsService,$filter){
    var me = this;
    var config = $scope.blockConfig;
    me.loading=false;
    $scope.Math = Math;
    me.facture={};
    me.expedition={};
    // get prices of products
    me.stprice = 0;
    me.soprice = 0;
    me.btprice =0;
    me.boprice = 0;
    var pageId=$scope.rubedo.current.page.id;
    var siteId=$scope.rubedo.current.site.id;
    var queryId = "5604067145205eb9346e124b";
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
        else console.log(response.data.message)
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
    
    
    /*me.copy_address = function(){
        if (me.copy_adress) {
            $scope.formulaire.expedition = angular.copy($scope.formulaire.facture);
        }
        else {
           $scope.formulaire.expedition.name = "";
            $scope.formulaire.expedition.surname = "";
            $scope.formulaire.expedition.address = "";
            $scope.formulaire.expedition.city = "";
            $scope.formulaire.expedition.cp = "";
            $scope.formulaire.expedition.telephone = "";
            $scope.formulaire.expedition.email = "";            
        }
 
    };*/
    me.payment = function(valide){
        me.contents['MUS250T'].quantite = me.small_trad;
        me.contents['MUS250O'].quantite = me.small_or;
        me.contents['MUS700T'].quantite = me.big_trad;
        me.contents['MUS700O'].quantite = me.big_or;
        var prix = me.totalPrice() ;
        if (prix == "0,00" ) {
            alert("Votre panier est vide");
        }
        else if (!valide) {
            alert("Merci de remplir tous les champs obligatoires");
        }
        else {
            me.loading=true;
             var payLoad={
                    status:"published",
                    typeId:"5603f8b245205e0e2a6e1271",
                    fields: {
                        "text":"Commande "+me.facture.surname+" "+me.facture.name,
                        "summary":"",
                        "name":me.facture.name,
                        "surname":me.facture.surname,
                        "address":me.facture.address,
                        "city":me.facture.city,
                        "cp":me.facture.cp,
                        "telephone":me.facture.telephone,
                        "email":me.facture.email
                        }
            };

            
            
            
            
            MusculinePaymentService.paymentService(me.contents, me.facture, payLoad).then(function(response){
                if (response.data.success) {
                    /*window.location.href= response.data.url;*/
                }
                else {
                    me.loading = false;
                    /*alert("Connexion au service de payement impossible");*/
                    console.log(response.data.message);
                }
            });
        }
       
    }
}]);