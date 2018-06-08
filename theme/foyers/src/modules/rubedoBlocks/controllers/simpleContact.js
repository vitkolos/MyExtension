angular.module("rubedoBlocks").lazy.controller('ContactBlockController',['$scope','$location','$filter','RubedoMailService',function($scope,$location,$filter,RubedoMailService){
    var me = this;
    var config = $scope.blockConfig;
    me.contactData={ };
    me.contactError=null;
		
      me.contactData.subject='Nouvelle réservation';
      lg = rubedo.current.page.locale;
      moment.locale(rubedo.current.page.locale);
      me.contactData.template='/theme/foyers/templates/mails/reservationEDM.html';
    $scope.clearORPlaceholderHeight();
    me.dateDiffence = function(start,end){
        console.log($filter('number')((end-start)/(3600*24*1000),0));
        return $filter('number')((end-start)/(3600*24*1000),0);
    }
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
