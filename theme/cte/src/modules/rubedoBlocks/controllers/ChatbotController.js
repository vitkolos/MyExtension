angular.module("rubedoBlocks").lazy.controller('ChatbotController',['$scope','$timeout','$http',function($scope,$timeout,$http){
				$scope.discussion = [];
				$scope.botName =  "Jésus";
				$scope.botImage = "http://www.senegal7.com/wp-content/uploads/2017/05/jesus-5.jpg";
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
												$scope.discussion.push(botMessage);
												
												
								});
				}
}]);
