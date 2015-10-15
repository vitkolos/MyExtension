angular.module("rubedoBlocks").lazy.controller("InscriptionController",['$scope','RubedoContentsService',function($scope,RubedoContentsService){
    var me = this;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    $scope.inscription={};
    me.infos_individuel = themePath+'/templates/blocks/formulaire/infos_individuel.html';
    me.questions = themePath+'/templates/blocks/formulaire/questions.html';
    me.questionDetail = themePath+'/templates/blocks/formulaire/questionDetail.html';

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
    //pour récupérer les champs du formulaire
    me.getFormulaire = function (contentId){
        RubedoContentsService.getContentById(contentId, options).then(function(response){
            if (response.data.success){
                me.form = response.data.content;

                //get fields infos
                angular.forEach(me.form.type.fields, function(field){
                    me.fields[field.config.name] = field;
                });
                // s'il y a des questions complémentaires, les récupérer
                if ((me.form.fields.questions).length>0) {
                    me.getQuestions();
                }
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
                        case "complementaire": me.form.questions.complementaires.push({"text":questionReponse.text, "fields":questionReponse.fields}); break;
                        case "transport": me.form.questions.transport.push({"text":questionReponse.text, "fields":questionReponse.fields}); break;
                        case "logement": me.form.questions.logement.push({"text":questionReponse.text, "fields":questionReponse.fields}); break;
                        case "generale": me.form.questions.generale.push({"text":questionReponse.text, "fields":questionReponse.fields}); break;
                    };
                }
            });
            
        });
        console.log(me.form.questions);
    };
    
    
    
    me.getFormulaire(formId);
  
 
    // VALIDATIONS
    
    //telephones
    $scope.isTelephoneRequired = function () {
        if($scope.inscription.public_type == 'adolescent')
            return !($scope.inscription.tel1 || $scope.inscription.tel2 || $scope.inscription.tel2Pers2); // au moins téléphone fixe / portable / parent
        else
            return  !($scope.inscription.tel1 || $scope.inscription.tel2); // au moins téléphone fixe ou portable
    };
    

    // affichage des sections du formulaire
    me.isCurrentStage = function(step, prev_validity){
        var displayed = false;
        if (step==1) {
            displayed = true;
        }
        else if (step > 1) {
            if (prev_validity) {
            displayed = true;
            }
        }
        console.log(step+ " "+ prev_validity);
        return displayed;
    }
    
    
    
    
 }]);