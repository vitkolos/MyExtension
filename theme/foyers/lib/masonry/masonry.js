angular.module('rubedoBlocks').controller('MasonryCtrl', [
    '$scope',
    '$elements',
    '$timeout',
    function controller($scope, $elements, $timeout) {
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
      // case multiple elementss are removed or added at once.
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
            $elements.masonry.apply($elements, args);
          });
          schedule = [];
        }, 30);
      };
      function defaultLoaded($elements) {
        $elements.addClass('loaded');
      }
      this.appendBrick = function appendBrick(elements, id) {
        if (destroyed) {
          return;
        }
        function _append() {
          if (Object.keys(bricks).length === 0) {
            $elements.masonry('resize');
          }
          if (bricks[id] === undefined) {
            // Keep track of added elementss.
            bricks[id] = true;
            defaultLoaded(elements);
            $elements.masonry('appended', elements, true);
          }
        }
        function _layout() {
          // I wanted to make this dynamic but ran into huuuge memory leaks
          // that I couldn't fix. If you know how to dynamically add a
          // callback so one could say <masonry loaded="callback($elements)">
          // please submit a pull request!
          self.scheduleMasonryOnce('layout');
        }
        if (!self.loadImages) {
          _append();
          _layout();
        } else if (self.preserveOrder) {
          _append();
          elements.imagesLoaded(_layout);
        } else {
          elements.imagesLoaded(function imagesLoaded() {
            _append();
            _layout();
          });
        }
      };
      this.removeBrick = function removeBrick(id, elements) {
        if (destroyed) {
          return;
        }
        delete bricks[id];
        $elements.masonry('remove', elements);
        this.scheduleMasonryOnce('layout');
      };
      this.destroy = function destroy() {
        destroyed = true;
        if ($elements.data('masonry')) {
          // Gently uninitialize if still present
          $elements.masonry('destroy');
        }
        $scope.$emit('masonry.destroyed');
        bricks = {};
      };
      this.reload = function reload() {
        $elements.masonry();
        $scope.$emit('masonry.reloaded');
      };
    }
  ]).directive('masonry', function masonryDirective() {
    return {
      restrict: 'AE',
      controller: 'MasonryCtrl',
      link: {
        pre: function preLink(scope, elements, attrs, ctrl) {
          var attrOptions = scope.$eval(attrs.masonry || attrs.masonryOptions);
          var options = angular.extend({
              itemSelector: attrs.itemSelector || '.masonry-brick',
              columnWidth: parseInt(attrs.columnWidth, 10) || attrs.columnWidth
            }, attrOptions || {});
          elements.masonry(options);
          scope.masonryContainer = elements[0];
          var loadImages = scope.$eval(attrs.loadImages);
          ctrl.loadImages = loadImages !== false;
          var preserveOrder = scope.$eval(attrs.preserveOrder);
          ctrl.preserveOrder = preserveOrder !== false && attrs.preserveOrder !== undefined;
          var reloadOnShow = scope.$eval(attrs.reloadOnShow);
          if (reloadOnShow !== false && attrs.reloadOnShow !== undefined) {
            scope.$watch(function () {
              return elements.prop('offsetParent');
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
          scope.$emit('masonry.created', elements);
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
        pre: function preLink(scope, elements, attrs, ctrl) {
          var id = scope.$id, index;
          ctrl.appendBrick(elements, id);
          elements.on('$destroy', function () {
            ctrl.removeBrick(id, elements);
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








