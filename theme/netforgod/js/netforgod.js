blocksConfig.buttonToPage={
           "template": "/templates/blocks/buttonToPage.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/buttonToPage.js"]
};

blocksConfig.simpleContact={
           "template": "/templates/blocks/simpleContact.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/simpleContact.js"]
};
blocksConfig.navigation = {
            "template": "/templates/blocks/navigation.html",
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/MenuController.js","/src/modules/rubedoBlocks/controllers/LanguageMenuController.js"]
};
blocksConfig.contentDetail = {
            "template": "/templates/blocks/contentDetail.html",
            "externalDependencies":["//s7.addthis.com/js/300/addthis_widget.js","https://kendo.cdn.telerik.com/2016.3.914/js/kendo.all.min.js","https://kendo.cdn.telerik.com/2015.2.805/js/pako_deflate.min.js"],
            "internalDependencies":["/src/modules/rubedoBlocks/controllers/ContentDetailController.js","/src/modules/rubedoBlocks/directives/DisqusDirective.js","/src/modules/rubedoBlocks/controllers/simpleContact.js"]
};
blocksConfig.carrousel2={
           "template": "/templates/blocks/carrousel_fullWidth.html",
          "internalDependencies":["/src/modules/rubedoBlocks/controllers/carrousel_fullWidth.js"]
};
blocksConfig.footer_fr={
           "template": "/templates/blocks/footer_fr.html"
};
blocksConfig.footer_en={
           "template": "/templates/blocks/footer_en.html"
};

angular.module('rubedoBlocks').filter('firstUpper', function() {
    return function(input, lang) {
        return input ? input.substring(0,1).toUpperCase()+input.substring(1).toLowerCase() : "";
    }
});
angular.module('rubedoBlocks').filter('currentyear',['$filter',  function($filter) {
    return function() {
        return $filter('date')(new Date(), 'yyyy');
    };
}])
angular.module('rubedoBlocks').filter('nfgDate', function($filter) {
    return function(input, format, locale) {
           var date = "";
           switch(locale){
                      case 'pl':
                                 if(format=="MMMM yyyy") {
                                            var months = ["styczeń","luty","marzec","	kwiecień","maj","czerwiec","lipiec","	sierpień","wrzesień","październik","listopad","grudzień"];
                                            var formattedDate =  new Date(input);
                                            date = months[formattedDate.getMonth()] + " " + formattedDate.getFullYear();
                                 }
                                 else date = $filter('date')(input, format);
                                 break;
                      default : date = $filter('date')(input, format);
           }
        return date;
    }
});

angular.module('rubedoBlocks').directive('jwplayer', ['$compile', function ($compile) {
    return {
        restrict: 'EC',
        link: function (scope, element, attrs) {
           var filmUrl = attrs.videoUrl;
           var subTitles=attrs.sousTitre;
           var delay = 0;
           filmInfos = filmUrl.split("?t=");
           if (filmInfos.length>1) {
                      filmUrl = filmInfos[0];
                      delay = filmInfos[1].substr(-3, 2);
           }
           var title = attrs.title;
           var image = attrs.videoImage;
            var id = 'random_player_' + Math.floor((Math.random() * 999999999) + 1);
            getTemplate = function (playerId) {
                return '<div id="' + playerId + '"></div>';
            };
           var options = {
                      file: filmUrl,
                      ga: {label:attrs.title},
                      modestbranding:0,
                      showinfo:1,
                      width:"100%",
                      aspectratio:"16:9",
                      logo: {
                                 file: '/theme/netforgod/img/logo.png',
                                 link: 'https://test.netforgod.org/'
                      },
                      displaytitle:true,
                      tracks:JSON.parse(subTitles)
           };
            element.html(getTemplate(id));
            $compile(element.contents())(scope);
            jwplayer(id).setup(options);
            jwplayer(id).on('firstFrame', function() { 
                      jwplayer().seek(delay);
           });
           /*watch for film change*/
            scope.$watch(function () {
                    return attrs.videoUrl;
                }, function (newValue, oldValue) {
                      if (!oldValue || oldValue==newValue) {
                      }
                      else {
                      	delay = 0;
           		filmInfos = newValue.split("?t=");
		        if (filmInfos.length>1) {
		                      filmUrl = filmInfos[0];
		                      delay = filmInfos[1].substr(-3, 2);
		        }
		        else filmUrl=newValue;
                                 jwplayer(id).load([{
                                            file: filmUrl,
                                            ga: {label:attrs.title},
                                            modestbranding:0,
                                            showinfo:1,
                                            width:"100%",
                                            aspectratio:"16:9",
                                            logo: {
                                                       file: '/theme/netforgod/img/logo.png',
                                                       link: 'https://test.netforgod.org/'
                                            },
                                            displaytitle:true,
                                            tracks:JSON.parse(attrs.sousTitre) 
                                 }]);
                                 jwplayer(id).on('firstFrame', function() { 
			                 jwplayer().seek(delay);
			          });
                      }
                });
            /*watch for captions update*/
            scope.$watch(function () {
                    return attrs.sousTitre;
                }, function (newValue, oldValue) {
                      options ={
                                            file: filmUrl,
                                            tracks:JSON.parse(newValue),
                                           ga: {label:attrs.title},
                                            modestbranding:0,
                                            showinfo:1,
                                            width:"100%",
                                            aspectratio:"16:9",
                                            logo: {
                                                       file: '/theme/netforgod/img/logo.png',
                                                       link: 'https://test.netforgod.org/'
                                            },
                                            displaytitle:true                                 
                      };
                       jwplayer(id).load([options]);

                });            



        }
    };
}]);

