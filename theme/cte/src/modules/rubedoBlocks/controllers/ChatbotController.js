angular.module("rubedoBlocks").lazy.controller('ChatbotController',['$scope','$timeout','$http',function($scope,$timeout,$http){
				$scope.discussion = [];
				$scope.botName =  "Jésus";
				$scope.botImage = "https://st2.depositphotos.com/2668729/5771/v/950/depositphotos_57719963-stock-illustration-jesus-avatar-wearing-sun-glasses.jpg";
				$scope.discussion.push("Que puis-je faire pour toi ?");
				$scope.submit = function(){
								$scope.discussion.push($scope.question);
								$.get('http://10.66.50.200:5000/parse?q='+$scope.question, function (data) {
												console.log(data);
												var botMessage="Je ne suis pas encore assez intelligent pour comprendre ça...";
												if (data.intent.confidence<0.7) {
													// not undestood entry
												}
												else {
																switch(data.intent.name) {
																case 'greeting':
																				botMessage = "Salut ! Je suis " + $scope.botName  + ". Et toi ?" ;
																				break;
																case 'bot_state':
																				botMessage = "Je vais bien ! " ;
																				break;
																case 'user_name':
																				botMessage = "Bonjour" ;
																				for (var i = 0; i < data.entities.length; i++) {
																					if (data.entities[i].entity=='user_name') {
																						userName = data.entities[i].value;
																						botMessage += " "+userName ;
																					}
																//Do something
																}
																default:
																				break;
																}
												}
												console.log(botMessage);
												$timeout(function(){
																$scope.discussion.push(botMessage);
																$scope.question="";
															
												}, 100);
												
												
												
								});
				}
}]);
