angular.module("rubedoBlocks").lazy.controller('uploadXlsController',['$scope', '$http', 'RubedoPagesService', 'RubedoContentsService', 'RubedoOrdersService',
function($scope, $http, RubedoPagesService, RubedoContentsService, RubedoOrdersService){
    console.log("UploadXlsController")

    $scope.uploadXLS = function() {
        let f = document.getElementById('file').files[0],
        r = new FileReader();

        /* r.onloadend = function(e) {
            var data = e.target.result;
            //send your binary data via $http or $resource or do anything else with it
            let d = r.readAsBinaryString(data);
            console.log("loadend", d);
        } */

        r.onload = function () {
            console.log(r.result);
        }

        r.readAsBinaryString(f);
    }
}]);