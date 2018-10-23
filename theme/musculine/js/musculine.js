blocksConfig.form={
           "template": "/templates/blocks/form.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/form.js" ]
};
blocksConfig.simpleContact={
           "template": "/templates/blocks/simpleContact.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/simpleContact.js"]
};


angular.module('rubedoDataAccess').factory('MusculinePaymentService', ['$http',function($http) {
    var serviceInstance={};
    serviceInstance.paymentService=function(produits, facturation, content){
        return($http({
            url:"/api/v1/musculinepayment",
            method:"POST",
            data:{
                products: produits,
                facturation: facturation,
                content: content
            }
        }));
    };
    return serviceInstance;
}]);

angular.module('rubedoDataAccess').factory('RubedoMailService', ['$http',function($http) {
    var serviceInstance={};
    serviceInstance.sendMail=function(payload){
        return ($http({
            url:"api/v1/mail",
            method:"POST",
            data : payload
        }));
    };
    return serviceInstance;
}]);