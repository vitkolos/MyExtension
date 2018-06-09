angular.module("rubedoBlocks").lazy.controller('ContactBlockController',['$scope','$location','$filter','RubedoMailService',function($scope,$location,$filter,RubedoMailService){
    var me = this;
    var config = $scope.blockConfig;
    me.contactData={ };
    me.contactError=null;
		
		
		 var themePath='/theme/'+window.rubedoConfig.siteTheme;
   me.general_infos = themePath+'/templates/blocks/formulaire/infos_individuel.html';
			me.family_infos = themePath+'/templates/blocks/formulaire/parents.html';
		
				
		 me.parentsEnsemble=false;
				me.parentsSepares=false;
      me.contactData.subject='Nouvelle réservation';
						me.contactData.message=' ';
      //lg = rubedo.current.page.locale;
      //moment.locale(rubedo.current.page.locale);
      me.contactData.template='/theme/foyers/templates/mails/reservationEDM.html';
    $scope.clearORPlaceholderHeight();
    me.dateDifference = function(start,end){
        console.log($filter('number')((end-start)/(3600*24*1000),0));
        return $filter('number')((end-start)/(3600*24*1000),0);
    }
				me.calculateAge = function calculateAge(birthdate) { // birthdate is a date
								var ageDifMs = Date.now() - birthdate.getTime();
								var ageDate = new Date(ageDifMs); // miliseconds from epoch
								return Math.abs(ageDate.getUTCFullYear() - 1970);
				}
				if ($scope.contactCtrl.contactData.birthdate) {
								console.log("me.contactData.birthdate");
								console.log(me.contactData.birthdate);
								me.contactData.age=calculateAge(me.contactData.birthdate);
								console.log("me.contactData.age");
								console.log(me.contactData.age);
				}
				
				

				me.contactData.parentsEnsemble=true;
				console.log("me.contactData.parentsEnsemble");
				console.log(me.contactData.parentsEnsemble);

				
    me.submit=function(){
        me.contactError=null;
        var contactSnap=angular.copy(me.contactData);
        var payload={
            to:config.email,
            from:me.contactData.email,
            subject:contactSnap.subject
        };
        if(contactSnap.template) {payload.template = contactSnap.template;delete (contactSnap.template);}
        /*var destinataires = {'Nicolas':'nicolas.rhone@gmail.com' ,'Nicolas Rhoné':'nicolas.rhone@wanadoo.fr' }*/
        delete (contactSnap.subject);
        delete (contactSnap.to);
        
        payload.fields=contactSnap;
        angular.element('#myModal'+$scope.block.id+$scope.blockConfig.id).modal('hide');
        angular.element('#myModalsingle').modal('hide');
        payload.fields["website"] = $location.absUrl();
        RubedoMailService.sendMail(payload).then(
            function(response){
                if (response.data.success){
                    me.contactData={ };
                    me.showForm=false;
                    me.showConfirmMessage=true;
                    //$scope.rubedo.sendGaEvent('/form/', 'contact');
                    if(window.ga) {
                        window.ga('send', 'event', 'contact', 'envoi de mail',config.email);
                    }
                } else {
                    me.contactError=response.data.message;
                }
                $('#myModal').modal('hide');
            },
            function(response){
                me.contactError=response.data.message;
            }
        );
    };
				
				   me.currentStage = 1;
 // affichage des sections du formulaire
    me.toggleStage = function(newStage){
       angular.element("#inscriptionStage"+me.currentStage).collapse("hide");
       angular.element("#inscriptionStage"+newStage).collapse("show");
       me.currentStage = newStage;
							
    }
    
    me.setCurrentStage = function(step, valide) {

        if (!valide && step==0) {
            me.toggleStage(1);
        }
        if (valide && (me.currentStage >= step)) {
            
            if (step==0) {me.toggleStage(1);}
            else if (step==1) {
																console.log($scope.contactCtrl.contactData.email);
																console.log($scope.contactCtrl.contactData.email_verif);
																if( $scope.contactCtrl.contactData.email != $scope.contactCtrl.contactData.email_verif){
                    $scope.mailError = true;me.currentStage=1;
                } else {
																				$scope.mailError = false;
																				me.toggleStage(2);
																} 
																//me.getContentById(me.propositionId);
            }
            else if (step==2) {														
																if( $scope.contactCtrl.contactData.emailPere != $scope.contactCtrl.contactData.emailPere_verif){
                    $scope.mailError2 = true;me.currentStage=2;
                }
                else if ($scope.contactCtrl.contactData.emailMere != $scope.contactCtrl.contactData.emailMere_verif) {
                    $scope.mailError2 = false;
																				$scope.mailError3 = true;
                    me.currentStage=2;
                }
																else {
																				$scope.mailError2 = false;
                    $scope.mailError3 = false;
																				me.toggleStage(3);
																}
            }
            else if (step==3) {
                me.toggleStage(4);
            }
												else if (step==4) {
                me.toggleStage(5);
            }
												else if (step==5) {
                me.toggleStage(6);
            }
								}
				}
				
				
}]);
