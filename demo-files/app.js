'use strict';

(function() {
  var app = angular.module('genieApp', ['uxGenie', 'ga']);

  // Makes this modular if we don't just use the global instance and use it as a module instead  
  app.constant('genie', genie);

  app.controller('GenieCtrl', function($scope, genie, ga) {

    $scope.genieVisible = false;
    $scope.openSesame = false;

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

    $scope.sesameMicClicked = function() {
      $scope.$apply(function() {
        $scope.genieVisible = false;
        $scope.openSesame  = true;
      });
    }

    $scope.exportOrImportGenie = function() {
      if ($scope.genieExportImport) {
        genie.options(JSON.parse($scope.genieExportImport));
      } else {
        $scope.genieExportImport = JSON.stringify(genie.options(), null, 2);
      }
    };
    
    $scope.addWishFromInput = function() {
      if ($scope.wish) {
        ga('send', 'event', 'button', 'click', 'Create Wish');
        addWish($scope.wish.displayText, $scope.wish.magicWords, $scope.wish.id);
        $scope.wish.displayText = '';
        $scope.wish.magicWords = '';
        $scope.wish.id = '';
      }
    };

    function addWish(magicWords, action) {
      var id = undefined;
      if (typeof magicWords === 'function') {
        action = magicWords;
        magicWords = undefined;
      }
      if (magicWords === undefined) {
        magicWords = [];
      } else if (typeof magicWords === 'string') {
        magicWords = [magicWords];
      }
      if (magicWords.indexOf('[') == 0) {
        magicWords = JSON.parse(magicWords);
      }
      if (typeof action === 'string') {
        id = action;
        action = undefined;
      }
      var wish = genie({
        id: id,
        magicWords: magicWords,
        action: action || function(wish) {
          alert('Your "' + wish.magicWords[0] + '" wish is my command!');
        }
      });
    }
    
    function addStyleWish(style, altStyle, property) {
      var styleLabel = 'Style Genie: ' + style;
      var altStyleLabel = 'Style Genie: ' + altStyle;
      addWish(styleLabel, function(wish) {
        if (wish.magicWords[0] === styleLabel) {
          $scope.$apply(function() {
            wish.magicWords[0] = altStyleLabel;
            $scope.genieStyle[property] = style.toLowerCase();
          });
        } else {
          $scope.$apply(function() {
            wish.magicWords[0] = styleLabel;
            $scope.genieStyle[property] = altStyle.toLowerCase();
          });
        }
      });
    }
    
    function addDestinationWish(magicWord, destination) {
      addWish('Go to ' + magicWord, function() {
        window.open(destination, '_blank');
      });      
    }

    addDestinationWish('Genie on GitHub', 'http://www.github.com/kentcdodds/genie');
    addDestinationWish('UX-Genie on GitHub', 'http://www.github.com/kentcdodds/ux-genie');
    addDestinationWish('Genie Tests', './test');
    
    addStyleWish('Dark', 'Light', 'color');
    addStyleWish('Small', 'Large', 'size');
    addStyleWish('Slow', 'Fast', 'animationSpeed');
    
    addWish('Alert!!!');

  });

})();