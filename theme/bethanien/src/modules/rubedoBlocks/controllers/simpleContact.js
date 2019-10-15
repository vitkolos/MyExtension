angular.module("rubedoBlocks").lazy.controller('ContactBlockController',['$scope','$location','RubedoMailService', 'RgpdService',function($scope,$location,RubedoMailService, RgpdService){
    var me = this;
    var config = $scope.blockConfig;
    me.contactData={ };
    me.contactError=null;

    // RGPD
    console.log("Init RGPD")
    $scope.parameters = {'rgpd_media_id': ''}
    lang = (me.content && me.content.locale) ? me.content.locale : 'fr';
    RgpdService.getPolitiqueConfidentialiteId(lang).then(id => {
        $scope.parameters.rgpd_media_id = id;
    })
    
    me.submit=function($scope){
        me.contactError=null;
        var contactSnap=angular.copy(me.contactData);
        var payload={
            to:config.email,
            from:me.contactData.email,
            subject:contactSnap.subject
        };
        /*var destinataires = {'Nicolas':'nicolas.rhone@gmail.com' ,'Nicolas Rhoné':'nicolas.rhone@wanadoo.fr' }*/
        delete (contactSnap.subject);
        delete (contactSnap.to);
        payload.fields=contactSnap;
        angular.element('#myModal').modal('hide');
        payload.fields["website"] = $location.absUrl();
        RubedoMailService.sendMail(payload).then(
            function(response){
                if (response.data.success){
                    me.contactData={ };
                    me.showForm=false;
                    me.showConfirmMessage=true;
                    $scope.rubedo.sendGaEvent('/form/', 'contact');
                } else {
                    me.contactError=response.data.message;
                }
            },
            function(response){
                me.contactError=response.data.message;
            }
        );
    };
}]);