angular.module("rubedoBlocks").lazy.controller('MailingListSuscribeController',['$scope','RubedoMailingListService','RubedoContactService',function($scope,RubedoMailingListService, RubedoContactService){
    var me = this;
    var config = $scope.blockConfig;
    me.display = false;
    me.mailingLists = {};
    $scope.fieldIdPrefix="mailingLists";
    me.prefix = "mailingLists_"+$scope.block.id;
    $scope.fieldEntity={ };
    $scope.fieldInputMode=true;
    $scope.isBasic = true;
   RubedoMailingListService.getAllMailingList().then(function(response){
        if(response.data.success){
            me.userType = response.data.userType;
            $scope.fieldIdPrefix=me.prefix+me.userType.type;
            angular.forEach(config.mailingListId, function(mailing){
                var newMailing = {};
                me.display = true;
                angular.forEach(response.data.mailinglists, function(mailingInfo){
                    if(mailingInfo.id == mailing){
                        newMailing.id = mailing;
                        newMailing.name = mailingInfo.name;
                        newMailing.checked = false;
                        me.mailingLists[mailing] = newMailing;
                    }
                });
            });
        }
    });
    me.submit = function(){
        if (me.email && me.name) {
            var mailingListsSuscribe = [];
            angular.forEach(me.mailingLists, function(mailingList){
                if(mailingList.checked){
                    mailingListsSuscribe.push(mailingList.id);
                }
            });
            if(mailingListsSuscribe.length > 0){
                var options={
                    mailingLists:mailingListsSuscribe,
                    email: me.email,
                    name: me.name
                };
                if($scope.fieldEntity){
                    options.fields = $scope.fieldEntity;
                }
                RubedoMailingListService.subscribeToMailingLists(options).then(function(response){
                    $scope.fieldEntity = {};
                    if(response.data.success){
                        $scope.notification = {
                            type: 'success',
                            text: 'You have successfully subscribed to the selected newsletter(s)'
                        };
                        
                    }
                },function(){
                    $scope.notification = {
                        type: 'error',
                        text: 'The subscribe process failed'
                    };
                });

                console.log(me.email);
                angular.forEach(me.mailingLists, function(mailingList){
                    var message={ mail:me.email, name:me.name, newsletter:mailingList.name};                    
                    var payload={
                        from:me.email,
                        subject:"Welcome to Paradise - Inscription à la newsletter",
                        fields:message
                    };
                    payload.mailingListId = mailingList.id;
                    console.log(payload.mailingListId);
                    console.log(payload.from);
                    console.log(payload.subject);
                    
                    console.log(payload.fields);
                    RubedoContactService.sendContact(payload).then(
                         function(response){
                             if (response.data.success){
                                 
                             } else {
                             }
                         },
                         function(response){
                         }
                     );
                });
                me.email = '';
                me.name = '';

                
                 
                
                
            }
        } else {
            $scope.notification = {
                type: 'error',
                text: 'Email and/or name are required'
            };
        }
    };
}]);
