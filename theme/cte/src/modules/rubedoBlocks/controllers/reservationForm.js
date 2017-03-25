angular.module("rubedoBlocks").lazy.controller('FormCtrl',['$scope',function($scope){
        $scope.contactCtrl.contactData.test = $scope.contactCtrl.contactData['Nights']*3;
  }]);
