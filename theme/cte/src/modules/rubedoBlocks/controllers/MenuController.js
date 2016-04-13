    angular.module("rubedoBlocks").lazy.controller("MenuController",['$scope','$location','RubedoMenuService','RubedoPagesService','$http','$route',
								     function($scope,$location,RubedoMenuService,RubedoPagesService,$http,$route){
        var me=this;
        var themePath="/theme/"+window.rubedoConfig.siteTheme;
        me.menu={};
        me.currentRouteline=$location.path();
        var lang = $route.current.params.lang;
       var config=$scope.blockConfig;
	me.menuTab = false; 
	if ($scope.block.code == '1418') {
	    me.menuClass="menu1418";
	    me.menuTab = true;
	}
	else if ($scope.block.code == 'cana'){
	    me.menuClass="menucana";
	    me.menuTab = true;
	}
	else if ($scope.block.code && $scope.block.code!="") {
	    me.menuTab = true;
	}
        me.searchEnabled = (config.useSearchEngine && config.searchPage);
	me.getMenu = function(){
	    RubedoMenuService.getMenu(pageId, config.menuLevel).then(function(response){
		if (response.data.success){
		    me.menu=response.data.menu;
		} else {
		    me.menu={};
		}
	    });
	};
	if ($scope.block.code=='lvl3') {
	    if (($scope.rubedo.current.breadcrumb).length==3) {
		var pageId=$scope.rubedo.current.page.id; me.getMenu();
	    }
	    else if (($scope.rubedo.current.breadcrumb).length==4) {
		var pageId=$scope.rubedo.current.page.parentId;me.getMenu();
	    }
	    else if (($scope.rubedo.current.breadcrumb).length==5) {
		
		var route = $route.current.params.routeline;
		var path = route.substring(0,route.lastIndexOf('/')); // parent page
		$http.get("/api/v1/pages",{
		    params:{
			site:$location.host(),
			route:path
		    }
		}).then(function(response){
		    if (response.data.success) {
			pageId = response.data.page.parentId;
		    }
		    else pageId=$scope.rubedo.current.page.parentId;
		    me.getMenu();
		});
	    }
	}		
	else if ($scope.block.code=='lvl2') {
	    if (($scope.rubedo.current.breadcrumb).length==2) {
		var pageId=$scope.rubedo.current.page.id; me.getMenu();
	    }
	    else if (($scope.rubedo.current.breadcrumb).length==3) {
		var pageId=$scope.rubedo.current.page.parentId;me.getMenu();
	    }
	    else if (($scope.rubedo.current.breadcrumb).length>=4) {
		var routeArray = $route.current.params.routeline.split("/");
		var rootPageRoute = routeArray[0]+"/"+routeArray[1]+"/"
		var route = $route.current.params.routeline;
		//propositions/se-ressourcer/retraites/
		console.log(route);
		var path = route.substring(0,route.lastIndexOf('/')); // parent page
		$http.get("/api/v1/pages",{
		    params:{
			site:$location.host(),
			route:rootPageRoute
		    }
		}).then(function(response){
		    if (response.data.success) {
			pageId = response.data.page;
		    }
		    else pageId=$scope.rubedo.current.page.parentId;
		    me.getMenu();
		});
	    }
	}		
        else if (config.rootPage){
            var pageId=config.rootPage;me.getMenu();
        } else if (config.fallbackRoot&&config.fallbackRoot=="parent"&&mongoIdRegex.test($scope.rubedo.current.page.parentId)){
            var pageId=$scope.rubedo.current.page.parentId;me.getMenu();
        } else {
            var pageId=$scope.rubedo.current.page.id;me.getMenu();
        }
        me.onSubmit = function(){
            var paramQuery = me.query?'?query='+me.query:'';
            RubedoPagesService.getPageById(config.searchPage).then(function(response){
                if (response.data.success){
                    $location.url(response.data.url+paramQuery);
                }
            });
        };
	
        
	me.showMenu =function(){
	    $scope.menu = !$scope.menu;
	    if($scope.menu) angular.element('#menuModal').modal('show');
	    else angular.element('#menuModal').modal('hide');
	};
	// pour fermer le modal quand on clique sur un lien
	$scope.$on("$locationChangeStart",function(event, newLoc,currentLoc){
	    angular.element('body .modal-backdrop ').remove();
	});
	
	/*Ajouter les traductions*/
	$scope.rubedo.getCustomTranslations = function(){
	        $http.get('/theme/'+window.rubedoConfig.siteTheme+'/localization/'+lang+'/Texts.json').then(function(res){
            	$scope.rubedo.translations = JSON.parse((JSON.stringify($scope.rubedo.translations) + JSON.stringify(res.data)).replace(/}{/g,","))
          });	
        }
      $scope.rubedo.getCustomTranslations(); 
	
	
	
}]);