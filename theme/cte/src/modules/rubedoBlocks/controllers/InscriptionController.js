angular.module("rubedoBlocks").lazy.controller("InscriptionController",['$scope','RubedoContentsService',function($scope,RubedoContentsService){
    var me = this;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    $scope.inscription={};
    me.infos_individuel = themePath+'/templates/blocks/formulaire/infos_individuel.html';
    me.questions = themePath+'/templates/blocks/formulaire/questions.html';

    me.content = angular.copy($scope.proposition);
    var propositionId = me.content.id;
    var propositionTitle = me.content.text;
    var formId = me.content.fields.formulaire;
    //surveiller si le type de formulaire est changé
    $scope.$watch("contentDetailCtrl.content.public + contentDetailCtrl.content.service", function(newValue, oldValue) {
        $scope.inscription.public_type=me.content.public;
        $scope.inscription.serviteur=me.content.service;
        $scope.$apply();
  });

    me.form={};
    me.fields={};
    //pour récupérer les champs du formulaire
    me.getFormulaire = function (contentId){
        var options = {
            siteId: $scope.rubedo.current.site.id,
            pageId: $scope.rubedo.current.page.id
        };        
        RubedoContentsService.getContentById(contentId, options).then(function(response){
            if (response.data.success){
                me.form = response.data.content;

                //get fields infos
                angular.forEach(me.form.type.fields, function(field){
                    me.fields[field.config.name] = field;
                });
            }
        });
    };
    me.getFormulaire(formId);

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
    // VALIDATIONS
    
    //telephones
    $scope.isTelephoneRequired = function () {
        if($scope.inscription.public_type == 'adolescent')
            return !($scope.inscription.tel1 || $scope.inscription.tel2 || $scope.inscription.tel2Pers2); // au moins téléphone fixe / portable / parent
        else
            return  !($scope.inscription.tel1 || $scope.inscription.tel2); // au moins téléphone fixe ou portable
    };
    


    
    
    
    
 }]);