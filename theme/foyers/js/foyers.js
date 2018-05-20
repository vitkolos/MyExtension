blocksConfig.imageBatchUpload={
           "template": "/templates/blocks/imageBatchUpload.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/imageBatchUploadController.js"]
};
blocksConfig.simpleContact={
           "template": "/templates/blocks/simpleContact.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/simpleContact.js"]
}; 
blocksConfig.carrousel2={
           "template": "/templates/blocks/carrousel_fullWidth.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/carrousel_fullWidth.js"]
};
blocksConfig.bg_image={
           "template": "/templates/blocks/bg_image.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/BgImageController.js"]
};
angular.module('rubedoBlocks').filter('cleanUrl', function () {
    return function (input) {
        return input.replace("//","/");
     };
  });


angular.module('rubedoBlocks').filter('cleanHour', function () {
    return function (input) {
    	var hour="";
    	if(input.split('AM').length>1){
    		hour=input.split('AM')[0];
    	}
    	else if(input.split('PM').length>1){
    		var hours = input.split('PM')[0].split(':')[0];
    		var mins = input.split('PM')[0].split(':')[1];
    		hour=(parseInt(hours)+12)+":"+mins
    		
    	}  
    	else hour = input;
        return hour;
     };
  });
angular.module('rubedoBlocks').filter('currentyear',['$filter',  function($filter) {
    return function() {
        return $filter('date')(new Date(), 'yyyy');
    };
}])
angular.module('rubedoBlocks').filter('timediff',['$filter','$interval',  function($filter,$interval) {
    return function(nextDate,format) {
												/*var fireDigestEverySecond = function () {
																						$timeout(function () {fireDigestEverySecond()}, 1000);
																		};
											
											fireDigestEverySecond();*/
												//$interval(function (){timeDiff()}, 1000);
												var dateDiff = function(){
																						var currentDate = new Date();
																						var endDate = new Date(nextDate);
																						var miliseconds = endDate-currentDate;
																						/*if (format=='days') {
																																	return window.Math.round(miliseconds/(1000*60*60));
																						}
																						else if (format=='min') {
																																	return window.Math.round(miliseconds/(1000*60*60));
																						}*/
											
																						var seconds = miliseconds/1000;
																						var minutes = seconds/60;
																						var hours = minutes/60;
																						var days = window.Math.floor(miliseconds/(24*60*60*1000));
																						var hours = window.Math.floor((miliseconds-days*(24*60*60*1000))/(60*60*1000));
																						var min = window.Math.floor((miliseconds-days*(24*60*60*1000)-hours*(60*60*1000))/(60*1000));
																						if (format=='day') {
																																	return days;
																						}
																						else if (format=='hour') {
																																	return hours;
																						}
																						else if (format=='min') {
																																	return min;
																						}
																						else if (format=='sec') {
																																	return window.Math.floor((miliseconds-days*(24*60*60*1000)-hours*(60*60*1000)-min*(60*1000))/(1000));
																						}
												};
											return dateDiff();
											};
}])
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
	
	/*filtre pour renvoyer le format de la date de début d'une proposition bien formatée*/
angular.module('rubedoBlocks').filter('dateRange', function ($filter) {
    return function(startDate, endDate, rangeFormat,from,to,lang){
	//console.log($scope.rubedo);
	var locale = lang || 'default';
	var format = rangeFormat || 'long';
	var formatOfDate =  'd MMM yyyy';
	var isSameDay = false;
	var start = new Date(startDate*1000);
	var end = new Date(endDate*1000);
	var longFormat="";//format complet de date
	switch(locale){
		case 'hu': longFormat = 'yyyy. MMM d.';break;
		case 'de': longFormat = 'd. MMM yyyy';break;
		default : longFormat = 'd MMM yyyy';
	}
	if (start.getFullYear() != end.getFullYear()) {
	    formatOfDate = longFormat;
	}
	else if (start.getMonth() != end.getMonth()) {
		if (locale=='de') formatOfDate = 'd. MMM';
		else formatOfDate = 'd MMM';
	}
	else  if(start.getDate() == end.getDate()){
		if (locale=='de') formatOfDate = 'd.';
	    	else formatOfDate = 'd';
	    	isSameDay=true;
	}
	else {
		switch(locale){
			case 'hu': formatOfDate = 'yyyy. MMM d';longFormat='d.';break;
			case 'de': longFormat= 'd. MMM yyyy';formatOfDate='d.';break;
			default : formatOfDate = 'd';
		}
	}
	if (format == 'short') {
		if(isSameDay) formattedDate= $filter('date')(end,longFormat);	  
	    	else formattedDate= $filter('date')(start,formatOfDate) + "-"+$filter('date')(end,longFormat);	    
	}
	else {
           if(isSameDay) formattedDate= $filter('date')(end,longFormat);	  
	   else formattedDate= from +" "+$filter('date')(start,formatOfDate) + " "+to+" "+$filter('date')(end,longFormat);	    
	}
	return formattedDate;
    }
  });

