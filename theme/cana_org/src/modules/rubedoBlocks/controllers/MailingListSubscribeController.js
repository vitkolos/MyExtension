angular.module("rubedoBlocks").lazy.controller('MailingListSuscribeController',['$scope','$http', 'RubedoMailingListService','RubedoContactService',function($scope,$http,RubedoMailingListService, RubedoContactService){
    var me = this;
    var config = $scope.blockConfig;
    me.display = false;
    me.mailingLists = {};
    $scope.fieldIdPrefix="mailingLists";
    me.prefix = "mailingLists_"+$scope.block.id;
    $scope.fieldEntity={ };
    $scope.fieldInputMode=true;
    $scope.isBasic = true;

    /* $http({
        url: '/api/v1/users/5522697945205e8e628d8c5e',
        method: "GET"
    }).then(r => console.log('$http res', r)).catch(err => console.log('$http err', err)) */
    /* $http({
        url: '/backoffice/mailing-lists/get-users',
        method: "GET",
        params: {
            _dc: '1540472371822',
            id: '54de19cc45205ec61c8b4568',
            page: 1,
            start: 0,
            limit: 50
        }
    }).then(r => console.log('$http res', r)).catch(err => console.log('$http err', err)) */
    $http({
        url:'https://www.cana.org/backoffice/current-user/get-token',
        method:"GET"
    }).then(r => {
        console.log('$http token res', r)
        $http({
            url: '/backoffice/mailing-lists/get-users',
            method: "GET",
            params: {
                _dc: '1540472371822',
                id: '54de19cc45205ec61c8b4568',
                page: 1,
                start: 0,
                limit: 50,
                token: r.data.token
            }
        }).then(r => console.log('$http ML', r)).catch(err => console.log('$http ML err', err))
    }).catch(err => console.log('$http token err', err))

    RubedoMailingListService.getAllMailingList().then(function(response){
        console.log("aLLMailingLists", response)
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
        console.log("SUBMIT !", me, $scope.fieldEntity)
        if (me.email && me.name) {
            var mailingListsSuscribe = [];
            angular.forEach(me.mailingLists, function(mailingList){
                //if(mailingList.checked){
                    mailingListsSuscribe.push(mailingList.id);
                //}
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
                console.log("OPT RubedoMailingListService", Object.getOwnPropertyNames(RubedoMailingListService))
                RubedoMailingListService.subscribeToMailingLists(options).then(function(response){
                    $scope.fieldEntity = {};
                    if(response.data.success){
                        $scope.notification = {
                            type: 'success',
                            text: 'You have successfully subscribed to the selected newsletter(s)'
                        };
                        
                    }
                },function(err){
                    console.log("Erreur inscription", err)
                    $scope.notification = {
                        type: 'error',
                        text: 'The subscribe process failed'
                    };
                });

                console.log(me.email);
                /* angular.forEach(me.mailingLists, function(mailingList){
                    var message={ mail:me.email, name:me.name, newsletter:mailingList.name};                    
                    var payload={
                        from:me.email,
                        subject:"Mission Cana - Inscription à la newsletter",
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
                                 console.log(`Ok tout va bien`, response)
                             } else {
                                 console.log(`Impossible d'envoyer un mail de confirmation d'inscription à ...`, response)
                             }
                         },
                         function(response){
                         }
                     );
                });
                me.email = '';
                me.name = ''; */

                
                 
                
                
            }
        } else {
            $scope.notification = {
                type: 'error',
                text: 'Email and/or name are required'
            };
        }
    };
}]);
