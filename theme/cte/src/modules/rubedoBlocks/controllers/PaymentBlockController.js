angular.module("rubedoBlocks").lazy.controller("PaymentBlockController",['$scope','RubedoContentsService','RubedoPaymentMeansService','RubedoSearchService',function($scope,RubedoContentsService,RubedoPaymentMeansService,RubedoSearchService){
    var me = this;
    me.contentList=[];
    var config=$scope.blockConfig;
    var pageId=$scope.rubedo.current.page.id;
    var siteId=$scope.rubedo.current.site.id;
    var alreadyPersist = false;
   
    var options = {
        start: 0,
        limit: 50,
        'fields[]' : ["text","summary"]
    };
    
    me.titleOnly = config.showOnlyTitle;
    me.getContents = function (queryId, pageId, siteId, options, add){
        RubedoContentsService.getContents(queryId,pageId,siteId, options).then(function(response){
            if (response.data.success){
                me.count = response.data.count;
                me.queryType=response.data.queryType;
                me.usedContentTypes=response.data.usedContentTypes;
                me.contents = response.data.contents;


            }
        });
    };
				me.getContentById = function (contentId){
        var options = {
            siteId: $scope.rubedo.current.site.id,
            pageId: $scope.rubedo.current.page.id
        };
        RubedoContentsService.getContentById(contentId, options).then(
            function(response){
                if(response.data.success){
                    me.proposition=response.data.content;
                    console.log(me.proposition);
                }
            }
        );
    };
    

    if(config.query){
        me.getContents(config.query, pageId, siteId, options, false);
    }
				/*Get infos de payement générales*/
				RubedoPaymentMeansService.getPaymentMeansPaf().then(
								function(response){
												if(response.data.success){
																me.paymentmeans = response.data.paymentMeans;
																console.log(me.paymentmeans);
												}
								}
				);
    //récupérer l'inscription par email
    me.getInscription = function(email){
        var options = {
            start: 0,
            limit: 100,
            constrainToSite: false,
            orderby: 'lastUpdateTime',
            orderbyDirection:'desc',
            //query:'"'+email+'"',
            type:"561627c945205e41208b4581",
            taxonomies:{
                "proposition":[me.proposition.id],
                "email":[email]
            },
            pageId: $scope.rubedo.current.page.id,
            siteId: $scope.rubedo.current.site.id           
        };
        RubedoSearchService.searchByQuery(options).then(function(response){
            if(response.data.success){
                me.inscriptionsCount = response.data.count;
                me.showInscriptionResult = true;
                if (response.data.count>0) {
                    RubedoContentsService.getContentById(response.data.results.data[0].id).then(
                        function(response){
                            if(response.data.success){
                                me.lastInscription = response.data.content;
																																me.toggleStage(3);
																																console.log(me.lastInscription);
                            }
                        }
                    );
                }
																else {
																				me.noInscription = true;
																}
            }
        });
    }
				
				
				
				$scope.inscription = {};
				me.currentStage=1;
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
                me.toggleStage(2);
																me.getContentById(me.propositionId);
            }
            else if (step==2) {
																me.getInscription($scope.inscription.email);                
            }
            else if (step==3) {
                me.toggleStage(4);
            }
        }
        if (valide && step==4) {
            // validations préliminaires
            $scope.processForm=true;

												 var payload = {
																nom:$scope.inscription.nom,
																prenom: $scope.inscription.surname,
																email:$scope.inscription.email,
																montant:$scope.inscription.montantAPayerMaintenant,
																proposition:me.proposition.text,
																idInscription: response.data.id,
																paymentConfID:response.data.result.paymentConfID,
																paymentMeans:$scope.inscription.modePaiement,
																paymentType:'paf'
												};
												/*si ados, le mail indiqué pour le payement est celui du parent*/
												if($scope.inscription.public_type == 'adolescent' && $scope.inscription.emailPers2 && $scope.inscription.emailPers2!=''){
																payload.email = $scope.inscription.emailPers2;
												}
												if (me.content.fields.lieuCommunautaire) {
																payload.placeID=me.content.fields.lieuCommunautaire;
												}
												if(window.ga) {
																window.ga('send', 'event', 'inscription', 'payement carte', 'inscriptions', $scope.inscription.montantAPayerMaintenant);
												}
												if ($scope.inscription.modePaiement=='dotpay') {
																payload.infos=$scope.inscription;
												}
												PaymentService.payment(payload).then(function(response){
																if (response.data.success) {
																				$scope.parametres = response.data.parametres;
																				/*délai pour laisser le formulaire se remplir*/
																				$timeout(function() {
																								$scope.processForm=false;
																								document.getElementById('payment').submit();
																				}, 100);
																}
																else {
																				$scope.processForm=false;
																				$scope.finInscription=true;  
																				$scope.inscription={};
																				$scope.message+="Il y a eu une erreur dans lors de l'enregistrement de votre paiement. Merci de réessayer ou de contacter le secrétariat.";
																}
																
												});
												
												
												
												
												
												
												
												
												
												
												
												
												
            $scope.inscription.proposition=  propositionId;
            $scope.inscription.propositionTitre=  propositionTitle;
            if(me.content.fields.dateDebut && me.content.fields.dateDebut!='') $scope.inscription.propositionDate = propositionDate;
            $scope.inscription.dateDebut = me.content.fields.dateDebut;
            $scope.inscription.propositionLieu = me.content.fields.positionName;
            $scope.inscription.propositionUrl = me.content.canonicalUrl;
            $scope.inscription.shortName = propositionTitle.replace(/[ -]/g, "_");
            $scope.inscription.accompte = me.content.fields.accompte ?me.content.fields.accompte : 0;
            $scope.inscription.contact = me.content.fields.contact;
            if (me.content.fields.mails_secretariat && me.content.fields.mails_secretariat.length>0) {
                $scope.inscription.mails_secretariat = me.content.fields.mails_secretariat;
            }
            if(me.content.fields.codeOnesime) $scope.inscription.codeOnesime = me.content.fields.codeOnesime;
            $scope.inscription.mailInscription = me.content.fields.mailInscription;
            $scope.inscription.mailInscriptionService = me.content.fields.mailInscriptionService;
            
            $scope.inscription.personneConnue = me.form.personneConnue;
            $scope.inscription.entretien = me.form.entretien;
            $scope.inscription.motivation = me.form.motivation;
            /*enfant*/
            if($scope.inscription.enfant && $scope.inscription.enfant !={} && $scope.inscription.enfant.prenom && $scope.inscription.enfant.prenom!='') {
              me.addChild($scope.inscription.enfant);
            }

            if($scope.inscription.paiement_maintenant == 'rien'){$scope.inscription.montantAPayerMaintenant=0}
            else if($scope.inscription.paiement_maintenant == 'accompte'){$scope.inscription.montantAPayerMaintenant=me.content.fields.accompte}
            else if($scope.inscription.paiement_maintenant == 'totalite'){$scope.inscription.montantAPayerMaintenant=$scope.inscription.montantTotalAPayer};
            $scope.inscription.isPayment = me.isPaiement;
            /*STATUS DE L'INSCRIPTION*/
            switch(me.content.fields.inscriptionState.inscriptionState) {
                case "attente":
                    $scope.inscription.statut = "liste_attente";
                    break;
                case 'preinscription':
                    $scope.inscription.statut = "preinscrit";
                    break;
                default:
                    if (me.isPaiement) {
                        /*pas de paiement maintenant*/
                        if ($scope.inscription.paiement_maintenant =="rien") {
                            $scope.inscription.statut = 'inscrit_sans_accompte';
                        }
                        else{
                            $scope.inscription.statut = "attente_paiement_"+$scope.inscription.modePaiement;
                        }
                        $scope.inscription.montantAPayerMaintenantAvecMonnaie = ($scope.inscription.montantAPayerMaintenant).toString() + me.paymentmeans.nativePMConfig.monnaie;
                        if($scope.inscription.montantTotalAPayer && $scope.inscription.montantTotalAPayer>0) $scope.inscription.montantTotalAPayerAvecMonnaie=($scope.inscription.montantTotalAPayer).toString() + me.paymentmeans.nativePMConfig.monnaie;
                        if($scope.inscription.accompte>0) $scope.inscription.accompteAvecMonnaie=($scope.inscription.accompte).toString() + me.paymentmeans.nativePMConfig.monnaie;
                    }
                    
            }
            InscriptionService.inscrire($scope.inscription, $scope.rubedo.current.page.workspace).then(function(response){
                $scope.message="";
                if (response.data.success) {
                    // si paiement par Paybox
                    if ($scope.inscription.modePaiement=='carte' || $scope.inscription.modePaiement=='dotpay' || $scope.inscription.modePaiement=='paypal') { 
                        var payload = {
                            nom:$scope.inscription.nom,
                            prenom: $scope.inscription.surname,
                            email:$scope.inscription.email,
                            montant:$scope.inscription.montantAPayerMaintenant,
                            proposition:propositionTitle,
                            idInscription: response.data.id,
                            paymentConfID:response.data.result.paymentConfID,
																												paymentMeans:$scope.inscription.modePaiement,
																												paymentType:'paf'
                        };
                        /*si ados, le mail indiqué pour le payement est celui du parent*/
                        if($scope.inscription.public_type == 'adolescent' && $scope.inscription.emailPers2 && $scope.inscription.emailPers2!=''){
                            payload.email = $scope.inscription.emailPers2;
                        }
                        if (me.content.fields.lieuCommunautaire) {
                            payload.placeID=me.content.fields.lieuCommunautaire;
                        }
                        if(window.ga) {
                            window.ga('send', 'event', 'inscription', 'payement carte', 'inscriptions', $scope.inscription.montantAPayerMaintenant);
                        }
                        if ($scope.inscription.modePaiement=='dotpay') {
                            payload.infos=$scope.inscription;
                        }
                        PaymentService.payment(payload).then(function(response){
                            if (response.data.success) {
                                $scope.parametres = response.data.parametres;
                                /*délai pour laisser le formulaire se remplir*/
                                $timeout(function() {
                                    $scope.processForm=false;
                                    document.getElementById('payment').submit();
                                }, 100);
                            }
                            else {
                                $scope.processForm=false;
                                $scope.finInscription=true;  
                                $scope.inscription={};
                                $scope.message+="Il y a eu une erreur dans lors de l'enregistrement de votre paiement. Merci de réessayer ou de contacter le secrétariat.";
                            }
                            
                        });
                        
                    }
                    // pas de paiement par carte
                    else {
                        if(window.ga) {
                            window.ga('send', 'event', 'inscription', 'pas de payment', 'inscriptions', $scope.inscription.montantAPayerMaintenant);
                        }
                        $scope.processForm=false;
                        $scope.finInscription=true; 
                        $scope.inscription={};
                        $scope.message += $scope.rubedo.translate("Block.Inscription.Succes","Votre inscription a bien été prise en compte. Merci et à bientôt !");
                    }
                    
                    
                }
                else {
                    if(window.ga) {
                        window.ga('send', 'event', 'inscription', 'erreur');
                    }
                   
                    $scope.processForm=false;
                    $scope.finInscription=true; 
                    $scope.message +="Il y a eu une erreur lors de la prise en compte de votre inscription. Merci de réessayer plus tard ou de contacter le secrétariat.";
                }
            })
            
                
                
                
        }
    }
    
    
    
}]);