angular.module('rubedoDataAccess').factory('TaxonomyService', ['$http',function($http) {
        var serviceInstance={};
	serviceInstance.getTaxonomyByVocabulary=function(vocabularies){
            return ($http.get("/api/v1/taxonomies",{
                params:{
                    vocabularies:vocabularies
                }
            }));
	};
        return serviceInstance;
    }]);
angular.module('rubedoDataAccess').factory('InscriptionService', ['$http',function($http) {
    var serviceInstance={};
    serviceInstance.inscrire=function(inscription,workspace,traductions){
        return($http({
                url:"/api/v1/inscription",
                method:"POST",
                data:{
                    inscription:inscription,
                    workspace: workspace
                }
            }));
    };
				serviceInstance.exportInscriptions=function(payload){
											return ($http.get("/api/v1/inscription",{
																		params: payload
												}));
							};
    return serviceInstance;
}]);

angular.module('rubedoBlocks').filter('tags', function() {
    return function(contents, tag) {
           if (tag=="") {
                      return contents;
           }
           else {
                      var contentList=[];
                      angular.forEach(contents, function(content){
                         if(content.taxonomy['5524db6945205e627a8d8c4e'] && (content.taxonomy['5524db6945205e627a8d8c4e']).indexOf(tag) != -1){
                                    contentList.push(content);
                         }
                      })
                      return contentList;
           }
    };
});
angular.module('rubedoDataAccess').factory('PaymentService', ['$http',function($http) {
    var serviceInstance={};
    serviceInstance.payment=function(payload){
        return($http({
                url:"/api/v1/payment",
                method:"POST",
                data:payload
            }));
    };
    return serviceInstance;
}]);
angular.module('rubedoDataAccess').factory('RubedoPaymentMeansService',['$http',function($http){
           var serviceInstance = {};
           serviceInstance.getPaymentMeansDons=function(){
               return ($http.get("/api/v1/ecommerce/paymentmeans",{
                      params: {
                         filter_by_site:true,
                         type:"dons"
                      }
                }));
           };
           serviceInstance.getPaymentMeansPaf=function(){
               return ($http.get("/api/v1/ecommerce/paymentmeans",{
                      params: {
                         filter_by_site:true,
                         type:"paf"
                      }
                }));
           };
           return serviceInstance;
}]);
	
	
	angular.module('rubedoFields').filter('firstword', function() {
        return function(input, splitIndex) {
            // do some bounds checking here to ensure it has that index
											if (!input) {
																						return "";
											}
											else	if (!splitIndex) {
																						 return input.split(' ')[0];
												}
												else return input.split(' ').slice(1).join(' ');
        }
    });



