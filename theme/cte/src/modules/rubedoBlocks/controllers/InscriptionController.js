angular.module("rubedoBlocks").lazy.controller("InscriptionController",['$scope','RubedoContentsService','$timeout',function($scope,RubedoContentsService,$timeout){
    var me = this;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    me.template=themePath+'/templates/blocks/formulaire/default.html';

    me.content = angular.copy($scope.proposition);
    var propositionId = me.content.id;
    var propositionTitle = me.content.text;
    var formId = me.content.fields.formulaire;
    me.form={};
    //pour récupérer les champs du formulaire
    me.getFormulaire = function (contentId){
        var options = {
            siteId: $scope.rubedo.current.site.id,
            pageId: $scope.rubedo.current.page.id
        };        
        RubedoContentsService.getContentById(contentId, options).then(function(response){
            if (response.data.success){
                me.form = response.data.content;
            }
        });
    };
    me.getFormulaire(formId);
    me.getFormFieldByName=function(name){
            console.log(me.form);
            var field=null;
            angular.forEach(me.form.type.fields,function(candidate){
                if (candidate.config.name==name){
                    field=candidate;
                }
            });
        return field;
    };
    me.getValueInStore = function(name) {
        angular.forEach($scope.field.store.data,function(candidate){
            if (candidate.valeur == name) {
                return candidate.nom;
            }
        });
    };
    



    
    
    
    
 }]);