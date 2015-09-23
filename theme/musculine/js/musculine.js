blocksConfig.form={
           "template": "/templates/blocks/form.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/form.js" ]
};


angular.module('rubedoDataAccess').factory('MusculinePaymentService', ['$http',function($http) {
    var serviceInstance={};
    serviceInstance.blocksConfig.form={
           "template": "/templates/blocks/form.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/form.js" ]
};


angular.module('rubedoDataAccess').factory('MusculinePaymentService', ['$http',function($http) {
    var serviceInstance={};
    serviceInstance.paymentService=function(produits, facturation, livraison){
        return($http({
                url:"/api/v1/musculinepayment",
                method:"POST",
                data:{
                    products:produits,
                    facturation:facturation,
                    livraison: livraison
                }
            }));
    };
    return serviceInstance;
}]);

=function(options){
        return($http({
                url:"/api/v1/musculinepayment",
                method:"POST",
                data:{
                    content:options
                }
            }));
    };
    return serviceInstance;
}]);