angular.module("rubedo").directive("ascensor2",['$document',function($document){
											return {
																						restrict: "A",
																						template:'<div id="ascensorBuilding"><div ng-repeat="column in row.columns track by $index" id="floor{{$index}}" ng-include="rubedo.componentsService.getColumnTemplate(column.customTemplate)"></div></div>',
																						link: function(scope,element, attrs) {
																																	var targetElSelector="#ascensorBuilding";
																																	var ascensor = angular.element(targetElSelector);
																																	angular.element(targetElSelector).css( "visibility", "hidden" );
																																	var initAscensor = function(){
																																												var ascensor = angular.element(targetElSelector);
																																												ascensor.css("visibility", "visible");
																																												var options={
																																																							direction: [[0,0],[0,1],[1,0],[1,1]],
																																																							time: 1900,
																																																								easing: 'easeInOutCubic',
																																																								swipeNavigation : true,
																																																								wheelNavigation :true
																																												};
																																												ascensor.ascensor(options);
																																												//sur un réseau lent, l'initialisation ne se fait pas bien -> les élements ne sont pas dimensionnés. dans ce cas faire un refresh 
																																												if (!angular.element(targetElSelector + " #floor1" ).css("width")) {

																																																							setTimeout(function(){
																																																																		angular.element(targetElSelector).data('ascensor').refresh();
																																																														},400);
																																												}
																																	}
																																	setTimeout(function(){
																																												initAscensor();
																																								},400);
																																	scope.slideTo = function(direction){
																																												var ascensorInstance = angular.element(targetElSelector).data('ascensor');   // Access instance
																																												ascensorInstance.scrollToDirection(direction);
																																	}
																						}
											}
}]);
angular.module("rubedo").directive("ascensor",['$document',function($document){
											return {
																						restrict: "A",
																						template:'<div id="ascensorBuilding"><div ng-repeat="column in row.columns track by $index" id="floor{{$index}}" ng-include="rubedo.componentsService.getColumnTemplate(column.customTemplate)"></div></div>',
																						link: function(scope,element, attrs) {
																																	var targetElSelector="#ascensorBuilding";
																																	var ascensor = angular.element(targetElSelector);
																																	angular.element(targetElSelector).css( "visibility", "hidden" );
																																	var initAscensor = function(){
																																												var ascensor = angular.element(targetElSelector);
																																												ascensor.css("visibility", "visible");
																																												var options={
																																																							direction: [[0,0],[1,0],[0,1],[1,1]],
																																																							time: 1900,
																																																								easing: 'easeInOutCubic',
																																																								swipeNavigation : true,
																																																								wheelNavigation :true
																																												};
																																												ascensor.ascensor(options);
																																												//sur un réseau lent, l'initialisation ne se fait pas bien -> les élements ne sont pas dimensionnés. dans ce cas faire un refresh 
																																												if (!angular.element(targetElSelector + " #floor1" ).css("width")) {

																																																							setTimeout(function(){
																																																																		angular.element(targetElSelector).data('ascensor').refresh();
																																																														},400);
																																												}
																																	}
																																	setTimeout(function(){
																																												initAscensor();
																																								},400);
																																	scope.slideTo = function(direction){
																																												var ascensorInstance = angular.element(targetElSelector).data('ascensor');   // Access instance
																																												ascensorInstance.scrollToDirection(direction);
																																	}
																						}
											}
}]); 
angular.module("rubedo").directive("swiper",[function(){
											return {
																						restrict: "A",
																						link: function(scope,element, attrs) {
																																	var initCarousel=function(){
																																												var owlOptions={
																																												slideSpeed : 200,
																																																//responsiveBaseWidth:targetElSelector,
																																																singleItem:true,
																																																pagination:false,
																																																navigation: false,
																																																autoPlay: false, 
																																																//stopOnHover: blockConfig.stopOnHover,
																																																//paginationNumbers:blockConfig.showPagingNumbers,
																																																//navigationText: ['<span class="arrow back"><a></a></span>','<span class="arrow forward"><a></a></span>'],
																																																lazyLoad:false
																																												};
																																												element.owlCarousel(owlOptions);
																																												console.log("element");
																																												console.log(element);
																																												console.log("element.owlCarousel(owlOptions)");
																																												console.log(element.owlCarousel(owlOptions));
																																												console.log("owlOptions");
																																												console.log(owlOptions);
																																												//angular.element(targetElSelector).owlCarousel(owlOptions);
																																												//var owl = element.data('owlCarousel');
																																	}																																																				
																																	setTimeout(function(){
																																												initCarousel();
																																								},400);
																																	scope.goToSlide = function(index){
																																												element.data('owlCarousel').goTo(index);
																																	}
																						}
											}
}]);
angular.module("rubedo").directive('hide', function() {
    return {
											scope: true,
											link : 	function(scope, element, attrs) {
																						element.bind('click', function(){
																																	element.css("opacity", 0);
																																	setTimeout(function(){
																																							element.css("opacity", 0.8);
																																					}, 2000);
																						});
																					
											}
    }
})
angular.module("rubedoBlocks").directive('openModal', ['$document', function($document) {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      elem.bind('click', function(){
											$document.find("#modalblock_contact").modal();
											}) 
    }
  };
}]);
angular.module("rubedoBlocks").directive('plaxImg', [function() {
  return {
    restrict: 'C',
    link: function (scope, elem, attrs) {
      $(elem).plaxify({"xRange": attrs.xRange, "yRange": attrs.yRange});
    }
  };
}]);

