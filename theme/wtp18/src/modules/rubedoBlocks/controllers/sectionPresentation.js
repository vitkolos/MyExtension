angular.module("rubedoBlocks").lazy.controller("PresentationController",['$scope','RubedoPagesService',function($scope,RubedoPagesService){
    var me = this;
    var blockConfig=$scope.blockConfig;
    me.inputFields=[ ];
    $scope.fieldEntity={ };
    me.columns = blockConfig.columns ? 'col-sm-'+(12/blockConfig.columns):'col-xs-6';
    console.log('colonnes');
    console.log(blockConfig.columns);
	

    $scope.fieldInputMode=true;
    var fields=angular.copy($scope.fieldEntity);
    
    if (blockConfig.linkedPage&&mongoIdRegex.test(blockConfig.linkedPage))   {
	RubedoPagesService.getPageById(blockConfig.linkedPage).then(function(response){
		if (response.data.success){
			me.pageLink=response.data.url;
		}
	});
    };
	$scope.clearORPlaceholderHeight();		
	
}]);