angular.module('rubedoBlocks').directive('youtube', ['$window', '$compile', function($window, $compile) {
    return {
      restrict: "E",
  
      scope: {
        height:   "@",
        width:    "@",
        video:    "@"  
      },
  
      // all the styling here below is ugly but necessary to display the yt iframe correctly (found on the web)
      // the youtube iframe will be displayed in the inner div
      /* template: `<div class="youtube-embed-wrapper ng-scope" style="position:relative;padding-bottom:56.25%;padding-top:30px;height:0;">
        <div id="${id}" style="position:absolute;top:0;left:0;width:100%;height:100%;"></div>
        </div>`, */
  
      link: function(scope, element) {
        let player;
        // see https://developers.google.com/youtube/iframe_api_reference?hl=fr on how to embed a youtube iframe
        
        // we load the youtube script if not already loaded
        let youtube_script_url = "https://www.youtube.com/iframe_api";
        let scripts = Array
            .from(document.querySelectorAll('script'))
            .map(scr => scr.src);
        if (!scripts.includes(youtube_script_url)) {
            let tag = document.createElement('script');
            tag.src = youtube_script_url;
            let firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
        

        // prepare html of element
        let id = 'random_player_' + Math.floor((Math.random() * 999999999) + 1);
        element.html(`<div class="youtube-embed-wrapper ng-scope" style="position:relative;padding-bottom:56.25%;padding-top:30px;height:0;">
            <div id="${id}" style="position:absolute;top:0;left:0;width:100%;height:100%;"></div>
            </div>`
        );
        $compile(element.contents())(scope);

        // fix videoid if it's not an id but a youtube url
        // and prepare the video options for youtube player
        function prepare_video_options(vid) {
            let options = {
                height: scope.height,
                width: scope.width,
                videoId: vid,
                autoplay: 0,
            }
            
            if (!/^https?:\/\//.test(vid)) return options;
            if (!/youtu\.?be/.test(vid)) {
                console.error('This is not a youtube url : ' + vid);
                return options;
            }

            let res = /([^\/]+?)(\?.+)?$/.exec(vid);
            if (res.length < 2) return 'could not guess youtube id from ' + vid;
            options.videoId = res[1];
            console.info("video id guessed : ", options.videoId);

            // find other options (like ?t=46s to start the video after 46s)
            if (res.length >= 3 && res[2].length > 0) {
                let corresp = {'t': 'start'};
                let raw_other_options = res[2].substr(1).split("&");

                raw_other_options.map(function(el) {
                    let arr = el.split('=');
                    if (arr.length < 2) return;
                    if (corresp[arr[0]]) options[corresp[arr[0]]] = arr[1];
                    else options[arr[0]] = arr[1];
                })
                console.info("guessed player options", options);
            }

            return options;
        }

        // prepare options
        let options = prepare_video_options(scope.video);
  
        // load youtube player
        $window.onYouTubeIframeAPIReady = function() {
          player = new YT.Player(document.getElementById(id), options);
        };

        // watch for film change
        scope.$watch(_ => scope.video, function(newValue, oldValue) {
            if (!oldValue || oldValue==newValue) return;
            console.log("film url changed", oldValue, newValue);
            options = prepare_video_options(scope.video);
            newvid_options = {videoId: options.videoId}
            if (options['start'] && options['start'].substr(-1) == 's') newvid_options.startSeconds = options.start.substr(0, options.start.length-1);
            player.loadVideoById(newvid_options);
            //player = new YT.Player(document.getElementById(id), options);
        });

        // on reload
        scope.$on('YT_RELOAD', function() {
            console.log("reloading yt video...")
            newvid_options = {videoId: options.videoId}
            if (options['start'] && options['start'].substr(-1) == 's') newvid_options.startSeconds = options.start.substr(0, options.start.length-1);
            player.loadVideoById(newvid_options);
        });

      }, // -- end link
    }
  }]);



angular.module('rubedoBlocks').directive('ngCopyable', function() {
        return {
            restrict: 'A',
            link:link
        };
        function link(scope, element, attrs) {
            element.bind('click',function(){
                      var text = document.querySelector('#textToCopy');
                      text.select();
                var successful = document.execCommand('copy');
                window.getSelection().removeAllRanges();
            });
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
			$scope.nbOfLikes += response.data.share.share_count;
		},
		function errorCallback(response) {
		});
		$http({method: 'GET',url: 'https://cdn.api.twitter.com/1/urls/count.json?url='+contentUrl})
		.then(function successCallback(response) {
			$scope.nbOfLikes += response.data.count;
		},
		function errorCallback(response) {
		});		

		});
	    }
	};
}]);



