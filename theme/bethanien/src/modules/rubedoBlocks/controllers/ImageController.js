angular.module("rubedoBlocks").lazy.controller("ImageController",["$scope","$http","RubedoPagesService","Upload", function($scope,$http,RubedoPagesService,Upload){
    var me = this;
    var config = $scope.blockConfig;
    me.imageTitle = "";
    console.log('image config', $scope.block, $scope.blockConfig)

    me.mediaTypes = {
        'image': '545cd95245205e91168b45b1',
        'video': '545cd95245205e91168b45b3',
        'pdf': '55530a0a45205eac0c368078',
        'audio': '545cd95245205e91168b45af',
    }

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
                    if (media.typeId ==  me.mediaTypes['pdf']) {
                        me.mediaType = 'pdf';
                        me.url = '/file?file-id=' + media.originalFileId;
                    }
                }
            }
        );
    }

    me.file = "";
    me.upload = function(file) {
        if (!file) {console.log('fichier vide à uploader');return}

        // on prépare les metadata du fichier
        console.log("file upload", file);
        let typeId = me.mediaTypes['image'];
        if (/^video\//gi.test(file.type)) typeId =  me.mediaTypes['video'];
        if (file.type == 'application/pdf') typeId =  me.mediaTypes['pdf'];
        if (/^audio\//gi.test(file.type)) typeId =  me.mediaTypes['audio'];

        // on upload le fichier
        Upload.upload({
            url: '/api/v1/media',
            method: 'POST',
            params:{
                typeId,
                userWorkspace:true, //on utilise le main workspace de l'utilisateur
                fields:{title:file.name}
            },
            file,
            headers: {'Content-Type': file.type}
        }).then(function (resp) {
            console.log('upload ok', resp)
            // maintenant on update le fichier courant
            
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        });
    }

}]);