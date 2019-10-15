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
angular.module('rubedo').filter('ligneNonVide', function () {
  return function (input) {
    var filtered = [];
    var contentDisplay = false;
    angular.forEach(input, function(row, index) {
      // si la 1re colonne est terminale et non vide
      if (row.columns[0].isTerminal&&row.columns[0].blocks) {
        // toujours afficher la 1re ligne (menu) et les 2 dernires (footer)
        if (index ==0 || index >= input.length-2) {
          filtered.push(row);
        }
        // si la page sert à afficher un contenu (en 2me ligne) on n'affiche pas les autres lignes
        else if (row.columns[0].blocks[0].configBloc.isAutoInjected)  {
          filtered.push(row);
          contentDisplay = true;
        }
        //si la ligne a un bloc de détail en premier, on affiche seulement le bloc détail dans la ligne
        else if (row.columns[0].blocks[0].bType=="contentDetail" && !contentDisplay) {
          row.columns[0].blocks = {0 : row.columns[0].blocks[0]};
          filtered.push(row);
        }
        // sinon on affiche tout
        else if(!contentDisplay) {
          filtered.push(row);
        }
      }
      // si la colonne a des lignes à l'intérieur
      else if (row.columns[0].rows) {
        filtered.push(row);
      }
    });
    return filtered;

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

// directive qui gère le rendu du menu du restaurant de Bethanien
angular.module('rubedoBlocks').directive('menuentry', function() {
  return {
    restrict: 'AC',
    link: function(scope, elm, attrs) {
      var element = $(elm);
      let lignes = element.html().split(/\<br\s*\/?\s*\>/gi);
      let new_html = $("<table class='menu'></table>")
      for (let ligne of lignes) {
        let re_prix = /\s+(CHF|EUR|USD)\s*([0-9\.]+)\s*$/gi.exec(ligne);
        if (re_prix && re_prix.length > 2) {
          let menu_devise = re_prix[1];
          let menu_price = re_prix[2];
          let menu_name = ligne.replace(/\s+(CHF|EUR|USD)\s*[0-9\.]+\s*$/gi, '').trim();
          new_html.append(`<tr><td class="menu_name"><span>${menu_name}</span></td><td class="menu_price">${menu_devise} ${menu_price}</td></tr>`)
        } else {
          new_html.append(`<tr><td class="menu_name"><span>${ligne}</span></td><td class="menu_price"></td></tr>`)
        }
      }
      element.html(new_html)
      // on load le css de menu
      $("head").append("<link>");
      var css = $("head").children(":last");
      css.attr({
            rel:  "stylesheet",
            type: "text/css",
            href: "/theme/bethanien/css/menu.css"
      });
    }
 }
});



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
    getPolitiqueConfidentialiteId: function (lang = 'fr') {
      return $http.get("api/v1/media", {
        params: {
          query: {'DAMTypes': ['5da5c314396588215cde8b40']}, // this the damtype id of "Politique e confidentiatlié"
          pageWorkspace: '545cd94b45205e91168b4567',
          lang: 'de|de'
        }
      }).then(function (resp) {
        // on error
        if (!resp || !resp.data || !resp.data.success) {
          console.log("Error1 in RgpdService", resp);
          return "";
        }

        // on success
        let found_medias = resp.data.media.data.filter(el => el.nativeLanguage == lang.toLocaleLowerCase());
        if (found_medias.length == 0) {
          console.warn("Did not find politique de confidentialité for language " + lang + " fallback to FR");
          found_medias = resp.data.media.data.filter(el => el.nativeLanguage == 'fr');
        }
        if (found_medias.length == 0) {
          console.error('Could not find the politique de confidentialité')
          return "";
        }
        console.log("Rgpd found", found_medias[0]);
        return found_medias[0].id;

      }, function (data) {
        // on error
        console.log("Error2 in RgpdService", data);
        return "";
      })
    }
  }
}]);

angular.module('rubedoDataAccess').factory('InscriptionService', ['$http',function($http) {
  var serviceInstance={};

  serviceInstance.inscrire = function(inscription, workspace, traductions) {
      if (inscription.__SANDBOX__) return Promise.resolve({data:{success: true, sandbox: true, id: 'testid12345', result: {paymentConfID: 'paymentConfTestId12345'}}});
      return($http({
          url: "/api/v1/inscription",
          method: "POST",
          data: {
              inscription:inscription,
              workspace: workspace
          }
      }));
  };

  serviceInstance.exportInscriptions = function(payload) {
    return ($http.get("/api/v1/inscription",{
      params: payload
    }));
  };
  return serviceInstance;
}]);

angular.module('rubedoDataAccess').factory('DonationService', ['$http',function($http) {
  var serviceInstance={};
  serviceInstance.donate=function(don, account){
   return ($http({
       url:"api/v1/donation",
       method:"POST",
       data : {
           don:don,
           account : account
       }
   }));
};
return serviceInstance;
}]);

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








