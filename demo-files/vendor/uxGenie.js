/**
 * uxGenie.js @license
 * (c) 2013 Kent C. Dodds
 * uxGenie.js may be freely distributed under the MIT license.
 * http://www.github.com/kentcdodds/ux-genie
 * See README.md
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./genie'], factory);
  } else {
    root.genieUx = factory(genie);
  }
}(this, function(genie) {

  var uxGenie = angular.module('uxGenie', []);

  uxGenie.constant('genie', genie);

  uxGenie.directive('uxLamp', ['genie', '$timeout', '$document', function(genie, $timeout, $document) {
    return {
      replace: true,
      template: function(el, attr) {
        var ngShow = ' ng-show="lampVisible"';
        if (attr.rubClass) {
          ngShow = '';
        }
        return ['<div class="genie-container"' + ngShow + '>',
          '<input type="text" ng-model="genieInput" class="lamp-input input form-control" />',
          '<div ng-show="matchingWishes.length > 0" class="genie-wishes">',
          '<div class="genie-wish" ' +
            'ng-repeat="wish in matchingWishes" ' +
            'ng-class="{focused: focusedWish == wish}" ' +
            'ng-click="makeWish(wish)" ' +
            'ng-mouseenter="focusOnWish(wish, false)">',
          '<img ng-if="wish.data.uxGenie.imgIcon" ng-src="{{wish.data.uxGenie.imgIcon}}">',
          '<i ng-if="wish.data.uxGenie.iIcon" class="{{wish.data.uxGenie.iIcon}}"></i>',
          '{{wish.data.uxGenie.displayText || wish.magicWords[0]}}',
          '</div></div></div>'].join('');
      },
      scope: {
        lampVisible: '=',
        rubClass: '@',
        rubShortcut: '@',
        rubModifier: '@',
        rubEventType: '@',
        wishCallback: '&',
        localStorage: '='
      },
      link: function(scope, el, attr) {
        var inputEl = angular.element(el.children()[0]);
        var genieOptionContainer = angular.element(el.children()[1]);
        var rubShortcut = scope.rubShortcut || '32';
        var rubModifier = scope.rubModifier || 'ctrlKey';
        var saveToLocalStorage = function() {};

        rubShortcut = parseInt(rubShortcut, 10);
        if (isNaN(rubShortcut)) {
          rubShortcut = rubShortcut[0].charCodeAt(0);
        }

        scope.lampVisible = false;

        function toggleVisibility() {
          scope.$apply(function() {
            scope.lampVisible = !scope.lampVisible;
          });
        }

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
          // If it's not part of the lamp, then make the lamp inlampVisible.
          var clickedElement = event.srcElement || event.target;
          if (clickedElement === el[0]) {
            return;
          }
          var children = el.children();
          for (var i = 0; i < children.length; i++) {
            if (clickedElement === children[i]) {
              return;
            }
          }

          scope.$apply(function() {
            scope.lampVisible = false;
          });
        });

        $document.bind(scope.rubEventType || 'keydown', function(event) {
          if (event.keyCode === rubShortcut) {
            if (rubModifier) {
              if (event[rubModifier]) {
                event.preventDefault();
                toggleVisibility();
              }
            } else {
              event.preventDefault();
              toggleVisibility();
            }
          }
        });

        $document.bind('keydown', function(event) {
          if (event.keyCode === 27 && scope.lampVisible) {
            event.preventDefault();
            scope.$apply(function() {
              scope.lampVisible = false;
            });
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
          scope.wishCallback(genie.makeWish(wish, scope.genieInput));
          saveToLocalStorage(wish);
          scope.$apply(function() {
            scope.lampVisible = false;
          });
        }

        el.bind('keyup', function(event) {
          if (event.keyCode === 13 && scope.focusedWish) {
            scope.makeWish(scope.focusedWish);
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

        if (scope.rubClass) {
          scope.$watch('lampVisible', function(newVal) {
            if (newVal) {
              updateMatchingWishes(scope.genieInput);
              el.addClass(scope.rubClass);
              // Needs to be lampVisible before it can be selected
              $timeout(function() {
                inputEl[0].select();
              }, 25);
            } else {
              el.removeClass(scope.rubClass);
              inputEl[0].blur();
            }
          });
        }

        if (scope.localStorage && localStorage) {
          // Load machine's preferences
          var options = {
            enteredMagicWords: JSON.parse(localStorage.getItem('genie'))
          };
          genie.options(options);

          // Setup update machine's preferences
          saveToLocalStorage = function(wish) {
            // This way 'genie' is never set in local storage until a wish is made.
            localStorage.setItem('genie', JSON.stringify(genie.options().enteredMagicWords, null, 2));
          }
        }

        scope.$watch('genieInput', function(newVal) {
          updateMatchingWishes(newVal);
        });
      }
    }
  }]);

  uxGenie.directive('genieWish', ['genie', function(genie) {
    return {
      scope: {
        wishData: '=?',
        wishAction: '&?'
      },
      link: function(scope, el, attrs) {
        var id = attrs.wishId;
        var context = attrs.wishContext ? attrs.wishContext.split(',') : null;
        var data = scope.wishData || {};
        var uxGenieData = data.uxGenie = data.uxGenie || {};

        uxGenieData.element = el[0];
        uxGenieData.event = attrs.wishEvent || uxGenieData.event || 'click';
        uxGenieData.iIcon = attrs.wishIIcon;
        uxGenieData.imgIcon = attrs.wishImgIcon;

        var action = function(wish) {
          var modifiers = [];
          if (attrs.eventModifiers) {
            modifiers = attrs.eventModifiers.split(',');
          }
          var event = new MouseEvent(wish.data.uxGenie.event, {
            view: window,
            bubbles: true,
            cancelable: true,
            ctrlKey: modifiers.indexOf('ctrlKey') > -1,
            altKey: modifiers.indexOf('altKey') > -1,
            shiftKey: modifiers.indexOf('shiftKey') > -1,
            metaKey: modifiers.indexOf('metaKey') > -1
          });
          wish.data.uxGenie.element.dispatchEvent(event);

          if (attrs.wishAction) {
            scope.wishAction({wish: wish});
          }
        };

        // get magic words
        var magicWords = null;
        ['genieWish', 'name', 'id'].every(function(attrName) {
          magicWords = attrs[attrName];
          return !magicWords;
        });
        if (magicWords) {
          magicWords = magicWords.split(',');
        } else {
          throw new Error('Thrown by the genie-wish directive: All genie-wish elements must have a magic-words, id, or name attribute.');
        }

        genie({
          id: id,
          magicWords: magicWords,
          context: context,
          action: action,
          data: data
        });
      }
    }
  }]);
}));