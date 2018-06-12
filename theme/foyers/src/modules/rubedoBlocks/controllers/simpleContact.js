angular.module("rubedoBlocks").lazy.controller('ContactBlockController',['$scope','$location','$filter','RubedoMailService',function($scope,$location,$filter,RubedoMailService){
    var me = this; 
    var config = $scope.blockConfig;
    
				
				/* GESTION DES CASES VIDES DANS L'ENVOI DU MAIL */
				me.contactData={ };
				me.contactData.nationality=' ';
				me.contactData.tel3Pere=' ';
				me.contactData.tel3Mere=' ';
				me.contactData.countryPere=' ';
				me.contactData.countryMere=' ';
				me.contactData.professionPere=' ';
				me.contactData.professionMere=' ';
				me.contactData.examensTypes=' ';
				me.contactData.diplomes=' ';
				me.contactData.nombreFreresSoeurs=' ';
				me.contactData.ageFreresSoeurs=' ';

    
				
				
				me.contactError=null;
				
					/* LIENS VERS LES SECTIONS DU FORMULAIRE */
		 var themePath='/theme/'+window.rubedoConfig.siteTheme;
			me.formulaireTemplate = themePath+'/templates/blocks/simpleContactFoyers.html';
   me.general_infos = themePath+'/templates/blocks/formulaire/infos_individuel.html';
			me.general_infos_ladefense= themePath+'/templates/blocks/formulaire/infos_individuel_ladefense.html';
			me.family_infos = themePath+'/templates/blocks/formulaire/parents.html';
			me.freres_soeurs_infos = themePath+'/templates/blocks/formulaire/freres_soeurs.html';
   me.travail_infos = themePath+'/templates/blocks/formulaire/etudes_travail.html';
			me.travail_infos_ladefense = themePath+'/templates/blocks/formulaire/etudes_travail_ladefense.html';
			me.revenus_infos = themePath+'/templates/blocks/formulaire/infos_revenus_ladefense.html';
			me.complement_infos = themePath+'/templates/blocks/formulaire/infos_complementaires.html';
			me.complement_infos_ladefense = themePath+'/templates/blocks/formulaire/infos_complementaires_ladefense.html';
			me.lettre_motivation = themePath+'/templates/blocks/formulaire/lettre_motivation.html';

		
				
		  me.parentsEnsemble=false;
				me.parentsSepares=false;
				me.examensPrealables=false;
				me.stageouCDD=false;
				me.stageouformationPro=false;
				me.pbsMedicaux=false;
				me.suiviMedical=false;
    me.contactData.subject='Nouvelle réservation';
				me.contactData.message=' ';
				$scope.isLadefense=false;
    //lg = rubedo.current.page.locale;
    //moment.locale(rubedo.current.page.locale);
				
				
				
				/* GESTION DES TYPES DE PUBLIC */
				 //surveiller si le type de formulaire est changé pour changer le template
    $scope.$watch("contactCtrl.contactData.statut", function(newValue, oldValue) {
								getPublic(newValue);
    });

    getPublic = function(public) {
        switch(public) {
            case 'etudiant':
                $scope.etudiant = true;
																$scope.jeunePro = false;
																if ($scope.isLadefense) {
																			me.contactData.template='/theme/foyers/templates/mails/reservationEtudiant_ladefense.html';
																} else {
																				me.contactData.template='/theme/foyers/templates/mails/reservationEtudiant.html';
																}
																console.log(me.contactData.template);
                break;
            case 'jeunePro':
                $scope.etudiant = false;
																$scope.jeunePro = true;
																if ($scope.isLadefense) {
																			me.contactData.template='/theme/foyers/templates/mails/reservationJeunePro_ladefense.html';
																} else {
																				me.contactData.template='/theme/foyers/templates/mails/reservationJeunePro.html';
																}
																console.log(me.contactData.template);
                break;
        }
    } 
  
    $scope.clearORPlaceholderHeight();
    me.dateDifference = function(start,end){
        console.log($filter('number')((end-start)/(3600*24*1000),0));
        return $filter('number')((end-start)/(3600*24*1000),0);
    }   

				me.contactData.parentsEnsemble=true;
				console.log("me.contactData.parentsEnsemble");
				console.log(me.contactData.parentsEnsemble);
				
				/* CALCUL DE L'AGE DU CANDIDAT*/
				var today = new Date();
				//me.contactData.birthdate=0;
    console.log(today.getTime());
    getAge = function (birthdate){ // avec dates passées par strtotime (ie timestamp)
        var date = new Date(me.contactData.birthdate);
								console.log("date de l'anniversaire");
								console.log(date);
								return (Math.trunc((today-date)/(1000*365*3600*24)));
    }
				$scope.$watch("contactCtrl.contactData.birthdate", function(newValue, oldValue) {
								console.log("me.contactData.birthdate");
								console.log(me.contactData.birthdate);
								me.contactData.age=getAge(newValue);
								console.log("me.contactData.age");
								console.log(me.contactData.age);
    });
				
				
				
				/* GESTION DES FRERES ET SOEURS */
    me.addFrereSoeur = function(frere_soeur){

        if (!$scope.contactCtrl.contactData.freres_soeurs) {
            $scope.contactCtrl.contactData.freres_soeurs=[];
        }
        $scope.contactCtrl.contactData.freres_soeurs.push(angular.copy(frere_soeur));
								console.log("$scope.contactCtrl.contactData.freres_soeurs");
								console.log($scope.contactCtrl.contactData.freres_soeurs);
    }
    // supprimer frere ou soeur
    me.removeFrereSoeur = function(index){
        $scope.contactCtrl.contactData.freres_soeurs.splice(index, 1);
    };
				
				
				
				
				
				
				
				/* SUBMIT FORMULAIRE */
				
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
		
																/* Gestion des parametres indéfinis */
																if (me.contactData.dateResultats === undefined) {
																				me.contactData.dateResultats =' ';
																}
																if (me.contactData.dateDebutContrat === undefined) {
																				me.contactData.dateDebutContrat =' ';
																}
																if (me.contactData.dateFinContrat === undefined) {
																				me.contactData.dateFinContrat =' ';
																}
																if (me.contactData.detailsPbsMedicaux === undefined) {
																				me.contactData.detailsPbsMedicaux ='rien à signaler';
																}
																if (me.contactData.detailsSuiviMedical === undefined) {
																				me.contactData.detailsSuiviMedical ='rien à signaler';
																}
																if (me.contactData.bourse === undefined) {
																				me.contactData.bourse = ' ';
																}
																if (me.contactData.nature === undefined) {
																				me.contactData.nature = ' ';
																}
																if (me.contactData.autresRevenus === undefined) {
																				me.contactData.autresRevenus = ' ';
																}
																if (me.parentsEnsemble) {
																				me.contactData.addressMere='idem';
																				me.contactData.cpMere='idem';
																				me.contactData.cityMere='idem';
																				me.contactData.tel2Mere='idem';
																}
																if (me.contactData.employeur === undefined) {
																				me.contactData.employeur = ' ';
																				me.contactData.adresseEmployeur = ' ';
																				me.contactData.telephoneEmployeur = ' ';
																				me.contactData.dateDebutContrat = ' ';
																				me.contactData.dateFinContrat = ' ';
																}
																if ($scope.etudiant && !me.stageouformationPro) {
																				me.contactData.salaire = ' ';
																				me.contactData.autresRevenus = ' ';
																				me.contactData.nature = ' ';
																				me.contactData.totalRessources = ' ';
																				me.contactData.revenuFiscal = ' ';
																}
            }
								}
				}
				
}]);
