angular.module("rubedoBlocks").lazy.controller("InscriptionController",['$scope','RubedoContentsService',function($scope,RubedoContentsService){
    var me = this;
    me.formId = $scope.content.fields.formulaire;
    me.propositionId = $scope.content.id;
    me.propositionTitle = $scope.content.text;
    //pour récupérer les champs du formulaire
    me.getFormulaire = function (contentId){
        RubedoContentsService.getContentById(contentId).then(function(response){
            if (response.data.success){
                me.form = response.data.content;
            }
        });
    };

    
    
    
    
 }]);