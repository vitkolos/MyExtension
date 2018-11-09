angular.module("rubedoBlocks").lazy.controller("ImageController",["$scope","$http","RubedoPagesService", function($scope,$http,RubedoPagesService){
    var me = this;
    var config = $scope.blockConfig;
    me.imageTitle = "";
    console.log('image config', $scope.block, $scope.blockConfig)

    // default media type is image, this will be updated after media query
    me.mediaType = 'image';

    // Si on a spécifié un lien quand on clique sur le media, on le charge
    if (config.externalURL){
        me.url=config.externalURL;
    } else if (config.imageLink && mongoIdRegex.test(config.imageLink)){
        RubedoPagesService.getPageById(config.imageLink).then(function(response){
            if (response.data.success){
                me.url=response.data.url;
            }
        });
    }
    
    // On charge le media depuis l'API media
    if(config.imageFile) {
        $http.get("/api/v1/media/" + config.imageFile).then(
            function(response) {
                console.log('media api result', response)
                if(response.data.success) {
                    let media = response.data.media;
                    me.imageTitle = (media.fields && media.fields.title) ? media.fields.title: media.title;
                    $scope.clearORPlaceholderHeight();
                    // if it's a PDF
                    if (media.typeId == '55530a0a45205eac0c368078') {
                        me.mediaType = 'pdf';
                        me.url = '/file?file-id=' + media.originalFileId;
                    }
                }
            }
        );
    }

}]);