angular.module('rubedoBlocks').directive('videoBg', ['$window', '$q', '$timeout', function($window, $q, $timeout){
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                videoId: '=?',
                playlist: '=?',
                ratio: '=?',
                loop: '=?',
                mute: '=?',
                start: '=?',
                end: '=?',
                contentZIndex: '=?',
                allowClickEvents: '=?',
                mobileImage: '=?',
                playerCallback: '&?'
            },
            transclude: true,
            template: '<div><div></div><div ng-transclude></div></div>',
            link: function(scope, element) {

                var computedStyles,
                    ytScript = document.querySelector('script[src="//www.youtube.com/iframe_api"]'),
                    $player = element.children().eq(0),
                    playerId,
                    player,
                    parentDimensions,
                    playerDimensions,
                    playerCallback = scope.playerCallback,
                    backgroundImage = scope.mobileImage || '//img.youtube.com/vi/' + scope.videoId + '/maxresdefault.jpg',
                    videoArr,
                    videoTimeout;

                playerId = 'player' + Array.prototype.slice.call(document.querySelectorAll('div[video-id]')).indexOf(element[0]);
                $player.attr('id', playerId);

                scope.ratio = scope.ratio || 16/9;
                scope.loop = scope.loop === undefined ? true : scope.loop;
                scope.mute = scope.mute === undefined ? true : scope.mute;

                if (!scope.videoId && !scope.playlist) {
                    throw new Error('Either video-id or playlist must be defined.');
                }
                if (scope.videoId && scope.playlist) {
                    throw new Error('Both video-id and playlist cannot be defined, please choose one or the other.');
                }
                if (scope.playlist) {
                    videoArr = scope.playlist.map(function(videoObj) {
                        return videoObj.videoId;
                    });
                }


                // Utility methods

                function debounce(func, wait) {
                    var timeout;
                    return function() {
                        var context = this, args = arguments;
                        var later = function() {
                            timeout = null;
                            func.apply(context, args);
                        };
                        clearTimeout(timeout);
                        timeout = setTimeout(later, wait);
                    };
                }

                /**
                 * detect IE
                 * returns version of IE or false, if browser is not Internet Explorer
                 */
                function detectIE() {
                    var ua = window.navigator.userAgent,
                        msie = ua.indexOf('MSIE '),
                        trident = ua.indexOf('Trident/'),
                        edge = ua.indexOf('Edge/');

                    if (msie > 0) {
                        // IE 10 or older => return version number
                        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
                    }

                    if (trident > 0) {
                        // IE 11 => return version number
                        var rv = ua.indexOf('rv:');
                        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
                    }

                    if (edge > 0) {
                        // IE 12 => return version number
                        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
                    }

                    // other browser
                    return false;
                }

                /**
                 * @ngdoc method
                 * @name getPropertyAllSides
                 * @methodOf angularVideoBg.directive:videoBg
                 * @description This method takes a property such as margin and returns the computed styles for all four
                 * sides of the parent container.
                 * @param {string} property - the css property to get
                 * @param {Function} func - the function to call on computedStyles
                 * @returns {object} - object that contains all four property sides (top, right, bottom, top)
                 * @example
                 * getPropertyAllSides('margin', computedStyles.getPropertyValue);
                 * // returns { margin-top: 10, margin-right: 10, margin-bottom: 10, margin-left: 10 }
                 */
                function getPropertyAllSides(property, func) {
                    var sides = ['top', 'right', 'bottom', 'left'],
                        getProperty = function(obj, side) {
                            obj[side] = parseInt(func.call(computedStyles, property + '-' + side), 10);
                            return obj;
                        };
                    return sides.reduce(getProperty, {});
                }

                /**
                 * @ngdoc method
                 * @name calculateParentDimensions
                 * @methodOf angularVideoBg.directive:videoBg
                 * @description This method takes the dimensions (width and height) of the parent, as well as the "spacers"
                 * (simply all of the margin, padding and border values) and adds the margin, padding and border values to
                 * the dimensions in order to get back the outer dimensions of the parent.
                 * @param {object} dimensions - width and height of parent container
                 * @param {object} spacers - margin, padding and border values of parent container
                 * @returns {{width: number, height: number}}
                 * @example
                 *
                 * var dimensions = {
                 *      width: 1000,
                 *      height: 400
                 * };
                 *
                 * var spacers = {
                 *      margin: {
                 *          top: 10,
                 *          right: 10,
                 *          bottom: 10,
                 *          left: 10
                 *      },
                 *      padding: {
                 *          top: 0,
                 *          right: 10,
                 *          bottom: 0,
                 *          left: 10
                 *      },
                 *      border: {
                 *          top: 0,
                 *          right: 0,
                 *          bottom: 0,
                 *          left: 0
                 *      }
                 * };
                 *
                 * calculateParentDimensions(dimensions, spacers);
                 * // returns { width: 1040, height: 420 }
                 *
                 */
                function calculateParentDimensions(dimensions, spacers) {
                    function calculateSpacerValues() {
                        var args = Array.prototype.slice.call(arguments),
                            spacer,
                            sum = 0,
                            sumValues = function(_sum, arg) {
                                return spacer[arg] ? _sum + spacer[arg] : _sum;
                            };
                        for (var key in spacers) {
                            if (spacers.hasOwnProperty(key)) {
                                spacer = spacers[key];
                                sum += args.reduce(sumValues, 0);
                            }
                        }
                        return sum;
                    }
                    return {
                        width: dimensions.width + calculateSpacerValues('left', 'right'),
                        height: (detectIE() && detectIE() < 12) ? dimensions.height : dimensions.height + calculateSpacerValues('top', 'bottom')
                    };
                }

                function styleContentElements() {
                    var $content = element.children().eq(1),
                        hasContent = !!$content.children().length,
                        parentChildren = Array.prototype.slice.call(element.parent().children());
                    element.parent().css({
                        position: 'relative',
                        overflow: 'hidden'
                    });
                    if (!hasContent) {
                        element.css({
                            position: 'absolute',
                            left: '0',
                            top: '0'
                        });
                        var i = parentChildren.indexOf(element[0]);
                        if (i > -1) {
                            parentChildren.splice(i, 1);
                        }
                        $content = angular.element(parentChildren);
                    }
                    $content.css({
                        position: 'relative',
                        zIndex: scope.contentZIndex || 99
                    });
                }

                /**
                 * @ngdoc method
                 * @name getParentDimensions
                 * @methodOf angularVideoBg.directive:videoBg
                 * @description This method utilizes the getPropertyAllSides and calculateParentDimensions in order to get
                 * the parent container dimensions and return them.
                 * @returns {{width: number, height: number}}
                 */
                function getParentDimensions() {
                    computedStyles = $window.getComputedStyle(element.parent()[0]);
                    var dimensionProperties = ['width', 'height'],
                        spacerProperties = ['border', 'margin'];
                    if (detectIE() && detectIE() < 12) {
                        spacerProperties.push('padding');
                    }
                    dimensionProperties = dimensionProperties.reduce(function(obj, property) {
                        obj[property] = parseInt(computedStyles.getPropertyValue(property), 10);
                        return obj;
                    }, {});
                    spacerProperties = spacerProperties.reduce(function(obj, property) {
                        obj[property] = getPropertyAllSides(property, computedStyles.getPropertyValue);
                        return obj;
                    }, {});
                    return calculateParentDimensions(dimensionProperties, spacerProperties);
                }

                /**
                 * @ngdoc method
                 * @name getPlayerDimensions
                 * @methodOf angularVideoBg.directive:videoBg
                 * @description This method uses the aspect ratio of the video and the height/width of the parent container
                 * in order to calculate the width and height of the video player.
                 * @returns {{width: number, height: number}}
                 */
                function getPlayerDimensions() {
                    var aspectHeight = parseInt(parentDimensions.width / scope.ratio, 10),
                        aspectWidth = parseInt(parentDimensions.height * scope.ratio, 10),
                        useAspectHeight = parentDimensions.height < aspectHeight;
                    return {
                        width: useAspectHeight ? parentDimensions.width : aspectWidth,
                        height: useAspectHeight ? aspectHeight : parentDimensions.height
                    };
                }

                /**
                 * This method simply executes getParentDimensions and getPlayerDimensions when necessary.
                 */
                function updateDimensions() {
                    styleContentElements();
                    parentDimensions = getParentDimensions();
                    playerDimensions = getPlayerDimensions();
                }

                /**
                 * This method simply resizes and repositions the player based on the dimensions of the parent and video
                 * player, it is called when necessary.
                 */
                function resizeAndPositionPlayer() {
                    var options = {
                        zIndex: 1,
                        position: 'absolute',
                        width: playerDimensions.width + 'px',
                        height: playerDimensions.height + 'px',
                        left: parseInt((parentDimensions.width - playerDimensions.width)/2, 10) + 'px',
                        top: parseInt((parentDimensions.height - playerDimensions.height)/2, 10) + 'px'
                    };
                    if (!scope.allowClickEvents) {
                        options.pointerEvents = 'none';
                    }
                    $player.css(options);
                }

                /**
                 * This method simply seeks the video to either the beginning or to the start position (if set).
                 */
                function seekToStart(video) {
                    video = video || scope;
                    player.seekTo(video.start || 0);
                }

                /**
                 * This method handles looping the video better than the native YT embed API player var "loop", especially
                 * when start and end positions are set.
                 */
                function loopVideo(video) {
                    var duration, msDuration;
                    video = video || scope;
                    if (video.end) {
                        duration = video.end - (video.start || 0);
                    } else if (scope.start) {
                        duration = player.getDuration() - video.start;
                    } else {
                        duration = player.getDuration();
                    }
                    msDuration = duration * 1000;
                    console.log('duration', msDuration);
                    videoTimeout = setTimeout(function() {
                        if (scope.playlist) {
                            player.nextVideo();
                        } else {
                            seekToStart(video);
                        }
                    }, msDuration);
                }

                /**
                 * This method handles looping the video better than the native YT embed API player var "loop", especially
                 * when start and end positions are set.
                 */
                function playlistVideoChange() {
                    var videoObj = scope.playlist[player.getPlaylistIndex()];
                    loopVideo(videoObj);
                }

                /**
                 * This is the method called when the "player" object is ready and can be interfaced with.
                 */
                function playerReady() {
                    if (playerCallback) {
                        $timeout(function() {
                            playerCallback({ player: player });
                        });
                    }
                    if (scope.playlist) {
                        player.loadPlaylist(videoArr);
                        if (scope.loop) {
                            player.setLoop(true);
                        }
                    }
                    if (scope.mute && !player.isMuted()) {
                        player.mute();
                    } else if (player.isMuted()) {
                        player.unMute();
                    }
                    seekToStart();
                    scope.$on('$destroy', function() {
                        if (videoTimeout) {
                            clearTimeout(videoTimeout);
                        }
                        angular.element($window).off('resize', windowResized);
                        player.destroy();
                    });
                }

                /**
                 * This is the method called when the "player" object has changed state. It is used here to toggle the video's
                 * display css to block only when the video starts playing, and kick off the video loop (if enabled).
                 */
                function playerStateChange(evt) {
                    if (evt.data === YT.PlayerState.PLAYING) {
                        $player.css('display', 'block');
                        if (!scope.playlist && scope.loop) {
                            loopVideo();
                        }
                        if (scope.playlist && scope.loop) {
                            playlistVideoChange();
                        }
                    }
                    if (evt.data === YT.PlayerState.UNSTARTED && scope.playlist) {
                        var videoObj = scope.playlist[player.getPlaylistIndex()],
                            videoMute = videoObj.mute === undefined ? scope.mute : videoObj.mute;
                        backgroundImage = videoObj.mobileImage || scope.mobileImage || '//img.youtube.com/vi/' + videoObj.videoId + '/maxresdefault.jpg';
                        setBackgroundImage(backgroundImage);
                        $player.css('display', 'none');
                        seekToStart(videoObj);
                        if (videoMute || (videoMute && scope.mute)) {
                            console.log('mute');
                            if (!player.isMuted()) {
                                player.mute();
                            }
                        } else if (!videoMute || !scope.mute) {
                            console.log('unmute');
                            if (player.isMuted()) {
                                player.unMute();
                            }
                        }
                    }
                }

                /**
                 * This method initializes the video player and updates the dimensions and positions for the first time.
                 */
                function initVideoPlayer() {
                    updateDimensions();
                    var playerOptions = {
                        autoplay: 1,
                        controls: 0,
                        iv_load_policy: 3,
                        cc_load_policy: 0,
                        modestbranding: 1,
                        playsinline: 1,
                        rel: 0,
                        showinfo: 0,
                        playlist: scope.videoId
                    };
                    player = new YT.Player(playerId, {
                        width: playerDimensions.width,
                        height: playerDimensions.height,
                        videoId: scope.videoId,
                        playerVars: playerOptions,
                        events: {
                            onReady: playerReady,
                            onStateChange: playerStateChange
                        }
                    });
                    $player = element.children().eq(0);
                    $player.css('display', 'none');
                    resizeAndPositionPlayer();
                }

                function setBackgroundImage(img) {
                    element.parent().css({
                        backgroundImage: 'url(' + img + ')',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center'
                    });
                }

                var windowResized = debounce(function() {
                    updateDimensions();
                    resizeAndPositionPlayer();
                }, 300);

                setBackgroundImage(backgroundImage);

                /**
                 * if it's not mobile or tablet then initialize video
                 */
                if( !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {

                    /**
                     * Check to see if YouTube IFrame script is ready, if it is, resolve ytd defer, if not, wait for
                     * onYouTubeIframeAPIReady to be called by the script to resolve it.
                     */
                    if (!$window.youTubeIframeAPIReady) {
                        var ytd = $q.defer();
                        $window.youTubeIframeAPIReady = ytd.promise;
                        $window.onYouTubeIframeAPIReady = function() {
                            ytd.resolve();
                        };
                    }

                    /**
                     * If YouTube IFrame Script hasn't been loaded, load the library asynchronously
                     */
                    if (!ytScript) {
                        var tag = document.createElement('script');
                        tag.src = "//www.youtube.com/iframe_api";
                        var firstScriptTag = document.getElementsByTagName('script')[0];
                        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                    }

                    /**
                     * When the YouTube IFrame API script is loaded, we initialize the video player.
                     */
                    $window.youTubeIframeAPIReady.then(initVideoPlayer);

                    /**
                     * Anytime the window is resized, update the video player dimensions and position. (this is debounced for
                     * performance reasons)
                     */
                    angular.element($window).on('resize', windowResized);

                }

                scope.$watch('videoId', function(current, old) {
                    if (current && old && current !== old) {
                        clearTimeout(videoTimeout);
                        backgroundImage = scope.mobileImage || '//img.youtube.com/vi/' + current + '/maxresdefault.jpg';
                        setBackgroundImage(backgroundImage);
                        $player.css('display', 'none');
                        player.loadVideoById(current);
                    }
                });

                scope.$watchCollection('playlist', function(current, old) {
                    if (current && old && current !== old) {
                        clearTimeout(videoTimeout);
                        videoArr = current.map(function(videoObj) {
                            return videoObj.videoId;
                        });
                        player.loadPlaylist(videoArr);
                        if (scope.loop) {
                            player.setLoop(true);
                        }
                    }
                });

            }
        };
    }]);






