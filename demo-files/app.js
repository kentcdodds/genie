'use strict';

(function() {
  var app = angular.module('genieApp', ['ngGenie', 'ga']);

  // Makes this modular if we don't just use the global instance and use it as a module instead  
  app.constant('genie', genie);

  app.controller('GenieCtrl', function($scope, genie) {

    $scope.genieVisible = false;
    
    $scope.genieStyle = {
      color: 'light',
      size: 'large',
      animationSpeed: 'fast'
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

    function addWish(wishDisplay, magicWords, action) {
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
      if (typeof wishDisplay === 'string') {
        magicWords.push(wishDisplay);
      } else {
        wishDisplay = magicWords[0];
      }
      var wish = genie({
        id: id,
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
    addWish('NG-GenieJS on GitHub', function() {
      window.open('http://www.github.com/kentcdodds/ng-genie', '_blank');
    });
    addWish('GenieJS Tests', function() {
      window.open('./test', '_blank');
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