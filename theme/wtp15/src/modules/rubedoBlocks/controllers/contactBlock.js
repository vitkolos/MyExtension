angular.module("rubedoBlocks").lazy.controller('ContactBlockController',['$scope','RubedoContactService',function($scope,RubedoContactService){
    var me = this;
    var config = $scope.blockConfig;
    me.contactData={ };
    me.contactError=null;
    if (config.mailingListId){
        me.showForm=true;
    }
    me.submit=function(){
        me.contactError=null;
        var contactSnap=angular.copy(me.contactData);
        var payload={
            mailingListId:config.mailingListId,
            from:me.contactData.email,
            subject:contactSnap.subject,
        };
        /*var destinataires = {'Nicolas':'nicolas.rhone@gmail.com' ,'Nicolas Rhoné':'nicolas.rhone@wanadoo.fr' }
        payload.to = destinataires;*/
        delete (contactSnap.subject);
        payload.from = me.contactData.email;
        payload.fields=contactSnap;
        RubedoContactService.sendContact(payload).then(
            function(response){
                if (response.data.success){
                    me.contactData={ };
                    me.showForm=false;
                    me.showConfirmMessage=true;
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
