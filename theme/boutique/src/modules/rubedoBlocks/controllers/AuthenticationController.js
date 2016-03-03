angular.module("rubedoBlocks").lazy.controller("AuthenticationController",["$scope","RubedoAuthService","snapRemote","RubedoPagesService","$location",function($scope,RubedoAuthService,snapRemote,RubedoPagesService,$location){
    var me=this;
    me.blockConfig=$scope.blockConfig;
    if (me.blockConfig&&me.blockConfig.profilePage&&mongoIdRegex.test(me.blockConfig.profilePage)){
        RubedoPagesService.getPageById(me.blockConfig.profilePage).then(function(response){
            if (response.data.success){
                me.profilePageUrl=response.data.url;
            }
        });
    }
    if (me.blockConfig&&me.blockConfig.signUpPage&&mongoIdRegex.test(me.blockConfig.signUpPage)){
        RubedoPagesService.getPageById(me.blockConfig.signUpPage).then(function(response){
            if (response.data.success){
                me.signUpPageUrl=response.data.url;
            }
        });
    }
    if (me.blockConfig&&me.blockConfig.commandPage&&mongoIdRegex.test(me.blockConfig.commandPage)){
        RubedoPagesService.getPageById(me.blockConfig.commandPage).then(function(response){
            if (response.data.success){
                me.commandPageUrl=response.data.url;
            }
        });
    }
    var requestParams = $location.search();
    if (requestParams.recoverEmail && requestParams.token){
        setTimeout(function(){angular.element('#rubedoChangePwdModal').appendTo('body').modal('show')},200);
    }
    me.credentials={ };
    me.authError=null;
    me.rememberMe=false;
    me.showModal=function(){
        angular.element('#rubedoAuthModal').appendTo('body').modal('show');
    };
    $scope.$on("RubedoShowModal",function(event,args){
        if (args&&args.block&&args.block==$scope.block.code){
            me.showModal();
        }
    });
    if ($scope.rubedo.current.UXParams.initialEvents&&$scope.rubedo.current.UXParams.initialEvents[$scope.block.code]&&$scope.rubedo.current.UXParams.initialEvents[$scope.block.code]["RubedoShowModal"]){
        setTimeout(function(){me.showModal();},200);
    }
    me.recoverPwdModal=function(){
        angular.element('#rubedoAuthModal').appendTo('body').modal('hide');
        angular.element('#rubedoRecoverPwdModal').appendTo('body').modal('show');
    };
    me.changePassword = function(){
        if(me.newPassword != me.newConfirmPassword){
            $scope.notification = {
                type: 'error',
                text: $scope.rubedo.translate("Blocks.Auth.Error.PasswordsNotMatch")
            };
        } else {
            var options = {
                token: requestParams.token,
                password: me.newPassword,
                email: requestParams.recoverEmail
            };
            RubedoAuthService.changePassword(options).then(
                function(response){
                    if(response.data.success){
                        $scope.notification = {
                            type: 'success',
                            text: $scope.rubedo.translate("Blocks.UserProfile.Success.PasswordChanged")
                        };
                        $location.search('recoverEmail',null);
                        $location.search('token',null);
                    }
                    me.recoverUserEmail = '';
                },function(response){
                    console.log(response);
                    $scope.notification = {
                        type: 'error',
                        text: $scope.rubedo.translate("Blocks.SignUp.emailConfirmError.userUpdateFailed")+" "+(response.data.message?' : '+response.data.message:'')
                    };
                }
            )
        }
    };
    me.recoverPassword = function(){
        var options = {
            email: me.recoverUserEmail,
            siteId: $scope.rubedo.current.site.id
        };
        RubedoAuthService.recoverPassword(options).then(
            function(response){
                if(response.data.success){
                    $scope.notification = {
                        type: 'success',
                        text: $scope.rubedo.translate("Blocks.Auth.EmailHasBeenSent")
                    };
                }
                me.recoverUserEmail = '';
            },function(response){
                console.log(response);
                $scope.notification = {
                    type: 'error',
                    text: 'Email not sent'+(response.data.message?' : '+response.data.message:'')
                };
            }
        )
    };
    me.authenticate=function(){
        me.authError=null;
        if ((!me.credentials.login)||(!me.credentials.password)){
            me.authError=$scope.rubedo.translate("Exception59");
        } else {
            RubedoAuthService.generateToken(me.credentials,me.rememberMe).then(
                function(responseAuth){
                    if (me.blockConfig&&me.blockConfig.redirectOnConnection&&me.blockConfig.profilePage&&mongoIdRegex.test(me.blockConfig.profilePage)){
                        RubedoPagesService.getPageById(me.blockConfig.profilePage).then(function(response){
                            if (response.data.success){
                                window.location.href=response.data.url;
                            } else {
                                window.location.reload();
                            }
                        },function(response){
                            window.location.reload();

                        });
                    } else {
                        window.location.reload();
                    }
                },
                function(responseAuth){
                    me.authError=responseAuth.data.message;
                }
            );
        }
    };
    me.logOut=function(){
        RubedoAuthService.clearPersistedTokens();
        window.location.reload();
    }
}]);