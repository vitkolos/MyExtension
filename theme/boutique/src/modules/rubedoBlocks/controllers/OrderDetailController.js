angular.module("rubedoBlocks").lazy.controller('OrderDetailController',['$scope','RubedoOrdersService','$location','RubedoMediaService','RubedoPaymentService','$timeout',
                                                                        function($scope,RubedoOrdersService,$location,RubedoMediaService,RubedoPaymentService,$timeout){
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
                        kendo.drawing.drawDOM(angular.element("#orderForm")).then(function(group) {
                            me.creatingBill = false;
                            kendo.drawing.pdf.toBlob(group, function(blob){
                                // you can now upload it to a server
                                // this form simulates an <input type="file" name="pdfFile" />
                                var form = new FormData();
                                form.append("pdfFile", blob);
                                //console.log(form);
                                var uploadOptions={
                                    typeId:"5811cc252456404b018bc74c",
                                     target:"5693b19bc445ecba018b4cb7",
                                     fields:{title:me.billTitle}
                                };
                                RubedoMediaService.uploadMedia(pdfFile,uploadOptions).then(
                                    function(response){
                                        if (response.data.success){
                                            console.log(response.data);
                                        } else {
                                        }
                                    },
                                    function(response){
                                        
                                    }
                                );
                                
                                
                                
                                
                                
                            });
                            
                            //kendo.drawing.pdf.saveAs(group, me.billTitle+".pdf");
                        })},500);

                }
            }
        );
        

        
    }

}]);


