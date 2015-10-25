angular.module("rubedoBlocks").lazy.controller('ContactController',['$scope','RubedoContactService',function($scope,RubedoContactService){
    var me = this;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
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
            from:contactSnap.email,
            subject:contactSnap.subject
        };
        console.log(payload);
        delete (contactSnap.subject);
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
