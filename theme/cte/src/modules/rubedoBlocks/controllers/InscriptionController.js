angular.module("rubedoBlocks").lazy.controller("InscriptionController",['$scope','RubedoContentsService','InscriptionService','PaymentService','$timeout',function($scope,RubedoContentsService,InscriptionService,PaymentService,$timeout){
    var me = this;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    $scope.inscription={};
    me.infos_individuel = themePath+'/templates/blocks/formulaire/infos_individuel.html';
    me.couple = themePath+'/templates/blocks/formulaire/couple.html';
    me.questions = themePath+'/templates/blocks/formulaire/questions.html';
    me.questionDetail = themePath+'/templates/blocks/formulaire/questionDetail.html';
    me.infosFin = themePath+'/templates/blocks/formulaire/infosFin.html';
    me.enfants = themePath+'/templates/blocks/formulaire/enfants.html';

    me.content = angular.copy($scope.proposition);
    var propositionId = me.content.id;
    var propositionTitle = me.content.text;
    var formId = me.content.fields.formulaire;
    //surveiller si le type de formulaire est changé
    $scope.$watch("contentDetailCtrl.content.public", function(newValue, oldValue) {
        $scope.inscription.public_type=newValue;
    });
    $scope.$watch("contentDetailCtrl.content.service", function(newValue, oldValue) {
        $scope.inscription.serviteur=newValue;
    });
    me.form={};
    me.fields={};
    var options = {
            siteId: $scope.rubedo.current.site.id,
            pageId: $scope.rubedo.current.page.id
    };
    me.getFieldByName=function(name){
        var field=null;
        if (me.form) {
            angular.forEach(me.form.type.fields,function(candidate){
                if (candidate.config.name==name){
                    field=candidate;
                }
            });
        }
        
        return field;
    };
    // ajouter enfants
    $scope.inscription.enfants=[];
    me.addChild = function(enfant){
        $scope.inscription.enfants.push(angular.copy(enfant));
    }
    // supprimer enfant
    me.removeChild = function(index){
        $scope.inscription.enfants.splice(index, 1);
    };  

    
    
    
    //pour récupérer les champs du formulaire
    me.getFormulaire = function (contentId){
        RubedoContentsService.getContentById(contentId, options).then(function(response){
            if (response.data.success){
                me.form = response.data.content;
                $scope.fieldEntity=angular.copy(me.form.fields);

                //get fields infos
                angular.forEach(me.form.type.fields, function(field){
                    me.fields[field.config.name] = field;
                });

                // check infos complémentaires
                if ((me.form.fields.questions1) && me.form.fields.questions1.questions1 && ((me.form.fields.questions1.questions1).length>0)) {
                    if(typeof me.form.fields.questions1.questions1 =='string') {
                        me.form[me.form.fields.questions1.questions1] = true;
                    }
                    else {
                        angular.forEach(me.form.fields.questions1.questions1, function(option, key){
                            me.form[option] = true;
                        });
                    }
                }
                // s'il y a des questions complémentaires, les récupérer
                if ((me.form.fields.questions).length>0) {
                    me.getQuestions();
                }
                                // questions complémentaires ?
                if ( me.form.jai_connu || me.form.situation_conjugale) {me.isComplement = true;}
                if ( (me.form.fields.transport) && (me.form.fields.transport.transport) &&((me.form.fields.transport.transport).length>1) && (typeof me.form.fields.transport.transport != 'string') ) {me.isTransport = true;}
                if ( (me.form.fields.logement) && (me.form.fields.logement.logement) &&((me.form.fields.logement.logement).length>1 ) && ( typeof me.form.fields.logement.logement !='string') ) {me.isLogement = true;}
                if (((me.content.fields.paimentOption)&&(me.content.fields.paimentOption.paimentOption) && ((me.content.fields.paimentOption.paimentOption).length>0)) || me.content.fields.accompte>0) {me.isPaiement = true}
                if (( typeof me.content.fields.paimentOption.paimentOption =='string')) {
                    me.content.fields.paimentOption.paimentOption = {0 : me.content.fields.paimentOption.paimentOption};
                }
              
                console.log(me.form);
                
            }
        });
    };
       //labels des questions radio / checkbox
    me.getLabel = function(field,name) {
        var value = null;
        if (field.cType == 'combobox') {
            angular.forEach(field.store.data,function(candidate){
                if (candidate.valeur == name) {
                    value = candidate.nom;
                }
            });
        }
        else if (field.cType == 'checkboxgroup') {
            angular.forEach(field.config.items,function(candidate){
                if (candidate.inputValue == name) {
                    value = candidate.boxLabel;
                }
            });
        }
        
        return value;
    };
    // récupérer les questions complémentaires
    me.getQuestions = function() {
        me.form.questions={
            "complementaires":[],
            "transport":[],
            "logement":[],
            "generale":[]
        };
        angular.forEach(me.form.fields.questions, function(questionId){
            RubedoContentsService.getContentById(questionId, options).then(function(response){
                if (response.data.success){
                    var questionReponse= response.data.content;
                    switch (questionReponse.fields.categorie.categorie) {
                        case "complementaire": me.form.questions.complementaires.push({"text":questionReponse.text, "fields":questionReponse.fields}); me.isComplement = true; break;
                        case "transport": me.form.questions.transport.push({"text":questionReponse.text, "fields":questionReponse.fields}); me.isTransport = true; break;
                        case "logement": me.form.questions.logement.push({"text":questionReponse.text, "fields":questionReponse.fields});me.isLogement = true;  break;
                        case "generale": me.form.questions.generale.push({"text":questionReponse.text, "fields":questionReponse.fields}); break;
                    };
                  

                }
            });
            
        });
    };
    //locale pour les champs date
    moment.locale('fr', {
        months : "janvier_février_mars_avril_mai_juin_juillet_août_septembre_octobre_novembre_décembre".split("_"),
        monthsShort : "janv._févr._mars_avr._mai_juin_juil._août_sept._oct._nov._déc.".split("_"),
        weekdays : "dimanche_lundi_mardi_mercredi_jeudi_vendredi_samedi".split("_"),
        weekdaysShort : "dim._lun._mar._mer._jeu._ven._sam.".split("_"),
        weekdaysMin : "Di_Lu_Ma_Me_Je_Ve_Sa".split("_"),
        longDateFormat : {
            LT : "HH:mm",
            LTS : "HH:mm:ss",
            L : "DD/MM/YYYY",
            LL : "D MMMM YYYY",
            LLL : "D MMMM YYYY LT",
            LLLL : "dddd D MMMM YYYY LT"
        },
        calendar : {
            sameDay: "[Aujourd'hui à] LT",
            nextDay: '[Demain à] LT',
            nextWeek: 'dddd [à] LT',
            lastDay: '[Hier à] LT',
            lastWeek: 'dddd [dernier à] LT',
            sameElse: 'L'
        },
        relativeTime : {
            future : "dans %s",
            past : "il y a %s",
            s : "quelques secondes",
            m : "une minute",
            mm : "%d minutes",
            h : "une heure",
            hh : "%d heures",
            d : "un jour",
            dd : "%d jours",
            M : "un mois",
            MM : "%d mois",
            y : "une année",
            yy : "%d années"
        },
        ordinalParse : /\d{1,2}(er|ème)/,
        ordinal : function (number) {
            return number + (number === 1 ? 'er' : 'ème');
        },
        meridiemParse: /PD|MD/,
        isPM: function (input) {
            return input.charAt(0) === 'M';
        },
        // in case the meridiem units are not separated around 12, then implement
        // this function (look at locale/id.js for an example)
        // meridiemHour : function (hour, meridiem) {
        //     return /* 0-23 hour, given meridiem token and hour 1-12 */
        // },
        meridiem : function (hours, minutes, isLower) {
            return hours < 12 ? 'PD' : 'MD';
        },
        week : {
            dow : 1, // Monday is the first day of the week.
            doy : 4  // The week that contains Jan 4th is the first week of the year.
        }
    });
    
    me.getFormulaire(formId);
  

    // VALIDATIONS ANGULAR
    
    //telephones
    $scope.isTelephoneRequired = function () {
        if($scope.inscription.public_type == 'adolescent')
            return !($scope.inscription.tel1 || $scope.inscription.tel2 || $scope.inscription.tel2Pers2); // au moins téléphone fixe / portable / parent
        else if ($scope.inscription.public_type == 'couple' || $scope.inscription.public_type=='famille') {
            return !($scope.inscription.tel2 || $scope.inscription.tel2Pers2 || $scope.inscription.tel1); // au moins portable de lui / elle / téléphone fixe
        }
        else
            return  !($scope.inscription.tel1 || $scope.inscription.tel2); // au moins téléphone fixe ou portable
    };

    
    me.currentStage = 1;
    // affichage des sections du formulaire
    me.setCurrentStage = function(step, valide) {
        if (valide && (me.currentStage >= step)) {
            if (step==0) {me.currentStage=1;}
            else if (step==1) {
                if( $scope.inscription.email != $scope.inscription.email_verif){
                    $scope.mailError = true;
                }
                else if ($scope.inscription.emailPers2 != $scope.inscription.emailPers2_verif) {
                    $scope.mailError2 = true;
                    $scope.mailError = false;
                }
                else if (me.isComplement) {me.currentStage=2;$scope.mailError = false;$scope.mailError2 = false;}
                else if (me.isTransport) {me.currentStage=3;$scope.mailError = false;$scope.mailError2 = false;}
                else if (me.isLogement) {me.currentStage=4;$scope.mailError = false;$scope.mailError2 = false;}
                else if(me.isPaiement) {me.currentStage=5;$scope.mailError = false;$scope.mailError2 = false;}
                else {me.currentStage=6;$scope.mailError = false;$scope.mailError2 = false;}
            }
            else if (step==2) {
                if (me.isTransport) {me.currentStage=3;}
                else if (me.isLogement) {me.currentStage=4;}
                 else if(me.isPaiement) {me.currentStage=5;}
               else {me.currentStage=6;}
            }
            else if (step==3) {
                if (me.isLogement) {me.currentStage=4;}
                 else if(me.isPaiement) {me.currentStage=5;}
                else {me.currentStage=6;}
            }
            else if(step==4) {
                if(me.isPaiement) {me.currentStage=5;}
                else me.currentStage=6;
            }
            else if (step==5) {
                me.currentStage=6;
            }
        }
        else if (valide && step==6) {
            // validations préliminaires
            $scope.processForm=true;
           $scope.inscription.proposition=  propositionId;
            $scope.inscription.propositionTitre=  propositionTitle;
            $scope.inscription.shortName = propositionTitle.replace(/[ -]/g, "_");
            $scope.inscription.accompte = me.content.fields.accompte ?me.content.fields.accompte : 0;
            $scope.inscription.contact = me.content.fields.contact;
            if($scope.inscription.paiement_maintenant == 'rien'){$scope.inscription.montantAPayerMaintenant=0}
            else if($scope.inscription.paiement_maintenant == 'accompte'){$scope.inscription.montantAPayerMaintenant=me.content.fields.accompte}
            else if($scope.inscription.paiement_maintenant == 'totalite'){$scope.inscription.montantAPayerMaintenant=$scope.inscription.montantTotalAPayer}
            /*STATUS DE L'INSCRIPTION*/
            switch(me.content.fields.inscriptionState.inscriptionState) {
                case "attente":
                    $scope.inscription.statut = "liste-attente";
                    break;
                case 'preinscription':
                    $scope.inscription.statut = "preinscrit";
                    break;
                default:
                    if (me.isPaiement) {
                        /*pas de paiement maintenant*/
                        if ($scope.inscription.paiement_maintenant =="rien") {
                            $scope.inscription.statut = 'inscrit-sans-acompte';
                        }
                        else{
                            $scope.inscription.statut = "attente-paiement-"+$scope.inscription.modePaiement;
                        }
                    }
                    
            }
            InscriptionService.inscrire($scope.inscription, $scope.rubedo.current.page.workspace, $scope.rubedo.translations).then(function(response){
                if (response.data.success) {
                    var payload = {
                            nom:$scope.inscription.name,
                            prenom: $scope.inscription.surname,
                            email:$scope.inscription.email,
                            montant:$scope.inscription.montantAPayerMaintenant,
                            proposition:propositionTitle,
                            idInscription: response.data.id
                    };
                    if ($scope.inscription.modePaiement=='carte') { // paiement par Paybox
                        payload.paymentMode= 'carte';
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
                            }
                            
                        });
                        
                    }
                    else if($scope.inscription.modePaiement=='cheque'){
                        payload.paymentMode= 'cheque';
                        PaymentService.payment(payload).then(function(response){
                            if (response.data.success) {                                
                                $scope.processForm=false;
                            }
                            else $scope.processForm=false;
                            
                        });
                    }
                    
                    
                }
                 
            });
            
                
                
                
        }
    }

    
    
    
 }]);


