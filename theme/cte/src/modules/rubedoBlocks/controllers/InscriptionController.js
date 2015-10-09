angular.module("rubedoBlocks").lazy.controller("InscriptionController",['$scope','RubedoContentsService',function($scope,RubedoContentsService){
    var me = this;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    $scope.inscription={};
    me.template="";

    me.getTemplate = function(){
        me.template = themePath+'/templates/blocks/formulaire/'+ $scope.inscription.public_type+'.html';//$scope.inscription.public_type
    }
    me.content = angular.copy($scope.proposition);
    var propositionId = me.content.id;
    var propositionTitle = me.content.text;
    var formId = me.content.fields.formulaire;
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
                if ( (me.form.fields.publics).length==1) {
                    me.template = themePath+'/templates/blocks/formulaire/'+ me.form.fields.publics[0]+'.html';
                }
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
        
        return value;
    };
    



    
    
    
    
 }]);