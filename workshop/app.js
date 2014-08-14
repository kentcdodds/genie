(function() {
  // Ignore all this angular stuff. This is just for demo purposes
  var app = angular.module('gw', ['ga', 'uxGenie']);

  app.constant('genie', genie);
  app.constant('GW', GW);
  app.constant('CodeMirror', CodeMirror);

  // Yeah... I know this whole file is hacky, but this isn't important to the demo.
  var genieCodeMirror = null;

  app.controller('MainCtrl', function($scope, genie, GW, $window, $http, $location, ga) {
    $scope.genie = genie;
    $scope.lessons = [
      { concept: 'Initial Setup' },
      { concept: 'Wish Registration' },
      { concept: 'Making a Wish', lineNumber: -1 },
      { concept: 'Get Matching Wishes' },
      { concept: 'Special Wish Actions' },
      { concept: 'Enabling and Disabling' },
      { concept: 'Genie Context' },
      { concept: 'Path Context' },
      { concept: 'UX-Genie', noScript: true },
      { concept: 'ux-lamp Simple', noScript: true },
      { concept: 'ux-lamp Icons' },
      { concept: 'ux-lamp Sub Context' },
      { concept: 'ux-lamp Advanced', noScript: true },
      { concept: 'genie-wish', noScript: true }
    ];

    $scope.repo = 'https://github.com/kentcdodds/genie-workshop/tree/';
    $scope.docs = 'http://kent.doddsfamily.us/genie/autodoc/';
    $scope.links = [
      {
        text: 'Genie-Workshop Slides',
        href: 'http://slid.es/kentcdodds/genie'
      },
      {
        text: 'Genie-Workshop Repo',
        href: 'http://github.com/kentcdodds/genie-workshop'
      },
      {
        text: 'Genie Repo',
        href: 'http://github.com/kentcdodds/genie'
      },
      {
        text: 'UX-Genie Repo',
        href: 'http://github.com/kentcdodds/ux-genie'
      },
      {
        text: 'Genie Documentation',
        href: $scope.docs
      }
    ];

    function initScope() {
      console.clear();
      $scope.lessonNum = parseInt($location.path().substring(1));
      $scope.lesson = $scope.lessons[$scope.lessonNum];
      $scope.lessonDir = 'lessons/' + $scope.lesson.concept.replace(/ /g, '-').toLowerCase() + '/';
      if ($scope.lessons.length > $scope.lessonNum + 1) {
        $scope.nextLesson = $scope.lessons[$scope.lessonNum + 1];
      } else {
        $scope.nextLesson = null;
      }
      if ($scope.lessonNum > 0) {
        $scope.previousLesson = $scope.lessons[$scope.lessonNum - 1];
      } else {
        $scope.previousLesson = null;
      }

      if (!$scope.lesson.noScript) {
        $http.get($scope.lessonDir + 'genie-code.js').success(function(js) {
          genieCodeMirror.setValue(js);
          var lineNum = $scope.lesson.lineNumber === -1 ? genieCodeMirror.lineCount() : $scope.lesson.lineNumber;
          if ($scope.lesson.lineNumber) {
            genieCodeMirror.setCursor(lineNum);
          }
          if ($scope.lesson.readOnly) {
            genieCodeMirror.setOption('readOnly', true);
          }
        });
      }

      genie.reset();
      if (!$scope.lesson.noScript) {
        GW.loadScript($scope.lessonDir + 'genie-code.js', function() {
          $scope.$apply();
        });
      }
    }


    $scope.rerunGenieCode = function() {
      genie.reset();
      console.clear();
      runCodeMirrorCode();
    };

    function runCodeMirrorCode() {
      // AAAAAAAHHHHHHHHHH!!!!!!
      $window.eval(genieCodeMirror.getValue());
    }

    $scope.$watch(function() {
      return $location.path();
    }, function(path) {
      if (path.length > 1) {
        initScope();
      }
    });

    var totalWishesMade = 0;
    $scope.wishMade = function(wish, magicWord) {
        totalWishesMade++;
        ga('send', 'event', 'wish', 'made', JSON.stringify({
          totalWishesMade: totalWishesMade,
          wishMagicWords: wish.magicWords,
          magicWord: magicWord
        }));
      }

  });

  app.directive('codeMirror', function(CodeMirror) {
    return {
      link: function(scope, el) {
        genieCodeMirror = CodeMirror(el[0], {
          value: '',
          mode:  'javascript',
          lineNumbers: true,
          matchBrackets: true
        });
      }
    }
  });
})();