// and a drop in element directive to start plax
angular.module("rubedoBlocks").directive('plax', [function () {
  return {
    restrict: 'E',
    link: function (scope, elem, attrs) {
      var args = {};

      if (attrs.activityTarget) {
        args.activityTarget = $(attrs.activityTarget);
      }

      // probably want to disable first to be sure that plax isn't already
      // initialized
      $.plax.disable();
      // then enable with the new args
      $.plax.enable(args);

      elem.on('destroy', function () {
        $.plax.disable();
      });
    }
  }
}]);

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
            var id = 'random_player_' + Math.floor((Math.random() * 999999999) + 1);
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
	
	
	angular.module('rubedoBlocks').controller('MasonryCtrl', [
    '$scope',
    '$element',
    '$timeout',
    function controller($scope, $element, $timeout) {
      var bricks = {};
      var schedule = [];
      var destroyed = false;
      var self = this;
      var timeout = null;
      this.preserveOrder = false;
      this.loadImages = true;
      this.scheduleMasonryOnce = function scheduleMasonryOnce() {
        var args = arguments;
        var found = schedule.filter(function filterFn(item) {
            return item[0] === args[0];
          }).length > 0;
        if (!found) {
          this.scheduleMasonry.apply(null, arguments); 
        }
      };
      // Make sure it's only executed once within a reasonable time-frame in
      // case multiple elements are removed or added at once.
      this.scheduleMasonry = function scheduleMasonry() {
        if (timeout) {
          $timeout.cancel(timeout);
        }
        schedule.push([].slice.call(arguments));
        timeout = $timeout(function runMasonry() {
          if (destroyed) {
            return;
          }
          schedule.forEach(function scheduleForEach(args) {
            $element.masonry.apply($element, args);
          });
          schedule = [];
        }, 30);
      };
      function defaultLoaded($element) {
        $element.addClass('loaded');
      }
      this.appendBrick = function appendBrick(element, id) {
        if (destroyed) {
          return;
        }
        function _append() {
          if (Object.keys(bricks).length === 0) {
            $element.masonry('resize');
          }
          if (bricks[id] === undefined) {
            // Keep track of added elements.
            bricks[id] = true;
            defaultLoaded(element);
            $element.masonry('appended', element, true);
          }
        }
        function _layout() {
          // I wanted to make this dynamic but ran into huuuge memory leaks
          // that I couldn't fix. If you know how to dynamically add a
          // callback so one could say <masonry loaded="callback($element)">
          // please submit a pull request!
          self.scheduleMasonryOnce('layout');
        }
        if (!self.loadImages) {
          _append();
          _layout();
        } else if (self.preserveOrder) {
          _append();
          element.imagesLoaded(_layout);
        } else {
          element.imagesLoaded(function imagesLoaded() {
            _append();
            _layout();
          });
        }
      };
      this.removeBrick = function removeBrick(id, element) {
        if (destroyed) {
          return;
        }
        delete bricks[id];
        $element.masonry('remove', element);
        this.scheduleMasonryOnce('layout');
      };
      this.destroy = function destroy() {
        destroyed = true;
        if ($element.data('masonry')) {
          // Gently uninitialize if still present
          $element.masonry('destroy');
        }
        $scope.$emit('masonry.destroyed');
        bricks = {};
      };
      this.reload = function reload() {
        $element.masonry();
        $scope.$emit('masonry.reloaded');
      };
    }
  ]).directive('masonry', function masonryDirective() {
    return {
      restrict: 'AE',
      controller: 'MasonryCtrl',
      link: {
        pre: function preLink(scope, element, attrs, ctrl) {
          var attrOptions = scope.$eval(attrs.masonry || attrs.masonryOptions);
          var options = angular.extend({
              itemSelector: attrs.itemSelector || '.masonry-brick',
              columnWidth: parseInt(attrs.columnWidth, 10) || attrs.columnWidth
            }, attrOptions || {});
          element.masonry(options);
          scope.masonryContainer = element[0];
          var loadImages = scope.$eval(attrs.loadImages);
          ctrl.loadImages = loadImages !== false;
          var preserveOrder = scope.$eval(attrs.preserveOrder);
          ctrl.preserveOrder = preserveOrder !== false && attrs.preserveOrder !== undefined;
          var reloadOnShow = scope.$eval(attrs.reloadOnShow);
          if (reloadOnShow !== false && attrs.reloadOnShow !== undefined) {
            scope.$watch(function () {
              return element.prop('offsetParent');
            }, function (isVisible, wasVisible) {
              if (isVisible && !wasVisible) {
                ctrl.reload();
              }
            });
          }
          var reloadOnResize = scope.$eval(attrs.reloadOnResize);
          if (reloadOnResize !== false && attrs.reloadOnResize !== undefined) {
            scope.$watch('masonryContainer.offsetWidth', function (newWidth, oldWidth) {
              if (newWidth != oldWidth) {
                ctrl.reload();
              }
            });
          }
          scope.$emit('masonry.created', element);
          scope.$on('$destroy', ctrl.destroy);
        }
      }
    };
  }).directive('masonryBrick', function masonryBrickDirective() {
    return {
      restrict: 'AC',
      require: '^masonry',
      scope: true,
      link: {
        pre: function preLink(scope, element, attrs, ctrl) {
          var id = scope.$id, index;
          ctrl.appendBrick(element, id);
          element.on('$destroy', function () {
            ctrl.removeBrick(id, element);
          });
          scope.$on('masonry.reload', function () {
            ctrl.scheduleMasonryOnce('reloadItems');
            ctrl.scheduleMasonryOnce('layout');
          });
          scope.$watch('$index', function () {
            if (index !== undefined && index !== scope.$index) {
              ctrl.scheduleMasonryOnce('reloadItems');
              ctrl.scheduleMasonryOnce('layout');
            }
            index = scope.$index;
          });
        }
      }
    };
  });
