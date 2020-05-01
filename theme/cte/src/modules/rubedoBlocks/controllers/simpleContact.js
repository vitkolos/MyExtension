angular.module("rubedoBlocks").lazy.controller('ContactBlockController',['$scope','$location','$filter', '$window', 'RubedoMailService','RgpdService',function($scope,$location,$filter,$window,RubedoMailService,RgpdService){
    var me = this;
    var config = $scope.blockConfig;
    me.contactData={ };
    me.contactError=null;
    $scope.clearORPlaceholderHeight();

    // RGPD
    console.log("Init RGPD")
    $scope.parameters = {'rgpd_media_id': ''}
    RgpdService.getPolitiqueConfidentialiteId().then(id => {
        $scope.parameters.rgpd_media_id = id;
    })

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
        console.log("contact payload", payload)
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
                console.log("send response", response, '#myModal'+$scope.block.id+$scope.blockConfig.id)
                if (response.data.success){
                    me.contactData={subject:me.contactData.subject, template:me.contactData.template };
                    me.showForm=false;
                    me.showConfirmMessage=true;
                    $scope.showConfirmMessage = true;
                    //$scope.rubedo.sendGaEvent('/form/', 'contact');
                    if(window.ga) {
                        window.ga('send', 'event', 'contact', 'envoi de mail',config.email);
                    }
                } else {
                    me.contactError=response.data.message;
                    $scope.showErrorMessage = true;
                    payload.subject = `An error occured on this website : ${location.href} - ` + payload.subject;
                    payload.to = 'web@chemin-neuf.org';
                    RubedoMailService.sendMail(payload)
                }
                $('#myModal').modal('hide');
                angular.element('.modal').modal('hide');
            },
            function(response){
                me.contactError=response.data.message;
                console.log("Error while sending the email", payload);
                $scope.showErrorMessage = true;
                payload.subject = `An error occured on this website : ${location.href} - ` + payload.subject;
                payload.to = 'web@chemin-neuf.org';
                RubedoMailService.sendMail(payload)
            }
        ).catch(err => {
            console.log("An error occured while sending the email", payload);
            $scope.showErrorMessage = true;
            payload.subject = `An error occured on this website : ${location.href} - ` + payload.subject;
            payload.to = 'web@chemin-neuf.org';
            RubedoMailService.sendMail(payload)
        });
    };
}]);
