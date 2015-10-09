angular.module("rubedoBlocks").lazy.controller("InscriptionController",['$scope','RubedoContentsService',function($scope,RubedoContentsService){
    var me = this;
    me.content = angular.copy($scope.proposition);
    console.log(me.content);
    var propositionId = me.content.id;
    var propositionTitle = me.content.text;
    var formId = me.content.fields.formulaire;

    //pour récupérer les champs du formulaire
    me.getFormulaire = function (contentId){
        var options = {
            siteId: $scope.rubedo.current.site.id,
            pageId: $scope.rubedo.current.page.id
        };        
        RubedoContentsService.getContentById(contentId, options).then(function(response){
            if (response.data.success){
                me.form = response.data.content;
                me.publics = JSON.stringify(me.form.fields.publics);
            }
        });
    };
    
    me.getFormulaire(formId);

    
    
    
    
 }]);