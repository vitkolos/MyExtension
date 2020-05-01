angular.module("rubedoBlocks").lazy.controller("DonationController",['$scope','RubedoUserTypesService','RubedoUsersService','RubedoAuthService','RubedoPaymentMeansService','RubedoContentsService','DonationService','$filter','$timeout','PaymentService',
                                                                     function($scope,RubedoUserTypesService,RubedoUsersService,RubedoAuthService,RubedoPaymentMeansService,RubedoContentsService,DonationService,$filter,$timeout,PaymentService) {
    var me = this;
    var themePath='/theme/'+window.rubedoConfig.siteTheme;
    //templates
    me.donationTemplate = themePath+'/templates/blocks/donation.html';
    me.questionDetail = themePath+'/templates/blocks/formulaire/questionDetailDons.html';
    me.currentStage=1;
    me.userType="56e6edeac445eccc038b5b8e"; // type d'utilisateurs = donateurs
    me.civilite = {
        monsieur : $scope.rubedo.translate("Block.Inscription.Civilite.Monsieur","Monsieur"),
        madame : $scope.rubedo.translate("Block.Inscription.Civilite.Madame","Madame"),
        mademoiselle : $scope.rubedo.translate("Block.Inscription.Civilite.Mademoiselle","Mademoiselle"),
        pere:  $scope.rubedo.translate("Block.Inscription.Civilite.Pere","Père"),
        soeur: $scope.rubedo.translate("Block.Inscription.Civilite.Soeur","Soeur"),
        frere: $scope.rubedo.translate("Block.Inscription.Civilite.Frere","Frère") 
    };
    me.questions=[];
    $scope.don= {};
    $scope.don.user={};
    // préremplir les champs si l'utilisateur est connecté
    if ($scope.rubedo.current.user) {
        $scope.don.user=angular.copy($scope.rubedo.current.user.fields);
        $scope.don.user.email = $scope.rubedo.current.user.email;
        if ($scope.rubedo.current.user.fields.birthdate) {
            $scope.don.user.birthdate=new Date($scope.rubedo.current.user.fields.birthdate * 1000).toISOString();
            $scope.don.birthdateF = $filter('date')( $scope.don.user.birthdate,'dd/MM/yyyy');
        }
        
    }    
    $scope.don.projet = $scope.contentDetailCtrl.content.fields.text;
    $scope.don.projetId = $scope.contentDetailCtrl.content.id;
    me.toggleStage = function(newStage){
       angular.element("#inscriptionStage"+me.currentStage).collapse("hide");
       angular.element("#inscriptionStage"+newStage).collapse("show");
       me.currentStage = newStage;
    }

    // =======================================================
    //                  RGPD
    // =======================================================
    // les différentes politiques de confidentialité par langue
    // (ce sont les ids des medias PDF correspondants)
    me.rgpd_links = {
        'fr': '5cada77739658847463d67dc',
        'en': '5ddfdcc3396588a91b1321e1',
    }
    // on met le lien vers la bonne politique RGPD
    $scope.parameters = {}
    $scope.parameters.rgpd_media_id = me.rgpd_links["en"];
    if ($scope.contentDetailCtrl.content && $scope.contentDetailCtrl.content.locale && me.rgpd_links[$scope.contentDetailCtrl.content.locale]) $scope.parameters.rgpd_media_id = me.rgpd_links[$scope.contentDetailCtrl.content.locale];
    // =======================================================


    
    RubedoPaymentMeansService.getPaymentMeansDons().then(
        function(response){
            if(response.data.success){
                me.paymentmeans = response.data.paymentMeans;
                var options = {
                    siteId: $scope.rubedo.current.site.id,
                    pageId: $scope.rubedo.current.page.id
                };
                /*définir la monnaie du site*/
                $scope.don.codeMonnaie = me.paymentmeans.nativePMConfig.codeMonnaie;
                $scope.don.codeMonnaieAlpha = me.paymentmeans.nativePMConfig.codeMonnaieAlpha;
                $scope.don.monnaie = me.paymentmeans.nativePMConfig.monnaie;
                $scope.isMonnaieBefore = me.paymentmeans.nativePMConfig.monnaie_before;
                if(!$scope.don.user.country) $scope.don.user.country = $filter('uppercase')(me.paymentmeans.displayName);
 
                /*get contact national défini dans la config de payement*/
                RubedoContentsService.getContentById(response.data.paymentMeans.nativePMConfig.contactDonsId, options).then(
                    function(response){
                        if(response.data.success){
                            $scope.contentDetailCtrl.contactNational=response.data.content;
                            $scope.contentDetailCtrl.contactNationalPhoto = response.data.content.fields.photo.imageCode;
                            $scope.don.contactNational = response.data.content.fields;
                            $scope.don.contactNational.photo="";
                        }
                    }
                );
                me.fiscalites = {};
                me.account = {};
                me.fiscalitesCount=0;
                /*get fiscalités*/
                if($scope.contentDetailCtrl.content.fields[me.paymentmeans.nativePMConfig.fiscalite] && $scope.contentDetailCtrl.content.fields[me.paymentmeans.nativePMConfig.fiscalite].length>0){
                    angular.forEach($scope.contentDetailCtrl.content.fields[me.paymentmeans.nativePMConfig.fiscalite], function(fiscalite){
                        RubedoContentsService.getContentById(fiscalite, options).then(
                            function (response) {
                                if(response.data.success){
                                    me.fiscalites[response.data.content.text] = {
                                        "label" : response.data.content.text,
                                        "fields":response.data.content.fields,
                                        "id":response.data.content.id
                                    };
                                    me.account = response.data.content.fields;
                                    $scope.don.conditionId = response.data.content.id;
                                    me.fiscalitesCount++;
                                }
                            }
                        );
                    });
                }
                else {
                    RubedoContentsService.getContentById(me.paymentmeans.nativePMConfig.conditionId, options).then(
                        function (response) {
                            if(response.data.success){
                                me.fiscalites[response.data.content.text] = {
                                    "label" : response.data.content.text,
                                    "fields":response.data.content.fields,
                                    "id":response.data.content.id
                                };
                                me.account = response.data.content.fields;
                                $scope.don.conditionId = response.data.content.id;
                                me.fiscalitesCount++;
                                console.log(me.fiscalites);
                            }
                        }
                    );
                }
                
            }
               
        }
    );                
    me.setCurrentStage = function(step, valide) {
        if(valide){
            if (step==2) {
                /*déterminer les conditions de payement*/
               updatePaymentStatus();
            }
            if (step==3) {
                if (me.questions.length>0) {
                    
                }
                //go directly to payment
                else step++;
            }
            /*
            if (step==3) {
                    me.stage2Error=null;
                    if (!$scope.rubedo.current.user){
                        me.createUser();
                    } else {
                        me.persistUserChanges(me.stage2Error);
                    }

            }
            else */
            
            me.toggleStage(step);
        }  
    };
    var options = {
            siteId: $scope.rubedo.current.site.id,
            pageId: $scope.rubedo.current.page.id
    };    
        // récupérer les questions complémentaires
    me.getQuestions = function() {
        if(typeof $scope.contentDetailCtrl.content.fields.questions === 'string' || $scope.contentDetailCtrl.content.fields.questions instanceof String) {
          RubedoContentsService.getContentById($scope.contentDetailCtrl.content.fields.questions, options).then(function(response){
                if (response.data.success){
                    var questionReponse= response.data.content;
                    me.questions.push({"text":questionReponse.text, "fields":questionReponse.fields,"order":0}); me.isComplement = true;
                }
            });
        }
      else {
        angular.forEach($scope.contentDetailCtrl.content.fields.questions, function(questionId, questionOrder){
            RubedoContentsService.getContentById(questionId, options).then(function(response){
                if (response.data.success){
                    var questionReponse= response.data.content;
                    me.questions.push({"text":questionReponse.text, "fields":questionReponse.fields,"order":questionOrder}); me.isComplement = true;
                }
            });
            
        });
      }
      
    };

    
    
    //validation du don et inscription dans la base de données
    me.submit = function(isValide){
        if (isValide) {
            $scope.processForm=true;
            $scope.don.etat ="attente_paiement_"+$scope.don.modePaiement;
            $scope.don.montantAvecFrequence ="";
            if ($scope.don.montant =='autre') {
                $scope.don.montantAvecFrequence += $scope.don.montant_autre + " " + $scope.don.monnaie;
            }
            else {
                $scope.don.montantAvecFrequence += $scope.don.montant + " " + $scope.don.monnaie;
                switch($scope.don.montant) {
                    case $scope.contentDetailCtrl.content.fields.montant_1 : $scope.don.montant_text = $scope.contentDetailCtrl.content.fields.desc_1 ?  $scope.contentDetailCtrl.content.fields.desc_1:""; break;
                    case $scope.contentDetailCtrl.content.fields.montant_2 : $scope.don.montant_text = $scope.contentDetailCtrl.content.fields.desc_2 ?  $scope.contentDetailCtrl.content.fields.desc_2:""; break;
                    case $scope.contentDetailCtrl.content.fields.montant_3 : $scope.don.montant_text = $scope.contentDetailCtrl.content.fields.desc_3 ?  $scope.contentDetailCtrl.content.fields.desc_3:""; break;
                    case $scope.contentDetailCtrl.content.fields.montant_4 : $scope.don.montant_text = $scope.contentDetailCtrl.content.fields.desc_4 ?  $scope.contentDetailCtrl.content.fields.desc_4:""; break;
                }
            }
            if ($scope.don.mensuel) {
                $scope.don.montantAvecFrequence += " "+$scope.rubedo.translate("Block.Dons.Mois","par mois");
                $scope.don.frequence="mensuel";
            }
            else if ($scope.don.trimestriel) {
                $scope.don.montantAvecFrequence += " "+$scope.rubedo.translate("Block.Dons.Trimestre","par trimestre");
                $scope.don.frequence="trimestriel";
            }
            /*déterminer la config de dons choisie*/
            if (me.fiscalitesCount>1) {
                me.account = me.fiscalites[$scope.don.condition].fields;
                $scope.don.conditionId = me.fiscalites[$scope.don.condition].id;
            }
            if($scope.contentDetailCtrl.content.fields.codeAna) $scope.don.codeAna = $scope.contentDetailCtrl.content.fields.codeAna;

            // on ajoute la date d'acceptation de la politique de confidentialité rgpd
            $scope.don.date_rgpd_accepted = Math.round(Date.now()/1000);
            
            DonationService.donate($scope.don, me.account).then(function(response){
                if (response.data.success) {

                    if (response.data.instructions.whatToDo == "displayRichText") {
                        $scope.message = $scope.rubedo.translate('Block.Dons.Success','Votre don a bien été enregistré. Votre numéro de suivi est : %donationId%. Un récapitulatif vous sera envoyé par mail.',['%donationId%'],[response.data.instructions.id]);
                        $scope.finInscription = true;
                        $scope.processForm = false;
                        if(window.ga) {
                            window.ga('send', 'event', 'donation', 'payement autre moyen', 'donations', $scope.don.montant);
                        }
                    }
                    else if (response.data.instructions.whatToDo=="proceedToPayment") {
                      if(window.ga) {
                            window.ga('send', 'event', 'donation', 'payement carte', 'donations', $scope.don.montant);
                        }
                        var payload = {
                            nom:$scope.don.user.nom,
                            prenom: $scope.don.user.surname,
                            email:$scope.don.user.email,
                            montant:$scope.don.montant=='autre'?$scope.don.montant_autre:$scope.don.montant,
                            proposition:$scope.don.projet,
                            idInscription: response.data.instructions.id,
                            paymentType: 'dons',
                            paymentMeans:$scope.don.modePaiement,
                            placeId:$scope.contentDetailCtrl.content.fields.codeAna,
                            paymentConfID:response.data.instructions.paymentConfID,
                            codeMonnaieAlpha:$scope.don.codeMonnaieAlpha
                        };            
                        PaymentService.payment(payload).then(function(response){
                            if (response.data.success) {
                                if($scope.don.modePaiement == 'carte') {
                                    $scope.parametres = response.data.parametres;
                                    /*délai pour laisser le formulaire se remplir*/
                                    $timeout(function() {
                                        $scope.processForm=false;
                                        document.getElementById('payment').submit();
                                    }, 100);
                                }
                                else if($scope.don.modePaiement == 'paypal'){
                                    window.location.href= response.data.parametres;
                                }
                                
                            }
                            else {
                                $scope.processForm=false;
                                $scope.finInscription=true;  
                                $scope.inscription={};
                                $scope.message+="Il y a eu une erreur dans lors de l'enregistrement de votre paiement. Merci de réessayer ou de contacter le secrétariat.";
                            }
                            
                        })
                        .catch(function(e) {
                            console.log('Error: ', e);
                            $scope.processForm=false;
                            $scope.finInscription=true;  
                            $scope.inscription={};
                            $scope.message+="Il y a eu une erreur dans lors de l'enregistrement de votre paiement. Merci de réessayer ou de contacter le secrétariat.";

                            throw e;
                        });
                    }
                }
            })
        }
    };
    
    /*vérifier les conditions possibles de payement*/
    me.isCarte = false;
    me.isPaypal = false;
    me.isPrelevement = false;
    updatePaymentStatus = function(){
        if (me.fiscalitesCount>0) {
            if (me.fiscalitesCount>1) {
                me.isCarte = me.fiscalites[$scope.don.condition].fields.isCarte;
                me.isPaypal = me.fiscalites[$scope.don.condition].fields.isPaypal;
                me.isPrelevement = me.fiscalites[$scope.don.condition].fields.isPrelevement;
            }
            else {
                me.isCarte = me.account.isCarte;
                me.isPaypal = me.account.isPaypal;
                me.isPrelevement = me.account.isPrelevement;
            }
        }
            /*déterminer la config de dons choisie*/
        
        
    }
    
    me.parseUserType=function(userType){
        me.userType=userType;
        $scope.fieldIdPrefix="checkout"+"_"+me.userType.type;
        if (!$scope.rubedo.current.user){
            me.userType.fields.unshift({
                cType:"textfield",
                config:{
                    name:"confirmPassword",
                    fieldLabel:$scope.rubedo.translate("Blocks.SignUp.label.confirmPassword"),
                    allowBlank:false,
                    vtype:"password"
                }
            });
            me.userType.fields.unshift({
                cType:"textfield",
                config:{
                    name:"password",
                    fieldLabel:$scope.rubedo.translate("Blocks.SignUp.label.password"),
                    allowBlank:false,
                    vtype:"password"
                }
            });
        }
        me.userType.fields.unshift({
            cType:"textfield",
            config:{
                name:"email",
                fieldLabel:$scope.rubedo.translate("Label.Email"),
                allowBlank:false,
                vtype:"email"
            }
        });
        me.userType.fields.unshift({
            cType:"textfield",
            config:{
                name:"name",
                fieldLabel:$scope.rubedo.translate("Blocks.SignUp.label.name"),
                allowBlank:false
            }
        });
        me.inputFields=me.userType.fields;
    };
    me.initializeCheckout=function(){
        $scope.fieldIdPrefix="donation";

        $scope.fieldInputMode=true;
        if (!$scope.rubedo.current.user){
            if (me.userType){
                RubedoUserTypesService.getUserTypeById(me.userType).then(
                    function(response){
                        if (response.data.success){
                            me.parseUserType(response.data.userType);
                        }
                    }
                );
            }
        } else {
            RubedoUsersService.getUserById($scope.rubedo.current.user.id).then(
                function(response){
                    if (response.data.success){
                        me.currentUser=response.data.user;
                        var existingData=angular.copy(me.currentUser.fields);
                        $scope.don.user = angular.copy(me.currentUser.fields);
                        //me.parseUserType(me.currentUser.type);
                    }
                }
            );
        }
    };
    me.createUser=function(){
        if ($scope.don.user.confirmPassword!=$scope.don.user.password){
            me.stage2Error="Passwords do not match.";
            return;
        }
        var newUserFields=angular.copy($scope.don.user);
        delete (newUserFields.confirmPassword);
        newUserFields.login=newUserFields.email;

        RubedoUsersService.createUser(newUserFields,"56e6edeac445eccc038b5b8e").then(
            function(response){
                if (response.data.success){
                    RubedoAuthService.generateToken({login:newUserFields.login,password:newUserFields.password},me.rememberMe).then(
                        function(authResponse){
                            me.toggleStage(3);
                        }
                    );
                }
            },
            function(response){
                me.stage2Error=response.data.message;
            }
        );
    };    
    me.persistUserChanges=function(errorHolder,refreshShippers){
        var payload=angular.copy(me.currentUser);
        payload.fields=angular.copy($scope.don.user);
        delete (payload.type);
        RubedoUsersService.updateUser(payload).then(
            function(response){
                me.toggleStage(3);
            },
            function(response){
                me.errorHolder=response.data.message;
            }
        );
    };
    

        /*me.initializeCheckout();*/
        
    /*VALIDATION*/
        $scope.isTelephoneRequired = function () {
            return  !($scope.don.user.tel1 || $scope.don.user.tel2); // au moins téléphone fixe ou portable
    };
    
// s'il y a des questions complémentaires, les récupérer
    if ($scope.contentDetailCtrl.content.fields.questions && ($scope.contentDetailCtrl.content.fields.questions).length>0) {
        me.getQuestions();
    }
    
}]);


