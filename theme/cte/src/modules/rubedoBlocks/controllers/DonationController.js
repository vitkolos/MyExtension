angular.module("rubedoBlocks").lazy.controller("DonationController",['$scope',function($scope) {
    var me = this;
    var themePath='/theme/'+window.rubedoConfig.siteTheme;
    //templates
    me.inscriptionTemplate = themePath+'/templates/blocks/donation.html';
    
}]);


