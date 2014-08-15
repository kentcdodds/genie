(function() {
  // Ignore all this angular stuff. This is just for demo purposes
  var app = angular.module('gw', ['ga', 'uxGenie']);

  app.constant('genie', genie);
  app.constant('GW', GW);
  app.constant('CodeMirror', CodeMirror);

  // Yeah... I know this whole file is hacky, but this isn't important to the demo.
  var genieCodeMirror = null;

  app.controller('MainCtrl', function($scope, genie, GW, $window, $http, $location, ga) {
    var useNonLessonWishes = 'non-lesson-wishes';
    $scope.useNonLessonWishes = shouldHaveNonLessonWishes();
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

    $scope.links = [
      {
        text: 'Genie Workshop Slides',
        href: 'http://slid.es/kentcdodds/genie'
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
        href: 'http://kent.doddsfamily.us/genie/autodoc/'
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

      resetGenie();
      if (!$scope.lesson.noScript) {
        GW.loadScript($scope.lessonDir + 'genie-code.js', function() {
          $scope.$apply();
        });
      }
    }


    $scope.rerunGenieCode = function() {
      resetGenie();
      console.clear();
      runCodeMirrorCode();
    };

    function runCodeMirrorCode() {
      // AAAAAAAHHHHHHHHHH!!!!!!
      $window.eval(genieCodeMirror.getValue());
    }

    function resetGenie() {
      genie.reset();
      genie.context('demo-context');
      addPageWishes();
    }

    function addPageWishes() {
      if (!shouldHaveNonLessonWishes()) {
        return;
      }
      if ($scope.lessonNum + 1 <= $scope.lessons.length) {
        addPageWish({
          action: '#/' + ($scope.lessonNum + 1),
          magicWords: 'Next Lesson: ' + $scope.lessons[$scope.lessonNum + 1].concept,
          data: {
            uxGenie: {
              iIcon: 'glyphicon glyphicon-arrow-right'
            }
          }
        });
      }
      if ($scope.lessonNum - 1 >= 0) {
        addPageWish({
          action: '#/' + ($scope.lessonNum - 1),
          magicWords: 'Previous Lesson: ' + $scope.lessons[$scope.lessonNum - 1].concept,
          data: {
            uxGenie: {
              iIcon: 'glyphicon glyphicon-arrow-left'
            }
          }
        });
      }
      addPageWish({
        action: $scope.rerunGenieCode,
        magicWords: 'Rerun Genie Code',
        data: {
          uxGenie: {
            iIcon: 'glyphicon glyphicon-refresh'
          }
        }
      });
      setupNonLessonWishes();
    }

    $scope.$watch('useNonLessonWishes', function(newVal) {
      if (newVal) {
        $window.localStorage.setItem(useNonLessonWishes, 'true');
      } else {
        $window.localStorage.removeItem(useNonLessonWishes);
      }
      $scope.rerunGenieCode();
    });

    $scope.$watch(function() {
      return $location.path();
    }, function(path) {
      if (path.length > 1) {
        initScope();
      } else {
        genie({
          action: '#/0',
          magicWords: 'Let\'s get started!',
          data: {
            uxGenie: {
              iIcon: 'glyphicon glyphicon-play'
            }
          }
        });
        setupNonLessonWishes();
      }
    });

    function setupNonLessonWishes() {
      if (!shouldHaveNonLessonWishes()) {
        return;
      }
      addRelatedLinksWishes();
      setupPageContext();
      addLessonSubContextWishes();
    }

    function shouldHaveNonLessonWishes() {
      return $window.localStorage.getItem(useNonLessonWishes) === 'true';
    }

    function addRelatedLinksWishes() {
      $scope.links.forEach(function(link) {
        addPageWish({
          action: link.href,
          magicWords: link.text,
          data: {
            uxGenie: {
              iIcon: 'glyphicon glyphicon-globe'
            }
          }
        });
      });
    }

    function addLessonSubContextWishes() {
      var subContext = 'lesson-wish';
      $scope.lessons.forEach(function(lesson, index) {
        genie({
          action: '#/' + index,
          magicWords: (index + 1) + '. ' + lesson.concept,
          context: subContext
        });
      });
      addPageWish({
        magicWords: 'Go to lesson...',
        data: {
          uxGenie: {
            subContext: [subContext, 'sub-context']
          }
        }
      });
    }

    function setupPageContext() {
      var pageContext = 'page-wish';
      genie.addContext(pageContext);
      addPageWish({
        action: function() {
          genie.removeContext(pageContext);
        },
        magicWords: 'Hide non-lesson wishes',
        data: {
          uxGenie: {
            iIcon: 'glyphicon glyphicon-ban-circle'
          }
        }
      });
      genie({
        action: function() {
          genie.addContext(pageContext);
        },
        magicWords: 'Show non-lesson wishes',
        context: {
          none: [pageContext, 'sub-context']
        },
        data: {
          uxGenie: {
            iIcon: 'glyphicon glyphicon-plus-sign'
          }
        }
      });
    }

    function addPageWish(wish) {
      wish.context = 'page-wish';
      genie(wish);
    }

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