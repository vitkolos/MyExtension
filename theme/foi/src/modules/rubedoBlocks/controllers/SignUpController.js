angular.module("rubedoBlocks").lazy.controller('SignUpController',['$scope','RubedoUserTypesService','RubedoUsersService', '$location','RubedoMailingListService','RubedoAuthService', function($scope, RubedoUserTypesService, RubedoUsersService, $location, RubedoMailingListService,RubedoAuthService){
    var me = this;
    var config = $scope.blockConfig;
    me.inputFields=[ ];
    me.mailingLists = {};
    me.prefix = "mailingLists_"+$scope.block.id;
    $scope.fieldIdPrefix="signUp";
    $scope.fieldEntity={ };
    $scope.fieldInputMode=true;
    me.signupError=null;
    me.submit=function(){
        me.signupError=null;
        if (config.collectPassword&&$scope.fieldEntity.confirmPassword!=$scope.fieldEntity.password){
            me.signupError=$scope.rubedo.translate("Blocks.Auth.Error.PasswordsNotMatch");
            return;
        }
        var fields=angular.copy($scope.fieldEntity);
        delete (fields.confirmPassword);
        fields.login=fields.email;
        fields.name=fields.surname+" "+fields.nom;
        RubedoUsersService.createUser(fields,config.userType).then(
            function(response){
                if (response.data.success){
                    me.showForm=false;
                    if (me.userType.signUpType=="open"){
                        me.confirmMessage="Blocks.SignUp.done.created";
                        me.confirmMessageDefault="Account created.";
                        me.credentials={
                            login:fields.login,
                            password:fields.password
                        };
                        RubedoAuthService.generateToken(me.credentials,false).then(
                            function(responseAuth){
                                window.location.reload();
                            },
                            function(responseAuth){
                                me.authError=response.data.message;
                            }
                        );
                    } else if (me.userType.signUpType=="moderated"){
                        me.confirmMessage="Blocks.SignUp.moderated.created";
                        me.confirmMessageDefault="Account created. You will be able to log in as soon as an administrator validates your account.";
                    } else if (me.userType.signUpType=="emailConfirmation"){
                        me.confirmMessage="Blocks.SignUp.confirmEmail.emailSent";
                        me.confirmMessageDefault="A confirmation email has been sent to the provided address.";
                    }
                    if (config.mailingListId){
                        var mailingListsSuscribe=[];
                        angular.forEach(me.mailingLists, function(mailingList){
                            if(mailingList.checked){
                                mailingListsSuscribe.push(mailingList.id);
                            }
                        });
                        if (mailingListsSuscribe.length>0){
                            var options = {
                                mailingLists: mailingListsSuscribe,
                                email: response.data.user.data.email
                            };
                            RubedoMailingListService.subscribeToMailingLists(options).then(function(response){
                            },function(response){
                            });
                            $scope.handleCSEvent("mailingListSubscribe");
                        }
                    }
                    $scope.rubedo.sendGaEvent('/form/', 'sign up');
                } else {
                    me.signupError=response.data.message;
                }
            },
            function(response){
                me.signupError=response.data.message;
            }
        );
        $scope.handleCSEvent("submit");
    };
    var queryParams=$location.search();
    if (queryParams.confirmingEmail&&queryParams.userId&&queryParams.signupTime){
        RubedoUsersService.confirmUserEmail(queryParams.userId,queryParams.signupTime).then(
            function(response){
                if (response.data.success){
                    me.confirmMessage="Blocks.SignUp.emailConfirmed.activated";
                    me.confirmMessageDefault="Account activated.";
                } else {
                    me.emailConfirmError=response.data.message;
                }
                $scope.clearORPlaceholderHeight();
            },
            function(response){
                me.emailConfirmError=response.data.message;
                $scope.clearORPlaceholderHeight();
            }
        );
    } else if (config.userType){
        RubedoUserTypesService.getUserTypeById(config.userType).then(
            function(response){
                if (response.data.success){
                    me.showForm=true;
                    me.userType=response.data.userType;
                    $scope.fieldIdPrefix="signUp"+"_"+me.userType.type;
                    if (config.collectPassword){
                        me.userType.fields.unshift({
                            cType:"textfield",
                            config:{
                                name:"confirmPassword",
                                fieldLabel:$scope.rubedo.translate("Blocks.SignUp.label.confirmPassword"),
                                allowBlank:false,
                                vtype:"password"
                            }
                        });
                        me.userType.fields.unshift({
                            cType:"textfield",
                            config:{
                                name:"password",
                                fieldLabel:$scope.rubedo.translate("Blocks.SignUp.label.password"),
                                allowBlank:false,
                                vtype:"password"
                            }
                        });
                    }
                    me.userType.fields.unshift({
                        cType:"textfield",
                        config:{
                            name:"email",
                            fieldLabel:$scope.rubedo.translate("Label.Email"),
                            allowBlank:false,
                            vtype:"email"
                        }
                    });
                    /*me.userType.fields.unshift({
                        cType:"textfield",
                        config:{
                            name:"name",
                            fieldLabel:$scope.rubedo.translate("Blocks.SignUp.label.name"),
                            allowBlank:false
                        }
                    });*/
                    me.inputFields=me.userType.fields;
                    $scope.clearORPlaceholderHeight();
                }
            }
        );
    }
    me.mailingLists={};
    RubedoMailingListService.getAllMailingList().then(function(response){
        if(response.data.success){
            angular.forEach(config.mailingListId, function(mailing){
                var newMailing = {};
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
}]);