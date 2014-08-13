(function (angular) {
'use strict';

angular.module('ga', [])
    .factory('ga', ['$window', function ($window) {

        var ga = function() {
            if (angular.isArray(arguments[0])) {
                for(var i = 0; i < arguments.length; ++i) {
                    ga.apply(this, arguments[i]);
                }
                return;
            }
            // console.log('ga', arguments);
            if ($window.ga) {
                $window.ga.apply(this, arguments);
            }
        };

        return ga;
    }])
    .run(['$rootScope', '$location', 'ga', function ($rootScope, $location, ga) {
       
        $rootScope.$on('$routeChangeStart', function() {
            ga('set', 'page', $location.url());
        });

    }])
    /**
      ga="'send', 'event', 'test'" ga-on="click|hover|init"
      */
    .directive('ga', ['ga', function(ga) {
        return {
          restrict: 'A',
          scope: false,
          link: function($scope, $element, $attrs) {
            var bindToEvent = $attrs.gaOn || 'click',
                command = $attrs.ga;

            var onEvent = function() {
                if (command) {
                    if (command[0] === '\'') command = '[' + command + ']';

                    command = $scope.$eval(command);
                } else {
                    // auto command
                    var href = $element.attr('href');
                    if (href && href === '#') href = '';
                    var category = $attrs.gaCategory ? $scope.$eval($attrs.gaCategory) : 
                            (href && href[0] !== '#' ? (href.match(/\/\//) ? 'link-out' : 'link-in') : 'button'),
                        action = $attrs.gaAction ? $scope.$eval($attrs.gaAction) : 
                            (href ? href : 'click'),
                        label = $attrs.gaLabel ? $scope.$eval($attrs.gaLabel) : 
                            ($element[0].title || ($element[0].tagName.match(/input/i) ? $element.attr('value') : $element.text())).substr(0, 64),
                        value = $attrs.gaValue ? $scope.$eval($attrs.gaValue) : null;
                    command = ['send', 'event', category, action, label];
                    if (value !== null) command.push(value);
                }
                ga.apply(null, command);
            };

            if (bindToEvent === 'init') {
                onEvent();
            } else {
                $element.bind(bindToEvent, onEvent);
            }
          }
        };
      }]);
})(angular);

