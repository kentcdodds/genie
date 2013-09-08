/**
 * ngGenie.js @license
 * (c) 2013 Kent C. Dodds
 * ngGenie.js may be freely distributed under the MIT license.
 * http://www.github.com/kentcdodds/ng-genie
 * See README.md
 */

angular.module('ngGenie', []).directive('ngLamp', function(genie, $timeout, $document) {
  return {
    replace: true,
    template: function(el, attr) {
      var ngShow = ' ng-show="ngGenieVisible"';
      if (attr.rubClass) {
        ngShow = '';
      }
      return ['<div class="genie-container"' + ngShow + '>',
        '<input type="text" ng-model="genieInput" />',
        '<div class="genie-options">',
          '<div class="genie-option" ' +
            'ng-repeat="wish in matchingWishes" ' +
            'ng-class="{focused: focusedWish == wish}" ' +
            'ng-click="makeWish(wish)" ' +
            'ng-mouseenter="focusOnWish(wish, false)">',
          '{{wish.data.displayText}}',
        '</div></div></div>'].join('');
    },
    scope: {
      rubClass: '@',
      rubShortcut: '@',
      rubModifier: '@',
      rubEventType: '@'
    },
    link: function(scope, el, attr) {
      var inputEl = angular.element(el.children()[0]);
      var genieOptionContainer = angular.element(el.children()[1]);
      if (!scope.rubShortcut) {
        scope.rubShortcut = "32";
        scope.rubModifier = "ctrlKey";
      }
      var rubShortcut = parseInt(scope.rubShortcut, 10);
      if (isNaN(rubShortcut)) {
        rubShortcut = scope.rubShortcut[0].charCodeAt(0);
      }

      scope.ngGenieVisible = false;

      // Wish focus
      scope.focusOnWish = function(wishElement, autoScroll) {
        scope.focusedWish = wishElement;
        if (autoScroll) {
          scrollToWish(scope.matchingWishes.indexOf(wishElement));
        }
      };

      function scrollToWish(index) {
        var containerHeight = genieOptionContainer[0].offsetHeight || genieOptionContainer[0].clientHeight;
        var focusedWishElement = genieOptionContainer.children()[index];
        var containerTop = genieOptionContainer[0].scrollTop;
        var containerBottom = containerTop + containerHeight;
        var focusedWishTop = 0;
        angular.forEach(genieOptionContainer.children(), function(child, childIndex) {
          if (childIndex < index) {
            focusedWishTop += child.offsetHeight || child.clientHeight;
          }
        });
        var focusedWishBottom = focusedWishTop + focusedWishElement.offsetHeight || focusedWishElement.clientHeight;
        if (containerBottom < focusedWishBottom) {
          genieOptionContainer[0].scrollTop = focusedWishBottom - containerHeight;
        } else if (containerTop > focusedWishTop) {
          genieOptionContainer[0].scrollTop = focusedWishTop;
        }
      }

      // Document events
      $document.bind('click', function(event) {
        if (el.find(event.srcElement).length < 1) {
          scope.$apply(function() {
            scope.ngGenieVisible = false;
          });
        }
      });

      $document.bind(scope.rubEventType || 'keydown', function(event) {
        if (event.keyCode === rubShortcut) {
          event.preventDefault();
          if (scope.rubModifier) {
            if (event[scope.rubModifier]) {
              scope.ngGenieVisible = !scope.ngGenieVisible;
            }
          } else {
            scope.ngGenieVisible = !scope.ngGenieVisible;
          }
        }
      });

      $document.bind('keydown', function(event) {
        if (event.keyCode === 27 && scope.ngGenieVisible) {
          event.preventDefault();
          scope.ngGenieVisible = false;
        }
      });

      // Input events
      inputEl.bind('keydown', (function() {
        var changeSelection = function(change, event) {
          if (scope.matchingWishes && change) {
            if (event) {
              event.preventDefault();
            }
            var index = scope.matchingWishes.indexOf(scope.focusedWish);
            var newIndex = index + change;
            if (newIndex < 0) {
              newIndex = newIndex + scope.matchingWishes.length;
            } else if (newIndex >= scope.matchingWishes.length) {
              newIndex = newIndex - scope.matchingWishes.length;
            }
            scope.$apply(function() {
              scope.focusOnWish(scope.matchingWishes[newIndex], true);
            });
          }
        }
        return function keydownHandler(event) {
          var change = 0;
          switch(event.keyCode) {
            case 38:
              change = -1;
              break;
            case 40:
              change = 1;
              break;
          }
          if (event.shiftKey) {
            change *= 5;
          }
          changeSelection(change, event);
        }
      })());

      // Making a wish
      scope.makeWish = function(wish) {
        genie.makeWish(wish, scope.genieInput);
        updateMatchingWishes(scope.genieInput);
        scope.ngGenieVisible = false;
      }

      el.bind('keyup', function(event) {
        if (event.keyCode === 13 && scope.focusedWish) {
          genie.makeWish(scope.focusedWish, scope.genieInput);
          scope.$apply(function() {
            updateMatchingWishes(scope.genieInput);
            scope.ngGenieVisible = false;
          });
        }
      });

      // Updating list of wishes
      function updateMatchingWishes(magicWord) {
        if (magicWord) {
          if (magicWord.indexOf('\'') === 0) {
            magicWord = magicWord.substring(1);
          }
          scope.matchingWishes = genie.getMatchingWishes(magicWord);
          if (scope.matchingWishes.length > 0) {
            scope.focusedWish = scope.matchingWishes[0];
          } else {
            scope.focusedWish = null;
          }
        } else {
          scope.matchingWishes = null;
          scope.focusedWish = null;
        }
      }

      scope.$watch('ngGenieVisible', function(newVal) {
        if (newVal) {
          el.addClass(scope.rubClass);
          // Needs to be visible before it can be selected
          $timeout(function() {
            inputEl[0].select();
          }, 25);
        } else {
          el.removeClass(scope.rubClass);
          inputEl[0].blur();
        }
      });
      
      scope.$watch('genieInput', function(newVal) {
        updateMatchingWishes(newVal);
      });

    }
  }
});