/*

<script>
    			$(document).ready(function(){ 
    			     $('#ascensorBuilding').hide();

    			    setTimeout(function(){ 
    			        var ascensor = $('#ascensorBuilding').ascensor({direction: [[0,0],[0,1],[1,0],[1,1]],
															time: 1900, easing: 'easeInOutCubic',
															touchSwipeIntegration: true,
															ascensorFloorName: ['Accueil','PourQuoi-PourQui-ParQui','Contact','Foyers']
															});
						$('#ascensorBuilding').show();
						var floorAdded = false;
            			$(".add-floor").click(function(){
            				if(!floorAdded){
            				$('#ascensorBuilding').append('<div class="floor-8">This floor has been dynamically appended!</div>');
            				ascensor.trigger("refresh");
            				$(this).text("Floor Added!");
            				floorAdded = true;
            				}
            			});
            				
            			$(".links-to-floor li").click(function(event, index) {
            				ascensor.trigger("scrollToStage", $(this).index());
            			});
            			
            			$(".links-to-floor li:eq("+ ascensor.data("current-floor") +")").addClass("selected");
            
            			ascensor.on("scrollStart", function(event, floor){
            				$(".links-to-floor li").removeClass("selected");
            				$(".links-to-floor li:eq("+floor.to+")").addClass("selected");
            			});
            	
            			$(".prev").click(function() {
            				ascensor.trigger("prev");
            			});
            				
            			$(".next").click(function() {
            				ascensor.trigger("next");
            			});
            				
            			$(".up").click(function() {
            				ascensor.trigger("scrollToDirection" ,"up");
            			});
            				
            			$(".down").click(function() {
            				ascensor.trigger("scrollToDirection" ,"down");
            			});
            				
            			$(".left").click(function() {
            				ascensor.trigger("scrollToDirection" ,"left");
            			});
            				
            			$(".right").click(function() {
            				ascensor.trigger("scrollToDirection" ,"right");
            			});	
														
    			       
    			        }, 500);

			
				
			
			})
</script>*/