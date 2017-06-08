angular.module("rubedoBlocks").lazy.controller('ChatbotController',['$scope','$timeout','$http',function($scope,$timeout,$http){
				$scope.discussion = [];
				$scope.discussion.push("Que puis-je faire pour vous ?");
				$scope.submit = function(){
								$http({
												method: 'GET',
												url: 'http://10.66.50.200:5000/parse',
												data: { q: $scope.question },
												headers: {
                  'Authorization': 'Basic dGVzdDp0ZXN0',
                  'Content-Type': 'application/x-www-form-urlencoded'
       },
										}).then(function successCallback(response) {
												console.log(response)
														// this callback will be called asynchronously
														// when the response is available
												}, function errorCallback(response) {
														// called asynchronously if an error occurs
														// or server returns response with an error status.
												});
				}
}]);
