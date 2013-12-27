'use strict';

(function() {
  var app = angular.module('genieApp', ['uxGenie', 'ga']);

  // Makes this modular if we don't just use the global instance and use it as a module instead  
  app.constant('genie', genie);

  app.controller('GenieCtrl', function($scope, genie, ga) {
    $scope.demoContext = 'genie-demo';
    $scope.iconPrefix = 'glyphicon glyphicon-';
    $scope.iconPrefix = {
      b: 'glyphicon glyphicon-',
      f: 'fa fa-'
    }
    genie.context($scope.demoContext);

    $scope.genieVisible = false;
    
    $scope.genieStyle = {
      color: 'light',
      size: 'large',
      animationSpeed: 'fast'
    };
    $scope.wishesMade = 0;
    $scope.wishMade = function(wish) {
      $scope.wishesMade++;
      ga('send', 'event', 'wish', 'made', $scope.wishesMade);
    };

    $scope.wishMagicWords = '';
    
    $scope.exportOrImportGenie = function() {
      if ($scope.genieExportImport) {
        genie.options(JSON.parse($scope.genieExportImport));
      } else {
        $scope.genieExportImport = JSON.stringify(genie.options(), null, 2);
      }
    };

    $scope.addWishFromInput = function() {
      if ($scope.wishMagicWords) {
        ga('send', 'event', 'button', 'click', 'Create Wish: ' + $scope.wishMagicWords);
        addWish($scope.wishMagicWords, null, {
          uxGenie: {
            iIcon: 'glyphicon glyphicon-exclamation-sign'
          }
        });
        $scope.wishMagicWords = '';
      }
    };

    function addWish(magicWords, action, data) {
      if (typeof magicWords === 'string') {
        magicWords = magicWords.split(',');
      }
      return genie({
        magicWords: magicWords,
        action: action || function(wish) {
          alert('Your "' + wish.magicWords[0] + '" wish is my command!');
        },
        context: $scope.demoContext,
        data: data
      });
    }
    
    function addStyleWish(style, altStyle, property, iIcon, altiIcon) {
      var originalWish, altWish;
      function swapWishes(wish) {
        genie.removeContext(wish.context.all);
        genie.addContext(wish.data.otherWish.context.all);
      }
      function applyStyleAndSwapWishes(wish) {
        $scope.genieStyle[property] = wish.data.style.toLowerCase();
        swapWishes(wish);
      }
      originalWish = genie({
        magicWords: 'Make lamp ' + style,
        context: {
          all: ['genie-style-' + property + '-' + style, $scope.demoContext]
        },
        action: applyStyleAndSwapWishes,
        data: {
          style: style,
          uxGenie: {
            iIcon: 'glyphicon glyphicon-' + iIcon
          }
        }
      });
      altWish = genie({
        magicWords: 'Make lamp ' + altStyle,
        context: {
          all: ['genie-style-' + property + '-' + altStyle, $scope.demoContext]
        },
        action: applyStyleAndSwapWishes,
        data: {
          style: altStyle,
          otherWish: originalWish,
          uxGenie: {
            iIcon: 'glyphicon glyphicon-' + altiIcon
          }
        }
      });
      originalWish.data.otherWish = altWish;
      $scope.$watch('genieStyle["' + property + '"]', function(newVal) {
        if (newVal === style.toLowerCase()) {
          swapWishes(originalWish);
        } else {
          swapWishes(altWish);
        }
      });
    }
    
    addStyleWish('Dark', 'Light', 'color', 'picture', 'picture');
    addStyleWish('Small', 'Large', 'size', 'resize-small', 'resize-full');
    addStyleWish('Slow', 'Fast', 'animationSpeed', 'fast-backward', 'fast-forward');

    var genieTagline = encodeURIComponent('Genie: Better than keyboard shortcuts');
    var genieHome = encodeURIComponent('http://kent.doddsfamily.us/genie');

    function addNavigateWishWithoutPrefix(magicWord, shareUrl, iIcon) {
      addWish(magicWord, {
        destination: shareUrl,
        openNewTab: true
      }, {
        uxGenie: {
          iIcon: iIcon
        }
      });
    }

    addNavigateWishWithoutPrefix('Tweet #GenieJS', 'https://twitter.com/intent/tweet?hashtags=GenieJS&original_referer=' + genieHome + '&text=' + genieTagline + '&tw_p=tweetbutton&url=' + genieHome + '&via=kentcdodds', $scope.iconPrefix.f + 'share');
    addNavigateWishWithoutPrefix('Share #GenieJS on Google+', 'http://plus.google.com/share?&url=' + genieHome, $scope.iconPrefix.f + 'share');
    addNavigateWishWithoutPrefix('Email about GenieJS', 'mailto:?&subject=' + encodeURIComponent('Cool JavaScript Library: Genie') + '&body=' + genieTagline + encodeURIComponent('\nCheck it out here: ') + genieHome, $scope.iconPrefix.f + 'envelope');
    
    addNavigateWishWithoutPrefix('Code with @kentcdodds', 'http://www.github.com/kentcdodds', $scope.iconPrefix.f + 'github');
    addNavigateWishWithoutPrefix('Follow @kentcdodds', 'https://twitter.com/intent/follow?original_referer=' + genieHome + '&region=follow_link&screen_name=kentcdodds&tw_p=followbutton&variant=2.0', $scope.iconPrefix.f + 'twitter');
    addNavigateWishWithoutPrefix('Circle +KentCDodds', 'http://plus.google.com/+KentCDodds', $scope.iconPrefix.f + 'google-plus');
    addNavigateWishWithoutPrefix('Visit Kent\'s website', 'http://kent.doddsfamily.us', $scope.iconPrefix.f + 'globe');

  });

})();