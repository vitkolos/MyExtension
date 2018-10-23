angular.module("rubedoBlocks").lazy.controller('OrderDetailController',['$scope','RubedoOrdersService','$location','RubedoMediaService','RubedoPaymentService','$timeout','$http','RubedoUsersService',
                                                                        function($scope,RubedoOrdersService,$location,RubedoMediaService,RubedoPaymentService,$timeout,$http,RubedoUsersService){
    var me = this;
    var config = $scope.blockConfig;
    var orderId=$location.search().order;
    me.isAdmin=false;
    me.creatingBill = false;
    me.status = ["pendingPayment","payed","cancelled","shipped","preparation","subscribed"];
    if (orderId){
        RubedoOrdersService.getOrderDetail(orderId).then(
            function(response){
                if (response.data.success){
                    me.order=response.data.order;
                    if (me.order.billDocument){
                        RubedoMediaService.getMediaById(me.order.billDocument,{}).then(
                            function(mediaResponse){
                                if (mediaResponse.data.success){
                                    me.billDocumentUrl=mediaResponse.data.media.url;
                                }
                            }
                        );
                    }
                  // si c'est une commande de l'admin, il doit la voir comme un client normal !
                    if ($scope.rubedo.current.user && response.data.order.createUser.id != $scope.rubedo.current.user.id) me.isAdmin= response.data.isAdmin;
                    if (me.order.status=="pendingPayment" && !me.isAdmin) {
                        RubedoPaymentService.getPaymentInformation(orderId).then(
                            function(pmResponse) {
                                if (pmResponse.data.success && pmResponse.data.paymentInstructions) {
                                    if (pmResponse.data.paymentInstructions.whatToDo == "displayRichText" && pmResponse.data.paymentInstructions.richText) {
                                        me.paymentRichText = pmResponse.data.paymentInstructions.richText;
                                    } else if(pmResponse.data.paymentInstructions.whatToDo == "redirectToUrl" && pmResponse.data.paymentInstructions.url) {
                                        me.showPaymentButton = true;
                                        me.handlePaymentButtonClick = function() {
                                            window.location.href = pmResponse.data.paymentInstructions.url;
                                        };
                                    }
                                    else if (pmResponse.data.paymentInstructions.whatToDo == "submitForm" && pmResponse.data.paymentInstructions.url) {
                                        me.showPaymentForm = true;
                                        $scope.parametres = pmResponse.data.paymentInstructions.url;
                                    }
                                    else if (pmResponse.data.paymentInstructions.whatToDo=="submitPaypalForm") {
                                        me.showPaypalForm=true;
                                        $scope.parametres = pmResponse.data.paymentInstructions.url;
                                    }
                                }
                            }
                        );
                    }
                    // pour les administrateurs, accéder aux infos du créateur de la commande
                    if(me.isAdmin && me.order) {
                        RubedoUsersService.getUserById(me.order.createUser.id).then(
                            function(response){
                                if (response.data.success){
                                    me.orderUser = response.data.user;
                                }
                            }
                        );
                    }
                    //$scope.clearORPlaceholderHeight();
                }
            }
        );
    }
    me.generateBill = function(){
        var options = {}
        options.allCommands = true;
        options.onlyTotal = true;
        RubedoOrdersService.getMyOrders(options).then(
            function(response){
                if (response.data.success){
                   me.billTitle = "FA2" + ('00000'+(response.data.total+1)).substring((response.data.total).length);
                    me.creatingBill = true;                        
                    kendo.pdf.defineFont({
                        "Merriweather"             : "theme/cte/fonts/merriweather.ttf" // this is a URL
                    })
                    $timeout(function(){
                        
                        kendo.drawing.drawDOM(angular.element("#orderForm"))
                            .then(function(group) {
                                // Chaining the promise via then
                                group.options.set("pdf", {
                                    margin: {
                                        left   : "20mm",
                                        top    : "40mm",
                                        right  : "20mm",
                                        bottom : "40mm"
                                    }
                                });

                                kendo.drawing.pdf.toBlob(group, function(blob){
                                    var file = new File([blob], me.billTitle+".pdf", {type: "application/pdf", lastModified: Date.now()});
                                    // you can now upload it to a server
                                    // this form simulates an <input type="file" name="pdfFile" />
                                    var uploadOptions = {
                                        typeId:"5811cc252456404b018bc74c",
                                        target:"5693b19bc445ecba018b4cb7",
                                        fields:{title:me.billTitle+".pdf"}
                                    }
                                    var form = new FormData();
                                    form.append("file", file);

                                    $http.post("/api/v1/media", form, {
                                        transformRequest: angular.identity,
                                        params:uploadOptions,
                                        headers: {'Content-Type': undefined}
                                    }).then(function(response){
                                        me.creatingBill = false;
                                        me.order.billDocument = response.data.media.id;
                                        RubedoMediaService.getMediaById(me.order.billDocument,{}).then(
                                            function(mediaResponse){
                                                if (mediaResponse.data.success){
                                                    me.billDocumentUrl=mediaResponse.data.media.url;
                                                    RubedoOrdersService.updateOrder(me.order).then(
                                                        function(response){
                                                            if (response.data.success){
                                                                console.log(response.data.order);
                                                                }
                                                        });
                                                }
                                            }
                                        );
                                    });
                                });
                            })
                            
                       

                    },500);

                }
            }
        );
        

        
    }

    me.updateStatus = function(){
        RubedoOrdersService.updateOrder(me.order).then(
            function(response){
                if (response.data.success){
                    console.log("commande mise à jour");
                }
            });
    }




}]);


