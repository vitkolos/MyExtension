angular.module("rubedoBlocks").lazy.controller("PaymentBlockController",['$scope','RubedoContentsService','RubedoPaymentMeansService','RubedoSearchService','PaymentService','$timeout',
																																																																									function($scope,RubedoContentsService,RubedoPaymentMeansService,RubedoSearchService,PaymentService,$timeout){
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
                    me.content = angular.copy(me.proposition);
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
																$scope.inscription.modePaiement = 'carte';
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
                montant:$scope.inscription.montantTotalAPayer,
                proposition:me.proposition.text,
                idInscription: me.lastInscription.text,
                paymentConfID:config.contentId,
                paymentMeans:$scope.inscription.modePaiement,
                paymentType:'paf'
            };
            console.log("me.content");
            console.log(me.content);
            if (me.proposition.fields.lieuCommunautaire) {
                payload.placeID=me.content.fields.lieuCommunautaire;
                //payload.placeID=me.proposition.fields.lieuCommunautaire;
            }
            if(window.ga) {
                window.ga('send', 'event', 'inscription', 'payement carte', 'inscriptions', $scope.inscription.montantTotalAPayer);
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
                            
            })
            .catch(function(error){
                $scope.processForm=false;
                $scope.finInscription=true;
                $scope.message+="Il y a eu une erreur dans lors de l'enregistrement de votre paiement. Merci de contacter le secrétariat - vous pourrez indiquer la raison de l'erreur : ";
                $scope.errorMessage =error.data.message;
            });
												
	  
                
                
        }
    }
    
    
    
}]);

