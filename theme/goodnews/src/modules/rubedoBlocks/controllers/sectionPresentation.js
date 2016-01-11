angular.module("rubedoBlocks").lazy.controller("PresentationController",['$scope','RubedoPagesService',function($scope,RubedoPagesService){
    var me = this;
    $scope.config=angular.copy($scope.blockConfig);
    me.inputFields=[ ];
    $scope.fieldEntity={ };
    me.columns = config.columns ? 'col-md-'+(12/config.columns):'col-md-12';

    $scope.fieldInputMode=true;
    var fields=angular.copy($scope.fieldEntity);
    
    if (config.linkedPage&&mongoIdRegex.test(config.linkedPage))   {
		    RubedoPagesService.getPageById(config.linkedPage).then(function(response){
				    if (response.data.success){
					    me.pageLink=response.data.url;
				    }
			    });
    };
			
	
}]);