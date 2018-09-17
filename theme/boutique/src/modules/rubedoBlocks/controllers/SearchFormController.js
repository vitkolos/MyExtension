angular.module("rubedoBlocks").lazy.controller("SearchFormController",['$scope','$location','RubedoPagesService','RubedoProductsService',function($scope, $location, RubedoPagesService,RubedoProductsService){
    var me = this;
    var config = $scope.blockConfig;
    me.show = config.searchPage;
me.searchQuery="";
    me.placeholder = config.placeholder;
    /*var pageId=$scope.rubedo.current.page.id;
    var siteId=$scope.rubedo.current.site.id;
	var options = {
        start: 0,
        limit: 1000,
        'fields[]' : ["text"]
    };*/
    me.onSubmit = function(){
        var paramQuery = me.query?'?query='+me.query:'';
        RubedoPagesService.getPageById(config.searchPage).then(function(response){
            if (response.data.success){
                $location.url(response.data.url+paramQuery);
                $scope.handleCSEvent("useSearch");
            }
        });
    };
}]);
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
angular.module("rubedoBlocks").lazy.controller("ShoppingCartController",["$scope","RubedoPagesService","$rootScope","RubedoShoppingCartService", function($scope,RubedoPagesService,$rootScope,RubedoShoppingCartService){
    var me = this;
    var config = $scope.blockConfig;


    if (config.cartDetailPage){
        RubedoPagesService.getPageById(config.cartDetailPage).then(function(response){
            if (response.data.success){
                me.cartDetailPageUrl=response.data.url;
                $scope.rubedo.current.site.cartDetailPageUrl=response.data.url;
            }
        });
    }
    if (config.checkoutPage){
        RubedoPagesService.getPageById(config.checkoutPage).then(function(response){
            if (response.data.success){
                me.checkoutPageUrl=response.data.url;
            }
        });
    }
    me.blockId=($scope.block.id);
    me.cartIsEmpty=false;
    me.detailedCart={};
    me.noNone=function(string){
        if (string!='none'){return string}

    };
    me.displayCart=function(){
        RubedoShoppingCartService.getCart({includeDetail:true}).then(
            function(response){
                if (response.data.success){
                    if (response.data.shoppingCart.detailedCart&&response.data.shoppingCart.detailedCart.totalItems>0){
                        me.detailedCart=response.data.shoppingCart.detailedCart;
                        me.cartIsEmpty=false;
                    } else  {
                        me.cartIsEmpty=true;
                        me.detailedCart={};
                    }
                }
            }
        );
    };
    me.displayCart();
    me.addToCart=function(productId,variationId,amount){
        var options={
            includeDetail:true,
            productId:productId,
            variationId:variationId,
            amount:amount
        };
        RubedoShoppingCartService.addToCart(options).then(
            function(response){
                if (response.data.success){
                    if (response.data.shoppingCart.detailedCart&&response.data.shoppingCart.detailedCart.totalItems>0){
                        me.detailedCart=response.data.shoppingCart.detailedCart;
                        me.cartIsEmpty=false;
                    } else  {
                        me.cartIsEmpty=true;
                        me.detailedCart={};
                    }
                    $rootScope.$broadcast("shoppingCartUpdated",{emitter:me.blockId});
                }
																else {
																				angular.element('#notEnoughInStock').appendTo('body').modal('show');
																}
            }
        );
    };
    me.removeFromCart=function(productId,variationId,amount){
        var options={
            includeDetail:true,
            productId:productId,
            variationId:variationId,
            amount:amount
        };
        RubedoShoppingCartService.removeFromCart(options).then(
            function(response){
                if (response.data.success){
                    if (response.data.shoppingCart.detailedCart&&response.data.shoppingCart.detailedCart.totalItems>0){
                        me.detailedCart=response.data.shoppingCart.detailedCart;
                        me.cartIsEmpty=false;
                    } else  {
                        me.cartIsEmpty=true;
                        me.detailedCart={};
                    }
                    $rootScope.$broadcast("shoppingCartUpdated",{emitter:me.blockId});
                }
            }
        );
    };
    $scope.$on("shoppingCartUpdated",function(event,args){
        if (args&&args.emitter!=me.blockId){
            me.displayCart();
        }
    });

}]);

angular.module("rubedoBlocks").lazy.controller("ImageController",["$scope","$http","RubedoPagesService", function($scope,$http,RubedoPagesService){
    var me = this;
    var config = $scope.blockConfig;
    me.imageTitle = "";
    if (config.externalURL){
        me.url=config.externalURL;
    } else if (config.imageLink&&mongoIdRegex.test(config.imageLink)){
        RubedoPagesService.getPageById(config.imageLink).then(function(response){
            if (response.data.success){
                me.url=response.data.url;
            }
        });
    }

    $http.get("/api/v1/media/" + config.imageFile).then(
        function(response) {
            if(response.data.success) {
                me.imageTitle = response.data.media.fields.title;
            }
        }
    );

}]);