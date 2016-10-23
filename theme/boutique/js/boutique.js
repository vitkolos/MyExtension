blocksConfig.footer={
    "template": "/templates/blocks/footer.html"
};
blocksConfig.footer_links={
    "template": "/templates/blocks/footer_links.html"
};
blocksConfig.productList={
    "template": "/templates/blocks/productList.html",
    "internalDependencies":["/src/modules/rubedoBlocks/controllers/ProductListController.js","/src/modules/rubedoBlocks/directives/PaginatorDirective.js"],
    "externalDependencies":['/components/OwlFonk/OwlCarousel/owl-carousel/owl.carousel.min.js']
};
blocksConfig.bg_image={
           "template": "/templates/blocks/bg_image.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/BgImageController.js"]
};
blocksConfig.boutiqueTop={
  "template":  "/templates/blocks/boutiqueTop.html",
  "internalDependencies":["/src/modules/rubedoBlocks/controllers/SearchFormController.js",
      "/src/modules/rubedoBlocks/controllers/ShoppingCartController.js",
      "/src/modules/rubedoBlocks/controllers/ImageController.js",
      "/src/modules/rubedoBlocks/controllers/AuthenticationController.js",
  ],
};
blocksConfig.simpleContact={
    "template": "/templates/blocks/simpleContact.html",
    "internalDependencies":["/src/modules/rubedoBlocks/controllers/simpleContact.js"]
};
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

 angular.module('rubedoBlocks').directive('jwplayer', ['$compile', function ($compile) {
    return {
        restrict: 'EC',
        link: function (scope, element, attrs) {
           var filmUrl = attrs.videoUrl;
            var id = 'random_player_' + Math.floor((Math.random() * 999999999) + 1),
            getTemplate = function (playerId) {
                      
                return '<div id="' + playerId + '"></div>';
            };
           var options = {
                      file: filmUrl,
                      modestbranding:0,
                      showinfo:1,
                      width:"100%",
                      aspectratio:"16:9"};
            element.html(getTemplate(id));
            $compile(element.contents())(scope);
            jwplayer(id).setup(options);
        }
    };
}]);