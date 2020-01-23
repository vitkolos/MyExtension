angular.module("rubedoBlocks").lazy.controller("BgImageController",["$scope","RubedoPagesService", function($scope,RubedoPagesService){
    var me = this;
    var config = $scope.blockConfig;
    
    // parse custom css
    me.css = {'width':'100%', 'margin-bottom': '0'};
    if ($scope.block.code) {
        console.log("GOT CODE !")
        let res = /css(\{[^\}]+\})/g.exec($scope.block.code);
        console.log("regex result", res)
        if (res && res.length > 1) {
            try {
                let custom_css = JSON.parse(res[1]);
                console.log("custom_css", custom_css)
                me.css = {...me.css, ...custom_css}
                console.log("me", me, me.css);
            } catch(e) {
                console.log("Error in JSON parse for block.code : ", $scope.block)
            }
        } 
    }
    
    if (config.externalURL){
        me.url=config.externalURL;
    } else if (config.imageLink&&mongoIdRegex.test(config.imageLink)){
        RubedoPagesService.getPageById(config.imageLink).then(function(response){
            if (response.data.success){
                me.url=response.data.url;
            }
        });
    }
    
    
    if(config.imageFile && (!$scope.rubedo.current.page.metaImage || $scope.rubedo.current.page.metaImage=="")) {
        //$scope.rubedo.current.page.image = $scope.rubedo.imageUrl.getUrlByMediaId(config.imageFile,{width:'800px'});
        $scope.rubedo.setPageMetaImage(config.imageFile);
    }
    $scope.clearORPlaceholderHeight();

}]);