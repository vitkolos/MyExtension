angular.module("rubedoBlocks").lazy.controller('FormCtrl',['$scope',function($scope){
        var me = this;
        $scope.contactCtrl.contactData.test = $scope.contactCtrl.contactData['Nights']*3;
  }]);
