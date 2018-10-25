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

    me.mailingListUsers = [];
    me.getMailingListUsers = async function(ml_id) {
        let http_res;
        try {
            http_res = await $http({
                url: '/backoffice/mailing-lists/get-users',
                method: "GET",
                params: {
                    id: ml_id,
                    _dc: '1540472371822', page: 1, start: 0, limit: 5000
                }
            })
            console.log('got MailingListUsers', ml_id, http_res.data.data);
            me.mailingListUsers = http_res.data.data;
            return me.mailingListUsers
        } catch(e) {
            console.log("Erreur dans getMailingListUsers", e)
        }
    }

    me.downloadData = function (filename, data) {
        console.log("DOWNLOAD DATA", data)
        var blob = new Blob([data], { type:"application/json;charset=utf-8;" });			
        var downloadLink = angular.element('<a></a>');
        downloadLink.attr('href',window.URL.createObjectURL(blob));
        downloadLink.attr('download', filename);
        downloadLink[0].click();
    };
    me.downloadUserList = function() {
        let data = 'Nom;Email;Langue\n' + me.mailingListUsers.map(u => `${u.name};${u.email};${u.language}`).join("\n");
        me.downloadData('liste_utilisateurs.csv', data)
    }

    RubedoMailingListService.getAllMailingList().then(function(response){
        //console.log("aLLMailingLists", response)
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
                        newMailing.checked = true;
                        me.mailingLists[mailing] = newMailing;
                        me.getMailingListUsers(mailing)
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
