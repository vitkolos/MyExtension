angular.module("rubedoBlocks").lazy.controller('SurveyController',['$scope','$http',function($scope,$http){
    var me = this;
    var config = $scope.blockConfig;
    me.currentPage=false;
    me.isFinished=false;
    $scope.fieldEntity={};
    if(config.formId&&config.formId!=""){
        $http.get("/api/v1/survey/"+config.formId).then(
            function(response){
                me.survey=response.data.survey;

            }
        );
    }
    me.startSurvey=function(){
        me.currentPage=me.survey.formPages[0];
        me.currentPageIndex=0;
    };
    me.setPage=function(page,index){
        if(page.id!=me.currentPage.id){
            me.currentPage=page;
            me.currentPageIndex=index;
        }
    };
    me.doNext=function(){
        if(me.currentPageIndex<me.survey.formPages.length-1){
            me.currentPageIndex=me.currentPageIndex+1;
            me.currentPage=me.survey.formPages[me.currentPageIndex];
        } else {
            var results=angular.copy($scope.fieldEntity);
            var payload={
                status:"finished",
                data:results
            };
            $http({
                url:"/api/v1/survey/"+config.formId,
                method:"POST",
                data:{
                    survey:payload
                }
            }).then(
                function(responseFinish){
                    me.currentPage=false;
                    me.isFinished=true;
                }
            );
        }
    };
    me.hasNext=function(){
        return(me.currentPageIndex<me.survey.formPages.length-1);
    };
    me.handleConditionals=function(conditionals){
        var res=true;
        if(conditionals&&angular.isArray(conditionals)){
            angular.forEach(conditionals,function(cdt){
                if(res){
                    var value=angular.copy($scope.fieldEntity[cdt.field]);
                    if(angular.isString(value)){
                        value="'"+value+"'";
                    }
                    var cdtVal=angular.copy(cdt.value);
                    if (angular.isObject(cdtVal)){
                        cdtVal=cdtVal.value;
                    }
                    if (angular.isArray(cdtVal)){
                        var intermed=false;
                        angular.forEach(cdtVal,function(cdtSubval){
                            if(angular.isString(cdtSubval)){
                                cdtSubval="'"+cdtSubval+"'";
                            }
                            var op=angular.copy(cdt.operator);
                            if(op=="="){
                                op="==";
                            }
                            intermed=intermed||eval(value+" "+op+" "+cdtSubval)
                        });
                        res=res&&intermed;

                    } else {
                        if(angular.isString(cdtVal)){
                            cdtVal="'"+cdtVal+"'";
                        }
                        var op=angular.copy(cdt.operator);
                        if(op=="="){
                            op="==";
                        }
                        if(!eval(value+" "+op+" "+cdtVal)){
                            res=false;
                        }
                    }

                }
            });
        }
        return(res);
    };
}]);