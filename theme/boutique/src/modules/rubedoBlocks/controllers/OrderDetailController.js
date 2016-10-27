angular.module("rubedoBlocks").lazy.controller('OrderDetailController',['$scope','RubedoOrdersService','$location','RubedoMediaService','RubedoPaymentService','$timeout','$http',
                                                                        function($scope,RubedoOrdersService,$location,RubedoMediaService,RubedoPaymentService,$timeout,$http){
    var me = this;
    var config = $scope.blockConfig;
    var orderId=$location.search().order;
    me.isAdmin=true;
    me.creatingBill = false;
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
                    //me.isAdmin= response.data.isAdmin;
                    if(me.order.status=="pendingPayment" && !me.isAdmin){
                        RubedoPaymentService.getPaymentInformation(orderId).then(
                            function(pmResponse){
                                if (pmResponse.data.success&&pmResponse.data.paymentInstructions){
                                    if(pmResponse.data.paymentInstructions.whatToDo=="displayRichText"&&pmResponse.data.paymentInstructions.richText){
                                        me.paymentRichText=pmResponse.data.paymentInstructions.richText;
                                    }else if(pmResponse.data.paymentInstructions.whatToDo=="redirectToUrl"&&pmResponse.data.paymentInstructions.url){
                                        me.showPaymentButton=true;
                                        me.handlePaymentButtonClick=function(){
                                            window.location.href=pmResponse.data.paymentInstructions.url;
                                        };
                                    }
                                    else if (pmResponse.data.paymentInstructions.whatToDo=="submitForm"&&pmResponse.data.paymentInstructions.url) {
                                        me.showPaymentForm=true;
                                        $scope.parametres = pmResponse.data.paymentInstructions.url;
                                        //console.log(pmResponse.data.paymentInstructions.url);
                                    }
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
                    $timeout(function(){
                        /*
                        kendo.drawing.drawDOM(angular.element("#orderForm"),{ margin: "1cm"}).then(function(group) {
                            me.creatingBill = false;
                            kendo.drawing.exportPDF(group);
                            //kendo.drawing.pdf.saveAs(group, me.billTitle+".pdf");
                        })*/
                        
                        
                        kendo.drawing.drawDOM(angular.element("#orderForm"),{ margin: "1cm"})
                            .then(function(root) {
                                // Chaining the promise via then
                                return kendo.drawing.exportPDF(root, {
                                    paperSize: "A4",
                                    landscape: true
                                });
                            })
                            .done(function(data) {
                                // Here 'data' is the Base64-encoded PDF file
                                /*kendo.saveAs({
                                    dataURI: data,
                                    fileName: "calendar.pdf"
                                });*/
                                var uploadOptions={
                                    typeId:"5811cc252456404b018bc74c",
                                     target:"5693b19bc445ecba018b4cb7",
                                     fields:{title:me.billTitle+'.pdf'}
                                };
                                RubedoMediaService.uploadMedia(data,options).then(
                                    function(response){
                                        if (response.data.success){
                                            console.log(response.data);
                                        }
                                    }
                                );
                            });
                        
                    },500);

                }
            }
        );
        

        
    }

}]);


