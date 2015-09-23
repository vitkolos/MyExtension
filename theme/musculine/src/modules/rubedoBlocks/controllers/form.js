angular.module("rubedoBlocks").lazy.controller('FormController',['$scope','$http','MusculinePaymentService','RubedoProductsService','$filter',function($scope,$http,MusculinePaymentService,RubedoProductsService,$filter){
    var me = this;
    var config = $scope.blockConfig;
    $scope.Math = Math;
    // get prices of products
    var pageId=$scope.rubedo.current.page.id;
    var siteId=$scope.rubedo.current.site.id;
    var queryId = "5601574645205ebc536e124c";
    RubedoProductsService.getContents(queryId,pageId,siteId).then(function(response){
        if (response.data.success){
            me.contents = {};
            angular.forEach(response.data.contents,function(content){
                        me.contents[content.id]= {
                                    'prix': content.productProperties.lowestFinalPrice,
                                    'titre' : content.text,
                                    'SKU' : content.productProperties.sku
                                    };
            });
        }
        console.log(me.contents);
    });
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    me.small_trad=0;
    me.small_or=0;
    me.big_trad=0;
    me.big_or=0;
    me.stprice = 10.52;
    me.soprice = 10.52;
    me.btprice = 24.96;
    me.boprice = 24.96;
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
    
    me.displaySubmit = "none";

    
    me.copy_address = function(){
        if (me.copy_adress) {
            me.name2 = me.name;
            me.surname2 = me.surname;
            me.address2 = me.address;
            me.city2 = me.city;
            me.cp2 = me.cp;
            me.telephone2 = me.telephone;
            me.name2 = me.name;
            me.email2 = me.email;
        }
        else {
           me.name2 = "";
            me.surname2 = "";
            me.address2 = "";
            me.city2 = "";
            me.cp2 = "";
            me.telephone2 = "";
            me.name2 = "";
            me.email2 = "";
            
        }
    };
    me.payment = function(){
        var options = {
            /*montant:me.totalPrice(),
            prenom: me.surname,
            nom: me.surname,
            email: me.email*/
        };
        MusculinePaymentService.paymentService(options).then(function(response){
            if (response.data.success) {
                window.location.href= response.data.url;
            }
            else console.log("Problème avec le service");
        });
       
    }
}]);