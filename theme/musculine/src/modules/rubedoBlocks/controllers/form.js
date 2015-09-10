angular.module("rubedoBlocks").lazy.controller('FormController',['$scope','$http','PaymentService',function($scope,$http,PaymentService){
    var me = this;
    var config = $scope.blockConfig;
    me.small_trad=0;
    me.small_or=0;
    me.big_trad=0;
    me.big_or=0;
    me.stprice = 9.5;
    me.soprice = 9.5;
    me.btprice = 15.5;
    me.boprice = 15.5;
    me.exp = 0;
    me.total = me.small_trad*me.stprice + me.small_or*me.soprice + me.big_trad*me.btprice + me.big_or*me.boprice + me.exp;

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
    me.getParameters = function(){
        var options = {
            montant:me.small_trad*me.stprice + me.small_or*me.soprice + me.big_trad*me.btprice + me.big_or*me.boprice + me.exp,
            prenom: me.surname,
            nom: me.surname,
            email: me.email
        };
        PaymentService.getParameters(options).then(function(response){
            console.log(response.data);
            if (response.data.success) {
                console.log('retour de l appel de TestPaybox en get');
                console.log(response.data.parametres);
                $scope.parametres = response.data.parametres;
                me.displaySubmit = "block";  
            }
            else console.log("Problème avec le service");
        });
       
    }
}]);