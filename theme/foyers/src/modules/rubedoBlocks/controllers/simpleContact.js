angular.module("rubedoBlocks").lazy.controller("ContactBlockController",['$scope','$location','RubedoMailService','$rootScope','RubedoContentsService','InscriptionService','PaymentService','RubedoMediaService','RubedoSearchService','$timeout','$filter','RubedoPagesService',function($scope,$location,RubedoMailService,$rootScope,RubedoContentsService,InscriptionService,PaymentService,RubedoMediaService,RubedoSearchService,$timeout,$filter,RubedoPagesService) {
    var me = this;
    var themePath='/theme/'+window.rubedoConfig.siteTheme;
    me.form={};
    //templates
    me.infos_individuel = themePath+'/templates/blocks/formulaire/infos_individuel.html';
    me.couple = themePath+'/templates/blocks/formulaire/couple.html';
    me.questions = themePath+'/templates/blocks/formulaire/questions.html';
    me.questionDetail = themePath+'/templates/blocks/formulaire/questionDetail.html';
    me.infosFin = themePath+'/templates/blocks/formulaire/infosFin.html';
    me.enfants = themePath+'/templates/blocks/formulaire/enfants.html';
    me.paiment_complementaire= themePath+'/templates/blocks/formulaire/paiment_complementaire.html';
    me.content = angular.copy($scope.proposition);
				me.general_infos = themePath+'/templates/blocks/formulaire/infos_individuel.html';
				me.family_infos = themePath+'/templates/blocks/formulaire/parents.html';
				me.freres_soeurs_infos = themePath+'/templates/blocks/formulaire/freres_soeurs.html';
				me.travail_infos = themePath+'/templates/blocks/formulaire/etudes_travail.html';
				me.complement_infos = themePath+'/templates/blocks/formulaire/infos_complementaires.html';
				me.photo = themePath+'/templates/blocks/formulaire/photo.html';
				me.lettre_motivation = themePath+'/templates/blocks/formulaire/lettre_motivation.html';
				
				var options = {
            siteId: $scope.rubedo.current.site.id,
            pageId: $scope.rubedo.current.page.id
    };
    var config = $scope.blockConfig;
    me.contactData={ };
    me.contactError=null;
				me.showInscription = false;
    $scope.clearORPlaceholderHeight();
    me.submit=function(){
        me.contactError=null;
        var contactSnap=angular.copy(me.contactData);
        var payload={
            to:config.email,
            from:me.contactData.email,
            subject:contactSnap.subject
        };
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
				
				
				
				
				
//				//intégrer des questions supplémentaires
//				me.questionsComplementaires = themePath+'/templates/blocks/formulaire/questionsComplementairesFoyers.html';
//				me.questions=[];
//				    // récupérer les questions complémentaires
//    me.getQuestions = function() {
//        if(typeof $scope.contentDetailCtrl.content.fields.questions === 'string' || $scope.contentDetailCtrl.content.fields.questions instanceof String) {
//          RubedoContentsService.getContentById($scope.contentDetailCtrl.content.fields.questions, options).then(function(response){
//                if (response.data.success){
//                    var questionReponse= response.data.content;
//                    me.questions.push({"text":questionReponse.text, "fields":questionReponse.fields,"order":0}); me.isComplement = true;
//                }
//            });
//        }
//      else {
//        angular.forEach($scope.contentDetailCtrl.content.fields.questions, function(questionId, questionOrder){
//            RubedoContentsService.getContentById(questionId, options).then(function(response){
//                if (response.data.success){
//                    var questionReponse= response.data.content;
//                    me.questions.push({"text":questionReponse.text, "fields":questionReponse.fields,"order":questionOrder}); me.isComplement = true;
//                }
//            });
//            
//        });
//      }
//      
//    };
//				// s'il y a des questions complémentaires, les récupérer
//    if ($scope.contentDetailCtrl.content.fields.questions && ($scope.contentDetailCtrl.content.fields.questions).length>0) {
//        me.getQuestions();
//    }
				
				$scope.inscription={};
				me.parentsEnsemble=false;
				me.parentsSepares=false;
				me.examensPrealables=false;
				me.stageouCDD=false;
				me.pbsMedicaux=false;
				me.suiviMedical=false;
				
				    // ajouter freres et soeurs

    me.addFrereSoeur = function(frere_soeur){

        if (!$scope.inscription.freres_soeurs) {
            $scope.inscription.freres_soeurs=[];
        }
        $scope.inscription.freres_soeurs.push(angular.copy(frere_soeur));
    }
    // supprimer frere ou soeur
    me.removeFrereSoeur = function(index){
        $scope.inscription.freres_soeurs.splice(index, 1);
    };
				
				$scope.inscription.public_type=angular.copy($scope.contactCtrl.etudiant);
				console.log("$scope.inscription.public_type");
				console.log($scope.inscription.public_type);
    //surveiller si le type de formulaire est changé pour changer le template
    $scope.$watch("$scope.public", function(newValue, oldValue) {
        $scope.inscription.public_type=newValue;
								getPublic($scope.contactCtrl.etudiant);
								console.log("new value");
									console.log($scope.inscription.public_type);
    });

    
    getPublic = function(public) {
        switch(public) {
            case 'true':
                $scope.etudiant = true;
																$scope.jeunePro = false;
                break;
            case 'false':
                $scope.etudiant = false;
																$scope.jeunePro = true;
                break;
        }
    }
    getPublic($scope.etudiant);
				console.log("$scope.etudiant");
				console.log($scope.etudiant);
    //$scope.inscription={};
    //$scope.inscription.optionsPayantes={};
 
   
    
    
    
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
																if( $scope.inscription.email != $scope.inscription.email_verif){
                    $scope.mailError = true;me.currentStage=1;
                } else {
																				$scope.mailError = false;
																				me.toggleStage(2);
																} 
																//me.getContentById(me.propositionId);
            }
            else if (step==2) {														
																if( $scope.inscription.emailPere != $scope.inscription.emailPere_verif){
                    $scope.mailError2 = true;me.currentStage=2;
                }
                else if ($scope.inscription.emailMere != $scope.inscription.emailMere_verif) {
                    $scope.mailError2 = false;
																				$scope.mailError3 = true;
                    me.currentStage=2;
                }
																else {
																				$scope.mailError2 = false;
                    $scope.mailError2 = false;
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
//												else if (step==6) {
//
//												// validations préliminaires
//            $scope.processForm=true;
//            
//            $scope.inscription.proposition=  propositionId;
//            $scope.inscription.propositionTitre=  propositionTitle;
//            if(me.content.fields.dateDebut && me.content.fields.dateDebut!='') $scope.inscription.propositionDate = propositionDate;
//            $scope.inscription.dateDebut = me.content.fields.dateDebut;
//            $scope.inscription.propositionLieu = me.content.fields.positionName;
//            $scope.inscription.propositionUrl = me.content.canonicalUrl;
//            $scope.inscription.shortName = propositionTitle.replace(/[ -]/g, "_");
//            //$scope.inscription.accompte = me.content.fields.accompte ?me.content.fields.accompte : 0;
//            $scope.inscription.contact = me.content.fields.contact;
//            if (me.content.fields.mails_secretariat && me.content.fields.mails_secretariat.length>0) {
//                $scope.inscription.mails_secretariat = me.content.fields.mails_secretariat;
//            }
//            //if(me.content.fields.codeOnesime) $scope.inscription.codeOnesime = me.content.fields.codeOnesime;
//            $scope.inscription.mailInscription = me.content.fields.mailInscription;
//            $scope.inscription.mailInscriptionService = me.content.fields.mailInscriptionService;
//            
//            $scope.inscription.personneConnue = me.form.personneConnue;
//            $scope.inscription.entretien = me.form.entretien;
//            $scope.inscription.motivation = me.form.motivation;
//            ///*enfant*/
//            //if($scope.inscription.enfant && $scope.inscription.enfant !={} && $scope.inscription.enfant.prenom && $scope.inscription.enfant.prenom!='') {
//            //  me.addChild($scope.inscription.enfant);
//            //}
//
//            if($scope.inscription.paiement_maintenant == 'rien'){$scope.inscription.montantAPayerMaintenant=0}
//            else if($scope.inscription.paiement_maintenant == 'accompte'){$scope.inscription.montantAPayerMaintenant=me.content.fields.accompte}
//												else if($scope.inscription.paiement_maintenant == 'accompte2'){$scope.inscription.montantAPayerMaintenant=me.content.fields.accompte2}
//            else if($scope.inscription.paiement_maintenant == 'totalite'){$scope.inscription.montantAPayerMaintenant=$scope.inscription.montantTotalAPayer}
//            $scope.inscription.isPayment = me.isPaiement;
//            /*STATUS DE L'INSCRIPTION*/
//            switch(me.content.fields.inscriptionState.inscriptionState) {
//                case "attente":
//                    $scope.inscription.statut = "liste_attente";
//                    break;
//                case 'preinscription':
//                    $scope.inscription.statut = "preinscrit";
//                    break;
//                default:
//                    if (me.isPaiement) {
//                        /*pas de paiement maintenant*/
//                        if ($scope.inscription.paiement_maintenant =="rien") {
//                            $scope.inscription.statut = 'inscrit_sans_accompte';
//                        }
//                        else{
//                            $scope.inscription.statut = "attente_paiement_"+$scope.inscription.modePaiement;
//                        }
//                        $scope.inscription.montantAPayerMaintenantAvecMonnaie = ($scope.inscription.montantAPayerMaintenant).toString() + me.paymentmeans.nativePMConfig.monnaie;
//                        if($scope.inscription.montantTotalAPayer && $scope.inscription.montantTotalAPayer>0) $scope.inscription.montantTotalAPayerAvecMonnaie=($scope.inscription.montantTotalAPayer).toString() + me.paymentmeans.nativePMConfig.monnaie;
//                        if($scope.inscription.accompte>0) $scope.inscription.accompteAvecMonnaie=($scope.inscription.accompte).toString() + me.paymentmeans.nativePMConfig.monnaie;
//                    }
//                    
//            }
//            InscriptionService.inscrire($scope.inscription, $scope.rubedo.current.page.workspace).then(function(response){
//                $scope.message="";
//                if (response.data.success) {
//                    // si paiement par Paybox
//                    if ($scope.inscription.modePaiement=='carte' || $scope.inscription.modePaiement=='dotpay' || $scope.inscription.modePaiement=='paypal') { 
//                        var payload = {
//                            nom:$scope.inscription.nom,
//                            prenom: $scope.inscription.surname,
//                            email:$scope.inscription.email,
//                            montant:$scope.inscription.montantAPayerMaintenant,
//                            proposition:propositionTitle,
//                            idInscription: response.data.id,
//                            paymentConfID:response.data.result.paymentConfID,
//																												paymentMeans:$scope.inscription.modePaiement,
//																												paymentType:'paf'
//                        };
//                        /*si ados, le mail indiqué pour le payement est celui du parent*/
//                        if($scope.inscription.public_type == 'adolescent' && $scope.inscription.emailPers2 && $scope.inscription.emailPers2!=''){
//                            payload.email = $scope.inscription.emailPers2;
//                        }
//                        if (me.content.fields.lieuCommunautaire) {
//                            payload.placeID=me.content.fields.lieuCommunautaire;
//                        }
//                        if(window.ga) {
//                            window.ga('send', 'event', 'inscription', 'payement carte', 'inscriptions', $scope.inscription.montantAPayerMaintenant);
//                        }
//                        if ($scope.inscription.modePaiement=='dotpay') {
//                            payload.infos=$scope.inscription;
//                        }
//                        PaymentService.payment(payload).then(function(response){
//                            if (response.data.success) {
//                                $scope.parametres = response.data.parametres;
//                                /*délai pour laisser le formulaire se remplir*/
//                                $timeout(function() {
//                                    $scope.processForm=false;
//                                    document.getElementById('payment').submit();
//                                }, 100);
//                            }
//                            else {
//                                $scope.processForm=false;
//                                $scope.finInscription=true;  
//                                $scope.inscription={};
//                                $scope.message+="Il y a eu une erreur dans lors de l'enregistrement de votre paiement. Merci de réessayer ou de contacter le secrétariat.";
//                            }
//                            
//                        });
//                        
//                    }
//                    // pas de paiement par carte
//                    else {
//                        if(window.ga) {
//                            window.ga('send', 'event', 'inscription', 'pas de payment', 'inscriptions', $scope.inscription.montantAPayerMaintenant);
//                        }
//                        $scope.processForm=false;
//                        $scope.finInscription=true; 
//                        $scope.inscription={};
//                        $scope.message += $scope.rubedo.translate("Block.Inscription.Success","Votre inscription a bien été prise en compte. Merci et à bientôt !");
//                    }
//                    
//                    
//                }
//                else {
//                    if(window.ga) {
//                        window.ga('send', 'event', 'inscription', 'erreur');
//                    }
//                   
//                    $scope.processForm=false;
//                    $scope.finInscription=true; 
//                    $scope.message +="Il y a eu une erreur lors de la prise en compte de votre inscription. Merci de réessayer plus tard ou de contacter le secrétariat.";
//                }
//																
//            })
//            }
												
        }
				}



    
}]);

