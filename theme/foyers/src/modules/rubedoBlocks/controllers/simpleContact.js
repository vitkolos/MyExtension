angular.module("rubedoBlocks").lazy.controller("ContactBlockController",['$scope','$location','RubedoMailService','$rootScope','RubedoContentsService','InscriptionService','PaymentService','RubedoMediaService','RubedoSearchService','$timeout','$filter','RubedoPagesService',function($scope,$location,RubedoMailService,$rootScope,RubedoContentsService,InscriptionService,PaymentService,RubedoMediaService,RubedoSearchService,$timeout,$filter,RubedoPagesService) {
    var me = this;
    var config = $scope.blockConfig;
    me.contactData={ };
    me.contactError=null;
    $scope.clearORPlaceholderHeight();
    me.dateDiffence = function(start,end){
        console.log($filter('number')((end-start)/(3600*24*1000),0));
        return $filter('number')((end-start)/(3600*24*1000),0);
    }
				
				
				 var themePath='/theme/'+window.rubedoConfig.siteTheme;
				me.infos_individuel = themePath+'/templates/blocks/formulaire/infos_individuel.html';
//    me.couple = themePath+'/templates/blocks/formulaire/couple.html';
//    me.questions = themePath+'/templates/blocks/formulaire/questions.html';
//    me.questionDetail = themePath+'/templates/blocks/formulaire/questionDetail.html';
//    me.infosFin = themePath+'/templates/blocks/formulaire/infosFin.html';
//    me.enfants = themePath+'/templates/blocks/formulaire/enfants.html';
//				me.general_infos = themePath+'/templates/blocks/formulaire/infos_individuel.html';
//				me.family_infos = themePath+'/templates/blocks/formulaire/parents.html';
//				me.freres_soeurs_infos = themePath+'/templates/blocks/formulaire/freres_soeurs.html';
//				me.travail_infos = themePath+'/templates/blocks/formulaire/etudes_travail.html';
//				me.complement_infos = themePath+'/templates/blocks/formulaire/infos_complementaires.html';
//				me.photo = themePath+'/templates/blocks/formulaire/photo.html';
//				me.lettre_motivation = themePath+'/templates/blocks/formulaire/lettre_motivation.html';
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
    me.submit=function(){
        me.contactError=null;
        var contactSnap=angular.copy(me.contactData);
        var payload={
            to:config.email,
            from:me.contactData.email,
            subject:contactSnap.subject
        };
        if(contactSnap.template) {payload.template = contactSnap.template;delete (contactSnap.template);}
        /*var destinataires = {'Nicolas':'nicolas.rhone@gmail.com' ,'Nicolas Rhoné':'nicolas.rhone@wanadoo.fr' }*/
        delete (contactSnap.subject);
        delete (contactSnap.to);
        
        payload.fields=contactSnap;
        angular.element('#myModal'+$scope.block.id+$scope.blockConfig.id).modal('hide');
        angular.element('#myModalsingle').modal('hide');
        payload.fields["website"] = $location.absUrl();
        RubedoMailService.sendMail(payload).then(
            function(response){
                if (response.data.success){
                    me.contactData={ };
                    me.showForm=false;
                    me.showConfirmMessage=true;
                    //$scope.rubedo.sendGaEvent('/form/', 'contact');
                    if(window.ga) {
                        window.ga('send', 'event', 'contact', 'envoi de mail',config.email);
                    }
                } else {
                    me.contactError=response.data.message;
                }
                $('#myModal').modal('hide');
            },
            function(response){
                me.contactError=response.data.message;
            }
        );
    };
}]);
