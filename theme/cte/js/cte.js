blocksConfig.simpleContact={
           "template": "/templates/blocks/simpleContact.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/simpleContact.js"]
};
blocksConfig.facebook={
           "template": "/templates/blocks/facebook.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/FacebookController.js"]
};
blocksConfig.d3Script= {
            "template": "/templates/blocks/d3Script.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/D3ScriptController.js"],
            "externalDependencies":['/components/mbostock/d3/d3.min.js','//cdnjs.cloudflare.com/ajax/libs/topojson/1.6.9/topojson.min.js']
        },
blocksConfig.buttonToPage={
           "template": "/templates/blocks/buttonToPage.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/buttonToPage.js"]
};
blocksConfig.form={
           "template": "/templates/blocks/formInscription.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/formInscription.js"]
};
blocksConfig.bg_image={
           "template": "/templates/blocks/bg_image.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/BgImageController.js"]
};
blocksConfig.footer={
           "template": "/templates/blocks/footer.html"
};
blocksConfig.contentDetail = {
            "template": "/templates/blocks/contentDetail.html",
            "externalDependencies":['//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-553e2efb75d1d292'],
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/ContentDetailController.js","/src/modules/rubedoBlocks/directives/DisqusDirective.js"]
        },
angular.module('rubedoBlocks').filter('cleanUrl', function () {
    return function (input) {
        return input.replace("//","/");
     };
  });

angular.module('rubedoBlocks').controller("AudioFileController",["$scope","RubedoMediaService",function($scope,RubedoMediaService){
        var me=this;
        var mediaId=$scope.audioFileId;
         me.displayMedia=function(){
            if (me.media&&me.media.originalFileId){

                        me.jwSettings={
                            primary:"flash",
                            width:"100%",
                            height:40,
                            file:me.media.url,
                        };
                        setTimeout(function(){jwplayer("audio"+me.media.originalFileId).setup(me.jwSettings);}, 200);
            }
        };
        if (mediaId){
            RubedoMediaService.getMediaById(mediaId).then(
                function(response){
                    if (response.data.success){
                        me.media=response.data.media;
                        me.displayMedia();
                    }
                }
            );
        }
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

 angular.module('rubedoBlocks').directive('balanceText', function ($timeout) {
    return {
        restrict: 'C',
        link:  function (scope, element, attr) {
           function balanceText() {
                      element.balanceText();
            }
            $timeout(balanceText);
                    
        }
    };
});

angular.module('rubedoBlocks').directive('loadModal', function () {
    return {
        restrict: 'A',
        link: function(scope, $elm, attrs) {
            $elm.bind('click', function(event) {
                event.preventDefault();
                /*angular.element('#myModal iframe').attr('src', src);*/
                angular.element('#myModal').appendTo('body').modal('show');
            });
            scope.dismiss = function() {
                      angular.element('#myModal').modal('hide');
           };
        }
    }
});



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
    angular.module('rubedoDataAccess').factory('TaxonomyService', ['$http',function($http) {
        var serviceInstance={};
        serviceInstance.getTaxonomyByContentId=function(pageId,contentIds){
            return ($http.get("/api/v1/taxonomy",{
                params:{
                    pageId:pageId,
                    type:contentIds
                }
            }));
        };
        return serviceInstance;
    }]);


  angular.module('rubedoBlocks').directive('focusOnClick', function ($timeout) {
    return {
         link: function ( scope, element, attrs ) {
            scope.$watch( attrs.ngFocus, function ( val ) {
                if ( angular.isDefined( val ) && val ) {
                    $timeout( function () { element[0].focus();element[0].value=""; } );
                }
            }, true);
         }}
  });
angular.module('rubedoBlocks').directive('addthisToolbox', ['$timeout', function($timeout) {
  return {
    restrict : 'A',
	  transclude : true,
	  replace : true,
	  template : '<div ng-transclude></div>',
	  link : function($scope, element, attrs) {
		  $timeout(function () {
        addthis.init();
        addthis.toolbox(angular.element('.addthis_toolbox').get(), {}, {
          url: attrs.url,
          title : attrs.title,
          description : 'Checkout this awesome post on blog.me'        
        });
      });
	  }
	};
}]);