blocksConfig.form={
           "template": "/templates/blocks/form.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/form.js" ]
};




angular.module('rubedoDataAccess').factory('MusculinePaymentService', ['$http',function($http) {
    var serviceInstance={};
    serviceInstance.paymentService=function(produits, facturation, content){
        return($http({
                url:"/api/v1/musculinepayment",
                method:"POST",
                data:{
                    products:produits,
                    facturation:facturation,
                    content: content
                }
            }));
    };
    return serviceInstance;
}]);

