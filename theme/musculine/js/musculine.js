blocksConfig.form={
           "template": "/templates/blocks/form.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/form.js" ]
};


angular.module('rubedoDataAccess').factory('PaymentService', ['$http',function($http) {
    var serviceInstance={};
    serviceInstance.getParameters=function(options){
        return ($http.get("/api/v1/TestPaybox",{
            params: options
        }));
    };
    return serviceInstance;
}]);

