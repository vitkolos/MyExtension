angular.module("rubedoBlocks").lazy.controller('ChatbotController',['$scope','$timeout','$http',function($scope,$timeout,$http){
				$scope.discussion = [];
				$scope.discussion.push("Que puis-je faire pour vous ?");
				$scope.submit = function(){
								$http.get("/api/v1/bot",{
                params:{
                    query:$scope.question
                }
            }).then(function(response){console.log(response)});
				}
}]);
