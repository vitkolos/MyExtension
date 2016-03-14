angular.module("rubedoBlocks").lazy.controller("DonationController",['$scope',function($scope) {
    var me = this;
    var themePath='/theme/'+window.rubedoConfig.siteTheme;
    //templates
    me.donationTemplate = themePath+'/templates/blocks/donation.html';
    me.currentStage=0;
    $scope.don= {};
    
}]);


