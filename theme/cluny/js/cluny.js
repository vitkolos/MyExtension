blocksConfig.d3Script= {
            "template": "/templates/blocks/d3Script.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/D3ScriptController.js"],
            "externalDependencies":['/components/mbostock/d3/d3.min.js','//cdnjs.cloudflare.com/ajax/libs/topojson/1.6.9/topojson.min.js']
};
blocksConfig.simpleContact={
           "template": "/templates/blocks/simpleContact.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/simpleContact.js"]
};
blocksConfig.facebook={
           "template": "/templates/blocks/facebook.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/FacebookController.js"]
};

blocksConfig.bg_image={
           "template": "/templates/blocks/bg_image.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/BgImageController.js"]
};

blocksConfig.contentDetail = {
            "template": "/templates/blocks/contentDetail.html",
            "externalDependencies":['//s7.addthis.com/js/300/addthis_widget.js','//cdnjs.cloudflare.com/ajax/libs/masonry/3.3.2/masonry.pkgd.min.js','//cdnjs.cloudflare.com/ajax/libs/jquery.imagesloaded/3.2.0/imagesloaded.pkgd.min.js'],
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/BreadcrumbController.js","/src/modules/rubedoBlocks/controllers/ContentDetailController.js","/src/modules/rubedoBlocks/controllers/simpleContact.js","/lib/masonry/masonry.js",]
};

blocksConfig.redirect={
           "template": "/templates/blocks/redirect.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/redirectController.js"]
};
blocksConfig.carrousel2={
           "template": "/templates/blocks/carrousel_fullWidth.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/carrousel_fullWidth.js"]
};
blocksConfig.sectionPresentation={
           "template": "/templates/blocks/sectionPresentation.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/sectionPresentation.js"]
};
blocksConfig.imageBatchUpload={
           "template": "/templates/blocks/imageBatchUpload.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/imageBatchUploadController.js"]
};

angular.module('rubedoBlocks').filter('title', function() {
    return function(input){
		  var delimiter = '//';
		  return input.split(delimiter)[0];
    }
});
angular.module('rubedoBlocks').filter('section', function() {
    return function(input){
		  var delimiter = '//';
		  return input.split(delimiter)[1];
    }
});
angular.module('rubedoBlocks').filter('homepage', function() {
    return function(input){
		  var delimiter = '/';
		  var array = input.split(delimiter);
                  var url ="";
                  for (i = 0; i < array.length-2; i++) {url = url + array[i]+'/'}
                  return url;
    }
});


 angular.module('rubedoFields').filter('split', function() {
        return function(input, splitChar, splitIndex) {
            // do some bounds checking here to ensure it has that index
											if (!splitChar) {
																				splitChar = "_";
											}
											if (input && input !='') {
																					return input.split(splitChar)[splitIndex];
											}
											else return "";
            
            
        }
    });  
    
angular.module('rubedoBlocks').directive('toggleclass', function() {
            return {
                      restrict: 'A',
                      link: function(scope, elm, attrs) {
                                 var element = $(elm);
                                  element.bind('click', function(event) {
                                            element.next().toggleClass("displayed");
                                 });
                      }
           }
 });
 
	angular.module('rubedoBlocks').directive('scrollPosition', function($window) {
  return {
    scope: {
      scroll: '=scrollPosition'
    },
    link: function(scope, element, attrs) {
      var windowEl = angular.element($window);
      var handler = function() {
        scope.scroll = windowEl.scrollTop();
      }
      windowEl.on('scroll', scope.$apply.bind(scope, handler));
      handler();
    }
  };
});
angular.module('rubedoBlocks').directive('isInView', function($window) {
    return {
      scope: {
        scroll: '=isInView'
      },
      link: function(scope, element, attrs) {
        var windowEl = angular.element($window);
        var handler = function() {
          var windowTop = windowEl.scrollTop();
          var windowBottom = windowEl.scrollTop()+windowEl.height();
          var elemPosition = Math.round( element.offset().top );
          if(elemPosition+100<windowBottom && elemPosition>windowTop) {element.addClass("inView");console.log('in view');}
        }
        windowEl.on('scroll', scope.$apply.bind(scope, handler));
        handler();
      }
    };
  });
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




