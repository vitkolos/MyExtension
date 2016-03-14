angular.module("rubedoBlocks").lazy.controller("DonationController",['$scope',function($scope) {
    var me = this;
    var themePath='/theme/'+window.rubedoConfig.siteTheme;
    //templates
    me.donationTemplate = themePath+'/templates/blocks/donation.html';
    me.currentStage=1;
    $scope.don= {};
    me.toggleStage = function(newStage){
       angular.element("#inscriptionStage"+me.currentStage).collapse("hide");
       angular.element("#inscriptionStage"+newStage).collapse("show");
       me.currentStage = newStage;
    }
    me.setCurrentStage = function(step, valide) {
        if(valide){
            me.toggleStage(step+1);
        }  
    };    
}]);


