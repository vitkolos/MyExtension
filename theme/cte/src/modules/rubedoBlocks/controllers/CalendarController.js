angular.module("rubedoBlocks").lazy.controller("CalendarController",["$scope","$route","RubedoContentsService","$element","RubedoSearchService",function($scope,$route,RubedoContentsService, $element, RubedoSearchService){
    var me = this;
    var themePath="/theme/"+window.rubedoConfig.siteTheme;
    var config = $scope.blockConfig;
    var pageId=$scope.rubedo.current.page.id;
    var siteId=$scope.rubedo.current.site.id;
    me.contents = [];
    me.calendarId = 'block-'+$scope.block.id+'-calendar';
    var showCal = false;
    var showList = false;
    var showCalWeek = false;
    var displayMode = 'all';
    angular.forEach(config.display,function(displ){
        showCal = displ == 'showCal' ? true : showCal;
        showList = displ == 'showList' ? true : showList;
        showCalWeek = displ == 'showCalWeek' ? true : showCalWeek;
   });
    if(showCal && !showList){
        displayMode = 'showCal';
    } else if (!showCal && showList){
        displayMode = 'showList';
    }
				else if (showCalWeek) {
								displayMode = 'showCalWeek';
				}
    me.template = themePath+"/templates/blocks/calendar/"+displayMode+".html";
    var today = new Date();
    today = today.getTime();
    var options = {
        dateFieldName: config['date'],
        endDateFieldName: config['endDate'],
        limit: 1000,
        'fields[]':['text',config['date'],config['endDate'],'summary','image','positionName','inscriptionState']
    };
    if(config.singlePage){
        options.detailPageId = config.singlePage;
    }
    me.isPastProposition = function(date) {
        return (date*1000 < today);
    }
    me.getContents = function (queryId, pageId, siteId, options, cb){
        RubedoContentsService.getContents(queryId,pageId,siteId, options).then(function(response){
            if (response.data.success){
                cb(response.data);
            }
        })
    };
    if (displayMode=='showList') {
        if (config.predefinedFacets) {
            me.isSpecialCalendar=true;
            var searchOptions = {
                start: 0,
                limit:50,
                pageId:pageId,
                siteId:siteId,
                orderby:"dateDebut",
                orderbyDirection:"asc",
                predefinedFacets: config.predefinedFacets,
                searchMode:"default",
                constrainToSite:false,
                displayedFacets:"['all']"
            }
            RubedoSearchService.searchByQuery(searchOptions).then(function(response){
                if(response.data.success) {
                    me.contents = response.data.results.data
                    $scope.clearORPlaceholderHeight();
                }
            });
        }
        else {
            me.getContents(config.query, pageId, siteId, options, function(data){
                me.contents = data.contents;
                $scope.clearORPlaceholderHeight();
            });
        }
        
    }
    me.init = function(){
								var formatOfDate = 'showCalWeek' ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';
        me.calendar = $element.find('#'+me.calendarId);
        me.calendar.fullCalendar({
            lang: $route.current.params.lang,
            weekMode: 'liquid',
												header: {
																left: 'prev,next today',
																center: 'title',
																right: 'month,basicWeek,agendaDay'
															},
															displayEventEnd: true,
															timeFormat:'H:mm',
												views: {
																basicWeek: { // name of view
																				//timeFormat:'H:mm-{H:mm}',
																				displayEventEnd: true,
																				timeFormat:'H:mm',
																				// other view-specific options here
																}
												},
												defaultView:displayMode == 'showCalWeek' ? 'basicWeek' : 'month',
            timezone: false,
            viewRender: function(view){
                options.date = moment(view.start.format()).unix();
                options.endDate = moment(view.end.format()).unix();
                if(config.query){
                    me.getContents(config.query, pageId, siteId, options, function(data){
                        me.contents = data.contents;
                        var newEvents = [];
                        angular.forEach(me.contents,function(content){
                            var event = {};
                            event.title = content.fields.text;
                            event.start = moment.unix(content.fields[config['date']]).format(formatOfDate);
                            event.end = content.fields[config['endDate']]?
                                moment.unix(content.fields[config['endDate']]).format(formatOfDate):
                                moment.unix(content.fields[config['date']]).format(formatOfDate);
                            if(displayMode != 'showCalWeek') event.url = content.detailPageUrl;
																												else event.allDay= false;
                            newEvents.push(event);
                        });
                        me.calendar.fullCalendar('removeEvents');
                        me.calendar.fullCalendar('addEventSource', newEvents);
                        me.calendar.fullCalendar('refetchEvents');
                        $scope.clearORPlaceholderHeight();
                    });
                }
            }
        });
    };
}]);