/*filtre pour renvoyer le format de la date de début d'une proposition bien formatée*/
angular.module('rubedoBlocks').filter('dateRange', function ($filter) {
    return function(startDate, endDate, rangeFormat,from,to){
	var format = rangeFormat || 'long';
	var formatOfDate =  'd MMM yyyy';
	var isSameDay = false;
	var start = new Date(startDate*1000);
	var end = new Date(endDate*1000);
	if (start.getFullYear() != end.getFullYear()) {
	    formatOfDate = 'd MMM yyyy';
	}
	else if (start.getMonth() != end.getMonth()) {
	    formatOfDate = 'd MMM';
	}
	else  if(start.getDate() == end.getDate()){
	    formatOfDate = 'd';
	    isSameDay=true;
	}
	else {
	    formatOfDate = 'd';
	}
	if (format == 'short') {
		if(isSameDay) formattedDate= $filter('date')(end,'d MMM yyyy');	  
	    	else formattedDate= $filter('date')(start,formatOfDate) + "-"+$filter('date')(end,'d MMM yyyy');	    
	}
	else {
           if(isSameDay) formattedDate= $filter('date')(end,'d MMM yyyy');	  
	   else formattedDate= from +" "+$filter('date')(start,formatOfDate) + " "+to+" "+$filter('date')(end,'d MMMM yyyy');	    
	}
	return formattedDate;
    }
  });

  // This service is useful to retrieve the appropriate Rgpd policy
  angular.module('rubedoDataAccess').factory('RgpdService', ['$http', function($http) {
    return {
      getPolitiqueConfidentialiteId: function () {
        let default_rgpd_id = "5ddfdcc3396588a91b1321e1";
        return $http.get("api/v1/media", {
          params: {
            query: {'DAMTypes': ['5da5c314396588215cde8b40']}, // this the damtype id of "Politique e confidentiatlié"
            pageWorkspace: '545cd94b45205e91168b4567',
          }
        }).then(function (resp) {
          // on error
          if (!resp || !resp.data || !resp.data.success) {
            console.log("Error1 in RgpdService", resp);
            return default_rgpd_id;
          }
          if (resp.data.count == 0) {
            console.warn("in RgpdService : could not find rgpd policy file for this language, fallback to FR")
            return default_rgpd_id;
          }

          // on success
          console.log("Rgpd found", resp.data.media.data[0]);
          return resp.data.media.data[0].id;

        }, function (data) {
          // on error
          console.log("Error2 in RgpdService", data);
          return "";
        })
      }
    }
  }]);

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
	serviceInstance.getTaxonomyByVocabulary=function(vocabularies){
            return ($http.get("/api/v1/taxonomies",{
                params:{
                    vocabularies:vocabularies
                }
            }));
	};
        return serviceInstance;
    }]);



  
angular.module('rubedoBlocks').directive('addthisToolbox', ['$timeout','$location','$http', function($timeout,$location,$http) {
  return {
    restrict : 'A',
	  transclude : true,
	  replace : true,
	  template : '<div ng-transclude></div>',
	  link : function($scope, element, attrs) {
		$timeout(function () {
                      addthis.init();
                      var contentUrl = $location.absUrl();
                      addthis.toolbox(angular.element('.addthis_toolbox').get(), {}, {
                                 url: contentUrl,
                                 title : attrs.title,
                                 description : attrs.summary
                      });
		/*if ($window.addthis.layers && $window.addthis.layers.refresh) {
                        $window.addthis.layers.refresh();
                    }*/
		$scope.nbOfLikes=0;
		$http({method: 'GET',url: 'https://graph.facebook.com/?id='+contentUrl})
		.then(function successCallback(response) {
			$scope.nbOfLikes += response.data.shares;
		},
		function errorCallback(response) {
		});
		

		});
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








