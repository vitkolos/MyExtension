angular.module("rubedoBlocks").lazy.controller("ShoppingCartController",["$scope","RubedoPagesService","$rootScope","RubedoShoppingCartService", function($scope,RubedoPagesService,$rootScope,RubedoShoppingCartService){
    var me = this;
    var config = $scope.blockConfig;
    //alert (config.toSource());
    //console.log(config);

    // si ca charge mal:
    //if (config.displayMode!='detail'){
    //    config.displayMode='button';
    //}
    //if (config.cartDetailPage){
    //    config.cartDetailPage='55c8777145205ef317c62e2d';
    //}
    //if (config.checkoutPage){
    //    config.checkoutPage='55c8ac3545205e972cc62e12';
    //}

    if (config.cartDetailPage){
        RubedoPagesService.getPageById(config.cartDetailPage).then(function(response){
            if (response.data.success){
                me.cartDetailPageUrl=response.data.url;
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