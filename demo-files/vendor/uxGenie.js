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
    var states = {
      userEntry: 'userentry',
      subContext: 'subcontext'
    };
    return {
      replace: true,
      transclude: true,
      template: function(el, attr) {
        var ngShow = !attr.rubClass ? ' ng-show="lampVisible"' : '';
        var template = '<div class="genie-lamp-container"' + ngShow + ' ng-transclude></div>';
        if (!attr.uxLamp) {
          template = ['<div class="genie-lamp-container"' + ngShow + '>',
            '<input type="text" ng-model="uxLamp.input" class="lamp-input input form-control" />',
            '<div ng-show="uxLamp.matchingWishes.length > 0" class="lamp-wishes-container">',
              '<div class="lamp-wish wish-{{wish.id}}" ' +
                'ng-repeat="wish in uxLamp.matchingWishes" ' +
                'ng-class="{focused: uxLamp.focusedWish == wish}" ' +
                'ng-click="uxLamp.makeWish(wish)" ' +
                'ng-mouseenter="uxLamp.focusOnWish(wish, false)">',
                  '<span class="wish-icon" ng-class="{\'has-img\': wish.data.uxGenie.imgIcon, \'has-i\': wish.data.uxGenie.iIcon}">',
                    '<img class="wish-img-icon" ng-if="wish.data.uxGenie.imgIcon" ng-src="{{wish.data.uxGenie.imgIcon}}">',
                    '<i class="wish-i-icon {{wish.data.uxGenie.iIcon}}" ng-if="wish.data.uxGenie.iIcon"></i>',
                  '</span>',
                  '<span class="wish-display-text">{{wish.data.uxGenie.displayText || wish.magicWords[0]}}</span>',
                '</div>',
              '</div>',
            '</div>'].join('');
        }
        return template;
      },
      scope: {
        uxLamp: '=?',
        lampVisible: '=?',
        rubClass: '@',
        rubShortcut: '@',
        rubModifier: '@',
        rubEventType: '@',
        wishCallback: '&?',
        localStorage: '@',
        firebase: '@'
      },
      link: function(scope, el) {
        scope.uxLamp = scope.uxLamp || {};
        scope.uxLamp.input = '';
        scope.uxLamp.state = states.userEntry;
        scope.lampVisible = false;

        var mathResultId = 'ux-genie-math-result';
        var startTextForSubContext = null;
        var preSubContextContext = null;

        function findFirstChild(el, className) {
          var container = null;
          if (el.hasClass(className)) {
            container = el;
          } else {
            var children = el.children();
            for (var i = 0; i < children.length; i++) {
              container = findFirstChild(angular.element(children[i]), className);
              if (container) {
                break;
              }
            }
          }
          return container;
        }

        var inputEl = findFirstChild(el, 'lamp-input');
        var lampWishesContainer = findFirstChild(el, 'lamp-wishes-container');

        var rubShortcut = scope.rubShortcut || '32';
        var rubModifier = scope.rubModifier || 'ctrlKey';

        rubShortcut = parseInt(rubShortcut, 10);
        if (isNaN(rubShortcut)) {
          rubShortcut = rubShortcut[0].charCodeAt(0);
        }


        /*
         * Setup persistance
         */
        if (scope.firebase && scope.localStorage) {
          throw new Error('ux-lamp cannot have both firebase and local-storage attributes. Choose one or the other.');
        }

        var firebaseRef = null;
        if (scope.firebase) {
          if  (typeof Firebase === 'function') {
            firebaseRef = new Firebase(scope.firebase);
          } else {
            throw new Error('ux-lamp cannot use the given firebase url without the "Firebase" global variable.');
          }
        }

        function saveToLocalStorage(key, words) {
          if (key && localStorage) {
            var json = JSON.stringify(words);
            localStorage.setItem(key, json);
          }
        }

        function saveToFirebase(ref, words) {
          if (ref) {
            ref.set(words);
          }
        }

        function saveGenie () {
          var words = genie.options().enteredMagicWords;
          saveToLocalStorage(scope.localStorage, words);
          saveToFirebase(firebaseRef, words);
        }

        if (firebaseRef) {
          firebaseRef.on('value', function(snapshot) {
            genie.options({
              enteredMagicWords: snapshot.val()
            });
          });
        } else if (scope.localStorage && localStorage) {
          genie.options({
            enteredMagicWords: JSON.parse(localStorage.getItem(scope.localStorage))
          });
        }


        /*
         * Helpers
         */
        function safeApply(fn) {
          var phase = scope.$root.$$phase;
          if(phase == '$apply' || phase == '$digest') {
            scope.$eval(fn);
          }
          else {
            scope.$apply(fn);
          }
        }

        function toggleVisibility(state) {
          safeApply(function() {
            if (typeof state === 'boolean') {
              scope.lampVisible = !state;
            }
            scope.lampVisible = !scope.lampVisible;
          });
        }
        function getElementOuterHeight(element, includeMargin) {
          var cs = document.defaultView.getComputedStyle(element, '');

          var height = parseInt(cs.getPropertyValue('height'));
          var mTop = includeMargin ? parseInt(cs.getPropertyValue('margin-top')) : 0;
          var mBottom = includeMargin ? parseInt(cs.getPropertyValue('margin-bottom')) : 0;
          return height + mTop + mBottom;
        }

        function scrollToWish(index) {
          var containerEl = lampWishesContainer[0];
          var containerHeight = getElementOuterHeight(containerEl);
          var focusedWishElement = lampWishesContainer.children()[index];
          var containerTop = containerEl.scrollTop;
          var containerBottom = containerTop + containerHeight;
          var focusedWishTop = 0;
          var wishElements = lampWishesContainer.children();
          for (var i = 0; i < wishElements.length; i++) {
            if (i >= index) break;
            focusedWishTop += getElementOuterHeight(wishElements[i], true);
          }
          var focusedWishBottom = focusedWishTop + getElementOuterHeight(focusedWishElement, true);
          if (containerBottom < focusedWishBottom) {
            containerEl.scrollTop = focusedWishBottom - containerHeight;
          } else if (containerTop > focusedWishTop) {
            containerEl.scrollTop = focusedWishTop;
          }
        }

        /*
         * Wish focus
         */
        scope.uxLamp.focusOnWish = function(wishElement, autoScroll) {
          scope.uxLamp.focusedWish = wishElement;
          if (scope.uxLamp.focusedWish && autoScroll) {
            scrollToWish(scope.uxLamp.matchingWishes.indexOf(wishElement));
          }
        };

        /*
         * Document events
         */
        $document.bind('click', function(event) {
          // If it's not part of the lamp, then make the lamp invisible.
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
          if (scope.lampVisible) {
            toggleVisibility(false);
          }
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
            toggleVisibility(false);
          }
        });

        /*
         * Input events
         */
        function changeSelection(change, event) {
          var wishes = scope.uxLamp.matchingWishes;
          if (wishes && change) {
            if (event) {
              event.preventDefault();
            }
            var index = wishes.indexOf(scope.uxLamp.focusedWish);
            var newIndex = index + change;
            var totalWishes = wishes.length;
            if (newIndex < 0) {
              newIndex = newIndex + totalWishes;
            } else if (newIndex >= totalWishes) {
              newIndex = newIndex - totalWishes;
            }
            safeApply(function() {
              scope.uxLamp.focusOnWish(wishes[newIndex], true);
            });
          }
        }
        
        inputEl.bind('keydown', (function() {
          return function keydownHandler(event) {
            var change = 0;
            switch(event.keyCode) {
              case 9:
                event.preventDefault();
                var focusedWish = scope.uxLamp.focusedWish;
                if (_isSubContextWish(focusedWish)) {
                  _setSubContextState(focusedWish);
                }
                break;
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

        function _setSubContextState(wish) {
          if (scope.uxLamp.state !== states.subContext) {
            scope.uxLamp.state = states.subContext;
            startTextForSubContext = wish.magicWords[0] + ' ';
            if (wish.data && wish.data.uxGenie && wish.data.uxGenie.displayText) {
              startTextForSubContext = wish.data.uxGenie.displayText;
            }
            preSubContextContext = genie.context();
            genie.context(wish.data.uxGenie.subContext);
            safeApply(function() {
              scope.uxLamp.input = startTextForSubContext;
            });
          }
        }

        function _exitSubContext() {
          genie.context(preSubContextContext);
          scope.uxLamp.state = states.userEntry;
          startTextForSubContext = null;
          preSubContextContext = null;
        }

        /*
         * Making a wish
         */
        scope.uxLamp.makeWish = function(wish) {
          var makeWish = true;
          var magicWord = scope.uxLamp.input;
          if (magicWord.indexOf('\'') === 0) {
            magicWord = magicWord.substring(1);
          }
          if (scope.uxLamp.state === states.subContext) {
            magicWord = magicWord.substring(startTextForSubContext.length);
          }
          var makeInvisible = true;
          if (wish.id === mathResultId) {
            makeWish = false;
          }

          if (_isSubContextWish(wish)) {
            // Make the wish before the context changes.
            genie.makeWish(wish, magicWord);
            saveGenie();
            _setSubContextState(wish);
            makeInvisible = false;
            makeWish = false;
          }

          if (makeWish) {
            wish = genie.makeWish(wish, magicWord);
            saveGenie();
          }

          scope.wishCallback({
            wish: wish,
            magicWord: magicWord
          });
          if (makeInvisible) {
            toggleVisibility(false);
          }
        };

        el.bind('keyup', function(event) {
          if (event.keyCode === 13 && scope.uxLamp.focusedWish) {
            scope.uxLamp.makeWish(scope.uxLamp.focusedWish);
          }
        });

        /*
         * Updating list of wishes
         */
        function updateMatchingWishes(magicWord) {
          if (magicWord) {
            if (magicWord.indexOf('\'') === 0) {
              magicWord = magicWord.substring(1);
            }
            scope.uxLamp.matchingWishes = genie.getMatchingWishes(magicWord);
            if (scope.uxLamp.matchingWishes.length > 0) {
              scope.uxLamp.focusedWish = scope.uxLamp.matchingWishes[0];
            } else {
              scope.uxLamp.focusedWish = null;
            }
          } else {
            scope.uxLamp.matchingWishes = null;
            scope.uxLamp.focusedWish = null;
          }
        }

        function handleInputChange(newVal) {
          if (scope.uxLamp.state === states.subContext) {
            if (newVal.indexOf(startTextForSubContext.trim()) === 0) {
              newVal = newVal.substring(startTextForSubContext.length);
            } else {
              _exitSubContext();
            }
          }
          updateMatchingWishes(newVal);
          var firstWish = null;
          var firstWishDisplay = null;
          if (scope.uxLamp.matchingWishes && scope.uxLamp.matchingWishes.length > 0) {
            firstWish = scope.uxLamp.matchingWishes[0];
            firstWishDisplay = firstWish.magicWords[0];
            if (firstWish.data && firstWish.data.uxGenie && firstWish.data.uxGenie.displayText) {
              firstWishDisplay = firstWish.data.uxGenie.displayText;
            }
          }

          if (firstWish && scope.uxLamp.matchingWishes.length === 1 &&
            _isSubContextWish(firstWish) && firstWishDisplay === newVal) {
            _setSubContextState(firstWish);
          }

          var result = _evaluateMath(newVal || '');
          if (angular.isNumber(result)) {
            scope.uxLamp.matchingWishes = scope.uxLamp.matchingWishes || [];
            scope.uxLamp.matchingWishes.unshift({
              id: mathResultId,
              data: {
                uxGenie: {
                  displayText: newVal + ' = ' + result
                }
              }
            });
            scope.uxLamp.focusedWish = scope.uxLamp.matchingWishes[0];
          }
        }

        scope.$watch('lampVisible', function(lampIsVisible) {
          if (lampIsVisible) {
            handleInputChange(scope.uxLamp.input);
            if (scope.rubClass) {
              el.addClass(scope.rubClass);
              // Needs to be lampVisible before it can be selected
              $timeout(function() {
                inputEl[0].select();
              }, 25);
            } else {
              inputEl[0].select();
            }
          } else {
            if (scope.rubClass) {
              el.removeClass(scope.rubClass);
            }
            inputEl[0].blur();
          }
        });

        function _isSubContextWish(wish) {
          return !!wish && !!wish.data && !!wish.data.uxGenie && !!wish.data.uxGenie.subContext;
        }

        function _evaluateMath(expression) {
          var mathRegex = /(?:[a-z$_][a-z0-9$_]*)|(?:[;={}\[\]"'!&<>^\\?:])/ig;
          var valid = true;

          expression = expression.replace(mathRegex, function(match) {
            if (Math.hasOwnProperty(match)) {
              return 'Math.' + match;
            } else {
              valid = false;
            }
          });

          if (!valid) {
            return false;
          } else {
            try {
              return eval(expression);
            } catch (e) {
              return false;
            }
          }
        }

        scope.$watch('uxLamp.input', handleInputChange);
      }
    }
  }]);

  uxGenie.directive('genieWish', ['genie', function(genie) {
    return {
      scope: true,
      link: function(scope, el, attrs) {
        var id = attrs.wishId;
        var context = attrs.wishContext ? attrs.wishContext.split(',') : null;
        var data = attrs.wishData || {};
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
        };

        // get magic words
        var magicWords = null;
        ['genieWish', 'name', 'id'].every(function(attrName) {
          magicWords = attrs[attrName];
          return !magicWords;
        });
        magicWords = magicWords || el.text();
        magicWords = magicWords.replace(/\\,/g, '{{COMMA}}');
        if (magicWords) {
          magicWords = magicWords.split(',');
        } else {
          throw new Error('Thrown by the genie-wish directive: All genie-wish elements must have a magic-words, id, or name attribute.');
        }
        for (var i = 0; i < magicWords.length; i++) {
          magicWords[i] = magicWords[i].replace(/\{\{COMMA\}\}/g, ',');
        }

        var wishRegistered = false;
        attrs.$observe('ignoreWish', function(newVal) {
          if (newVal !== 'true' && !wishRegistered) {
            genie({
              id: id,
              magicWords: magicWords,
              context: context,
              action: action,
              data: data
            });
            wishRegistered = true;
          }
        });
      }
    }
  }]);
}));