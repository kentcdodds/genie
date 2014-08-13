describe('ga', function () {
    'use strict';
    
    // load the service's module
    beforeEach(module('ga'));

    // instantiate service
    var ga, window, compileElement;
    beforeEach(inject(function (_ga_, $window, $rootScope, $compile) {
        ga = _ga_;
        window = $window;
        window.gaCalled = false;
        window.ga = function() {window.gaCalled = arguments;}
        spyOn(window, 'ga').andCallThrough();

        compileElement = function(html) {
            return $compile(angular.element(html))($rootScope);
        }

    }));


    describe('service', function () {

        it('should pass params', function () {
            ga('send', 'pageview');
            expect(window.ga).toHaveBeenCalledWith('send', 'pageview')
        });

        it('should pass multiple params', function () {
            ga([['set', 'page', '/'], ['send', 'pageview']]);
            expect(window.ga.calls[0].args).toEqual(['set', 'page', '/'])
            expect(window.ga).toHaveBeenCalledWith('send', 'pageview')
        });

        it('should not throw anything', function () {
            delete window.ga;
            expect(window.ga).toBeUndefined();
            ga('send', 'pageview');
            expect(window.gaCalled).toBeFalsy();
        });

    });

    describe('directive', function () {
        var el;
        it('should call on init', function() {
            el = compileElement('<div ga="[\'send\', \'event\', \'init\']" ga-on="init"></div>')
            expect(window.ga).toHaveBeenCalledWith('send', 'event', 'init');
        })

        it('should handle shorthand array', function() {
            el = compileElement('<div ga="\'send\', \'event\', \'short\'" ga-on="init"></div>')
            expect(window.ga).toHaveBeenCalledWith('send', 'event', 'short');
        })

        it('should call on click', function() {
            el = compileElement('<div ga="\'send\', \'event\', \'click\'"></div>')
            expect(window.ga).not.toHaveBeenCalled();
            el.triggerHandler('click');
            expect(window.ga).toHaveBeenCalledWith('send', 'event', 'click');
        })

        it('should call on blur', function() {
            el = compileElement('<div ga="\'send\', \'event\', \'blur\'" ga-on="blur"></div>')
            expect(window.ga).not.toHaveBeenCalled();
            el.triggerHandler('blur');
            expect(window.ga).toHaveBeenCalledWith('send', 'event', 'blur');
        })

        it('should click button', function() {
            el = compileElement('<div ga>Label</div>').triggerHandler('click')
            expect(window.ga).toHaveBeenCalledWith('send', 'event', 'button', 'click', 'Label');
        })

        it('should click # link', function() {
            el = compileElement('<a href="#" ga>Label</a>').triggerHandler('click')
            expect(window.ga).toHaveBeenCalledWith('send', 'event', 'button', 'click', 'Label');
        })

        it('should click anchor link', function() {
            el = compileElement('<a href="#anchor" ga>Label</a>').triggerHandler('click')
            expect(window.ga).toHaveBeenCalledWith('send', 'event', 'button', '#anchor', 'Label');
        })

        it('should have title', function() {
            el = compileElement('<a href="#anchor" title="Title" ga>Label</a>').triggerHandler('click')
            expect(window.ga).toHaveBeenCalledWith('send', 'event', 'button', '#anchor', 'Title');
        })

        it('should click link', function() {
            el = compileElement('<a href="/" ga>Label</a>').triggerHandler('click')
            expect(window.ga).toHaveBeenCalledWith('send', 'event', 'link-in', '/', 'Label');
        })

        it('should click out link', function() {
            el = compileElement('<a href="http://www.stamina.pl/" ga><b>Label</b></a>').triggerHandler('click')
            expect(window.ga).toHaveBeenCalledWith('send', 'event', 'link-out', 'http://www.stamina.pl/', 'Label');
        })

        it('should click button', function() {
            el = compileElement('<input type="submit" value="Submit" ga />').triggerHandler('click')
            expect(window.ga).toHaveBeenCalledWith('send', 'event', 'button', 'click', 'Submit');
        })

        it('should have special attributes', function() {
            el = compileElement('<a href="#" title="Title" ga ga-category="\'cat\'" ga-action="\'act\'" ga-label="\'lab\'" ga-value="1">Label</a>').triggerHandler('click')
            expect(window.ga).toHaveBeenCalledWith('send', 'event', 'cat', 'act', 'lab', 1);
        })



    });


});
