
'use strict';
(function() {
  var app = angular.module('genieApp', ['ngGenie']);

  // Makes this modular if we don't just use the global instance and use it as a module instead  
  app.constant('genie', genie);

  app.controller('GenieCtrl', function($scope, genie) {

    $scope.genieVisible = false;
    
    $scope.exportOrImportGenie = function() {
      if ($scope.genieExportImport) {
        genie.options(JSON.parse($scope.genieExportImport));
      } else {
        $scope.genieExportImport = JSON.stringify(genie.options(), null, 2);
      }
    };
    
    $scope.addWishFromInput = function() {
      var w = $scope.wishCreator;
      addWish(w.id, w.magicWords, w.displayText);
    };

    function addWish(wishDisplay, magicWords, action) {
      if (typeof magicWords === 'function') {
        action = magicWords;
        magicWords = undefined;
      }
      if (magicWords === undefined) {
        magicWords = [];
      }
      if (magicWords.indexOf('[') == 0) {
        magicWords = JSON.parse(magicWords);
      }
      magicWords.push(wishDisplay);
      var wish = genie({
        magicWords: magicWords,
        data: {
          displayText: wishDisplay
        },
        action: action || function() {
          alert('Your "' + this.data.displayText + '" wish is my command!');
        }
      });
    }

    addWish('GenieJS on GitHub', function() {
      window.open('http://www.github.com/kentcdodds/genie', '_blank');
    });
    addWish('ng-GenieJS on GitHub', function() {
      window.open('http://www.github.com/kentcdodds/ng-genie', '_blank');
    });
    addWish('GenieJS Demo', function() {
      window.open('/', '_blank');
    });
    addWish('GenieJS Tests', function() {
      window.open('/test', '_blank');
    });
    addWish('Create new post');
    addWish('Edit profile pic');
    addWish('Update contact info');
    addWish('Delete account');
    addWish('Block user');
    addWish('Friend user');
    addWish('Find friends');

  });

})();