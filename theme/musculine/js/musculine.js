blocksConfig.form={
           "template": "/templates/blocks/form.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/form.js" ]
};


angular.module('rubedoDataAccess').factory('MusculinePaymentService', ['$http',function($http) {
    var serviceInstance={};
    serviceInstance.getParameters=function(options){
        return ($http.post("/api/v1/MusculinePayment",{
            params: options
        }));
    };
    return serviceInstance;
}]);

