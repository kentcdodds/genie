/**
 * uxGenie.js @license
 * (c) 2013 Kent C. Dodds
 * uxGenie.js may be freely distributed under the MIT license.
 * http://www.github.com/kentcdodds/ux-genie
 * See README.md
 */

angular.module('uxGenie', []); // Create the module

angular.module('uxGenie').directive('uxLamp', function(genie, uxSpeechRecognition, $timeout, $document) {
  return {
    replace: true,
    template: function(el, attr) {
      var ngShowSesame = ' ng-show="uxOpenSesame"';
      var ngShowLamp = ' ng-show="uxGenieVisible"';
      var microphone = '';
      var sesame = '';

      if (attr.uxOpenSesameClass) {
        ngShowSesame = '';
      }
      if (attr.rubClass) {
        ngShowLamp = '';
      }

      if (attr.micClass && !uxSpeechRecognition.unsupported) {
        microphone = '<i class="' + attr.micClass + '"></i>';
        var sesame = ['<div class="ux-sesame"' + ngShowSesame + '>',
            '<h1>Your wish is my command...</h1>',
            '<div class="sesame-interface">',
              '<div class="sesame-mic"><i class="icon-mic"></i></div>',
              '<div class="genie-controls">',
                '<div class="speech-text">',
                  '<span class="sure">{{sesame.words.sure}}</span>',
                  '<span class="unsure"> {{sesame.words.unsure}}</span>',
                '</div>',
                '<div class="sesame-wish-options">',
                  '<div class="sesame-wish-option"',
                    'ng-repeat="sesameWish in sesame.wishes"',
                    'ng-class="{focused: focusedSesameWish == sesameWish}">{{($index + 1) + \'. \' + (sesameWish.data.displayText || sesameWish.magicWords[0])}}',
                  '</div>',
                '</div>',
              '</div>',
            '</div>',
          '</div>'].join('');
      }
      return ['<div class="genie-container">',
        '<div class="lamp-container"' + ngShowLamp + '>',
          '<input type="text" ng-model="genieInput" class="lamp-input input" />',
          microphone,
          '<div ng-show="matchingWishes.length > 0" class="genie-wishes">',
            '<div class="genie-wish" ' +
              'ng-repeat="wish in matchingWishes" ' +
              'ng-class="{focused: focusedWish == wish}" ' +
              'ng-click="makeWish(wish)" ' +
              'ng-mouseenter="focusOnWish(wish, false)">',
            '{{wish.data.displayText || wish.magicWords[0]}}',
        '</div></div></div>', sesame, '</div>'].join('');
    },
    scope: {
      rubClass: '@',
      rubShortcut: '@',
      rubModifier: '@',
      rubEventType: '@',
      wishCallback: '&',
      localStorage: '=',
      openSesameClass: '@'
    },
    link: function(scope, el, attr) {
      var elChildren = el.children();
      var lampContainer = angular.element(elChildren[0]);
      var sesameEl = elChildren.length > 1 ? angular.element(elChildren[1]) : null;
      var inputEl = angular.element(lampContainer.children()[0]);
      var microphoneEl;
      var genieOptionContainer = angular.element(lampContainer.children()[1]);
      if (sesameEl) {
        microphoneEl = genieOptionContainer;
        genieOptionContainer = angular.element(lampContainer.children()[2]);
      }
      var rubShortcut = scope.rubShortcut || '32';
      var rubModifier = scope.rubModifier || 'ctrlKey';
      var saveToLocalStorage = function() {};

      rubShortcut = parseInt(rubShortcut, 10);
      if (isNaN(rubShortcut)) {
        rubShortcut = rubShortcut[0].charCodeAt(0);
      }

      scope.uxGenieVisible = false;

      function toggleVisibility() {
        scope.$apply(function() {
          scope.uxGenieVisible = !scope.uxGenieVisible;
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

        scope.$apply(function() {
          scope.uxGenieVisible = false;
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
        if (event.keyCode === 27 && scope.uxGenieVisible) {
          event.preventDefault();
          scope.$apply(function() {
            scope.uxGenieVisible = false;
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

      if (microphoneEl) {
        microphoneEl.bind('click', function() {
          scope.$apply(function() {
            scope.uxOpenSesame = true;
            scope.uxGenieVisible = false;
          });
        });
      }

      // Making a wish
      scope.makeWish = function(wish) {
        scope.wishCallback(genie.makeWish(wish, scope.genieInput));
        saveToLocalStorage(wish);
        scope.$apply(function() {
          updateMatchingWishes(scope.genieInput);
          scope.uxGenieVisible = false;
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
        scope.$watch('uxGenieVisible', function(newVal) {
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


      /*
       * Sesame stuff
       */
      if (uxSpeechRecognition.unsupported) {
        return;
      }
      var numberMap = {
        one: 1, what: 1,
        two: 2, tube: 2,
        three: 3, tree: 3,
        four: 4, for: 4,
        five: 5, fine: 5,
        six: 6, text: 6,
        seven: 7,
        eight: 8, att: 8,
        nine: 9,
        ten: 10
      };

      scope.sesame = scope.sesame || {
        wishes: [],
        words: {
          sure: '',
          unsure: ''
        }
      };

      $document.bind('keyup', function(event) {
        if (event.which === 27) {
          scope.openSesame = false;
        }
      });

      scope.$watch('uxOpenSesame', function(isVisible) {
        if (isVisible) {
          uxSpeechRecognition.start();
          if (scope.openSesameClass) {
            sesameEl.addClass(scope.openSesameClass);
          }
        } else {
          uxSpeechRecognition.abort();
          if (scope.openSesameClass) {
            sesameEl.removeClass(scope.openSesameClass);
          }
        }
      });

      uxSpeechRecognition.initialize({
        onSureResult: function(results) {
          scope.sesame.words.unsure = '';
          handleResult(results, 'sure');
        },
        onUnsureResult: function(results) {
          scope.sesame.words.sure = '';
          handleResult(results, 'unsure');
        }
      });

      var handleResult = function(results, wordType) {
        if (!results.length) {
          return;
        }
        var newText = results[0].text;
        var number = numberMap[newText.toLowerCase()] || parseInt(newText);
        if (number) {
          scope.sesame.wishes = [scope.sesame.wishes[number - 1]];
        } else {
          scope.sesame.words[wordType] = newText;
          scope.sesame.wishes = getCurrentWishes();
        }
        if (scope.sesame.wishes.length === 1 && wordType === 'sure') {
          makeWish(0);
        } else if (scope.sesame.wishes.length === 0) {
          setTimeout(function(){
            scope.sesame.words.sure = '';
            scope.sesame.words.unsure = '';
            safeApply(scope);
          }, 4000);
        }
        safeApply(scope);
      };

      var safeApply = function(scope, fn) {
        (scope.$$phase || scope.$root.$$phase) ? fn() : scope.$apply(fn);
      };

      var getCurrentWishes = function() {
        var wishes = [];
        if (scope.sesame.words.sure) {
          wishes = wishes.concat(genie.getMatchingWishes(scope.sesame.words.sure));
        }
        if (scope.sesame.words.unsure) {
          wishes = wishes.concat(genie.getMatchingWishes(scope.sesame.words.unsure));
        }
        for (var i = 0; i < wishes.length; ++i) {
          for (var j = i + 1; j < wishes.length; ++j) {
            if (wishes[i] === wishes[j])
              wishes.splice(j--, 1);
          }
        }
        return wishes;
      };

      var makeWish = function(index) {
        if (scope.sesame.wishes.length - 1 < index) {
          return;
        }
        genie.makeWish(scope.sesame.wishes[index], scope.sesame.words.sure);
        scope.sesame.words.sure = '';
        scope.sesame.words.unsure = '';
        scope.sesame.wishes = [];
      };
    }
  }
});

angular.module('uxGenie').factory('uxSpeechRecognition', function($window) {
  var SpeechRecognition = $window.webkitSpeechRecognition ||
      $window.mozSpeechRecognition ||
      $window.msSpeechRecognition ||
      $window.oSpeechRecognition ||
      $window.SpeechRecognition;

  var recognition, callbacks, hearing, alwaysListen,
    onSureResult, onUnsureResult, activationCommands;

  if (!SpeechRecognition) {
    return {unsupported: true};
  }

  var uxSpeechRecognition = {
    initialize: function(options) {
      options = options || {};
      recognition = new SpeechRecognition();

      recognition.maxAlternatives = 5;
      recognition.continuous = true;
      recognition.lang = 'en-US';
      recognition.interimResults = true;

      alwaysListen = !!options.activationCommands;
      hearing = !!options.hearing;
      callbacks = options.callbacks || {};
      activationCommands = options.activationCommands || {};
      onSureResult = options.onSureResult || function() {};
      onUnsureResult = options.onUnsureResult || function() {};


      recognition.onstart = function() {
        if (callbacks.onstart) {
          callbacks.onstart();
        }
      };

      recognition.onerror = function() {
        if (callbacks.onerror) {
          callbacks.onerror();
        }
      };

      recognition.onend = function() {
        if (callbacks.onend) {
          callbacks.onend();
          hearing = false;
          if (alwaysListen) {
            uxSpeechRecognition.start();
          }
        }
      };

      recognition.onresult = function(event) {
        if (callbacks.onresult) {
          callbacks.onresult(event);
        }

        var sureResults = [];
        var unsureResults = [];

        var results = event.results[event.resultIndex];
        var commandText;
        var confidence;
        var sureUnique = {};
        var unsureUnique = {};

        for (var i = 0; i < results.length; i++) {
          commandText = results[i].transcript.trim().toLowerCase();
          confidence = results[i].confidence;
          if (hearing) {
            if (event.results[event.resultIndex].isFinal) {
              if (!sureUnique[commandText]) {
                sureResults.push({text: commandText, confidence: confidence});
                sureUnique[commandText] = true;
              }
            } else {
              if (!unsureUnique[commandText]) {
                unsureResults.push({text: commandText, confidence: confidence});
                unsureUnique[commandText] = true;
              }
            }
          } else {
            for (var regex in activationCommands) {
              if (new RegExp(regex, 'i').exec(commandText)) {
                hearing = true;
                activationCommands[regex]();
                return;
              }
            }
          }
        }

        var sortResults = function(a, b) {
          return b.confidence - a.confidence; // Highest to lowest
        };

        onSureResult(sureResults.sort(sortResults));
        onUnsureResult(unsureResults.sort(sortResults));

        return false;
      };

      if (alwaysListen) {
        uxSpeechRecognition.start();
      }
    },

    start: function() {
      recognition.start();
    },

    abort: function() {
      recognition.abort();
    },

    setLanguage: function(language) {
      if (recognition && recognition.abort) {
        recognition.lang = language;
      }
    }
  }

  return uxSpeechRecognition;
});