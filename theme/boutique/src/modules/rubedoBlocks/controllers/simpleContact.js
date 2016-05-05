angular.module("rubedoBlocks").lazy.controller('ContactBlockController',['$scope','RubedoMailService',function($scope,RubedoMailService){
    var me = this;
    var config = $scope.blockConfig;
    me.contactData={ };
    me.contactError=null;
    $scope.adressOfTopics=[
        {adr:'etienne.laval.moi@gmail.com',
            topic:'Service client'},
        {adr:'etienne.m.laval@gmail.com',
            topic:'Service expedition'},
        {adr:'etienne.laval.moi@gmail.com',
            topic:'Les ACN'},
        {adr:'etienne.laval.moi@gmail.com',
            topic:'Webmaster'}]    ;

    $scope.selectedTopic= {adr:'etienne.laval.moi@gmail.com', topic:'Service client'};

    $scope.clearORPlaceholderHeight();
    me.submit=function(){
        me.contactError=null;
        var contactSnap=angular.copy(me.contactData);
        var payload={
            to: $scope.selectedTopic.adr,
            from:me.contactData.email,
            subject:$scope.selectedTopic.topic,
        };
        delete (contactSnap.subject);
        delete (contactSnap.to);
        payload.fields=contactSnap;
        RubedoMailService.sendMail(payload).then(
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