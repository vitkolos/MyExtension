blocksConfig.imageBatchUpload={
           "template": "/templates/blocks/imageBatchUpload.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/imageBatchUploadController.js"]
};
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
blocksConfig.ordersList={
           "template": "/templates/blocks/ordersList.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/OrdersListController.js"]
};
blocksConfig.boutiqueTop={
  "template":  "/templates/blocks/boutiqueTop.html",
  "internalDependencies":["/src/modules/rubedoBlocks/controllers/SearchFormController.js",
      "/src/modules/rubedoBlocks/controllers/ShoppingCartController.js",
      "/src/modules/rubedoBlocks/controllers/ImageController.js",
      "/src/modules/rubedoBlocks/controllers/AuthenticationController.js"
  ],
};
blocksConfig.simpleContact={
    "template": "/templates/blocks/simpleContact.html",
    "internalDependencies":["/src/modules/rubedoBlocks/controllers/simpleContact.js"]
};
blocksConfig.orderDetail = {
            "template": "/templates/blocks/orderDetail.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/OrderDetailController.js"],
            "externalDependencies":["https://kendo.cdn.telerik.com/2016.3.914/js/kendo.all.min.js","https://kendo.cdn.telerik.com/2015.2.805/js/pako_deflate.min.js"]
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


angular.module('rubedoDataAccess').factory('RubedoOrdersService',['$http','ipCookie',function($http,ipCookie){
    var serviceInstance = {};
    var config = {baseUrl:'/api/v1'};
    serviceInstance.getMyOrders=function(options){
        return ($http.get(config.baseUrl+"/ecommerce/orders",{
            params:options
        }));
    };
    serviceInstance.getOrderDetail=function(id){
        return ($http.get(config.baseUrl+"/ecommerce/orders/"+id));
    };
    serviceInstance.updateOrder=function(order){
        return ($http({
            url:config.baseUrl+"/ecommerce/orders/"+order.id,
            method:"PATCH",
            data : {
                order:order
            }
        }));
    };
    serviceInstance.createOrder=function(options){
        if (ipCookie("shoppingCartToken")){
            options.shoppingCartToken=ipCookie("shoppingCartToken");
        }
        return ($http({
            url:config.baseUrl+"/ecommerce/orders",
            method:"POST",
            data : options
        }));
    };
    return serviceInstance;
}]);

 angular.module('rubedoBlocks').directive('jwplayer', ['$compile', function ($compile) {
    return {
        restrict: 'EC',
        link: function (scope, element, attrs) {
           var filmUrl = attrs.videoUrl;
            var id = 'random_player_' + Math.floor((Math.random() * 999999999) + 1);
            getTemplate = function (playerId) {
                      
                return '<div id="' + playerId + '"></div>';
            };
											var duration = 0;
											var options = {
																						file: filmUrl,
																						modestbranding:0,
																						showinfo:1,
																						width:"100%",
																						aspectratio:"16:9"

											};

											
            element.html(getTemplate(id));
            $compile(element.contents())(scope);
												setTimeout(function(){
																						jwplayer(id).setup(options);										
											}, 200);
    
        }
    };
}]);
	angular.module('rubedoBlocks').filter('currentyear',['$filter',  function($filter) {
    return function() {
        return $filter('date')(new Date(), 'yyyy');
    };
}])
	 angular.module('rubedoBlocks').directive('audioplayer', ['$compile', function ($compile) {
    return {
        restrict: 'EC',
        link: function (scope, element, attrs) {
           var filmUrl = attrs.videoUrl;
											var audio = attrs.play;
            var id = 'random_player_' + Math.floor((Math.random() * 999999999) + 1);
            getTemplate = function (playerId) {
                      
                return '<div id="' + playerId + '"></div>';
            };
											var duration = 0;
											var options = {
																						file: filmUrl,
																						modestbranding:0,
																						showinfo:1,
																						width:"100%",
																						aspectratio:"16:9"

											};

											
            element.html(getTemplate(id));
            $compile(element.contents())(scope);
												setTimeout(function(){
																						jwplayer(id).setup(options);
																						
																						//console.log( jwplayer(id).getDuration());
																							jwplayer(id).on('ready', function(){
																																	if (duration == 0) {
																																														// we don't have a duration yet, so start playing
																																												jwplayer(id).play();																																												
																																	}
																						});

																						jwplayer(id).on('time', function(event) {
																																	//console.log(event);
																																	if (duration == 0) {
																																	// we don't have a duration, so it's playing so we can discover it...
																																												jwplayer(id).setMute(true);
																																												jwplayer(id).play(false);
																																												duration = event.duration;
																																												scope.$apply(function () {
																																																							scope.piste.duration = event.duration;
																																																							//console.log(scope.piste.duration);
																																												});
																																	// do something with duration here
																															} else {
																																												if (event.position>30) {
																																																								jwplayer(id).stop();
																																												}
																															}
																						});																											
											}, 200);
											
												
											/*watch for play update*/
            scope.$watch(function () {
                    return attrs.play;
                }, function (newValue, oldValue) {
																						jwplayer(id).play(newValue);
																						if(jwplayer(id).getMute()) jwplayer(id).setMute(false);
																						//console.log(jwplayer(id).getDuration());

                });      
        }
    };
}]);