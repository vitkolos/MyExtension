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



angular.module("rubedo").directive("ascensor",['$document',function($document){
											return {
																						restrict: "A",
																						template:'<div id="ascensorBuilding"><div ng-repeat="column in row.columns track by $index" ng-include="rubedo.componentsService.getColumnTemplate(column.customTemplate)"></div></div>',
																						link: function(scope,element, attrs) {
																																	var targetElSelector="#ascensorBuilding";
																																	angular.element(targetElSelector).css( "visibility", "hidden" );
																																	var initAscensor = function(){
																																												var ascensor = angular.element(targetElSelector).css("visibility", "visible");
																																												var options={
																																																							direction: [[0,0],[0,1],[1,0],[1,1]],
																																																							time: 1900,
																																																								easing: 'easeInOutCubic',
																																																								touchSwipeIntegration: true
																																												};
																																												angular.element("#ascensorBuilding").ascensor(options);
																																												angular.element("#flecheLeft").on("click", function(){ascensor.trigger("scrollToDirection" ,"left");});
																																												angular.element("#flecheLeft2").on("click", function(){ascensor.trigger("scrollToDirection" ,"left");});
																																												angular.element("#flecheDown").on("click", function(){ascensor.trigger("scrollToDirection" ,"down");});
																																												angular.element("#flecheUp").on("click", function(){ascensor.trigger("scrollToDirection" ,"up");});
																																												angular.element("#flecheUp2").on("click", function(){ascensor.trigger("scrollToDirection" ,"up");});
																																												angular.element("#flecheRight").on("click", function(){ascensor.trigger("scrollToDirection" ,"right");});
																																												angular.element("#flecheRight2").on("click", function(){ascensor.trigger("scrollToDirection" ,"right");});

																																	}
																																	setTimeout(function(){
																																												initAscensor();
																																								},400);
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