// tests.js

function fillInWish(defaults) {
  defaults = defaults || {};
  if (typeof defaults === 'string') {
    defaults = {
      magicWords: defaults
    };
  }
  return {
    id: defaults.id,
    context: defaults.context,
    data: defaults.data,
    magicWords: defaults.magicWords || 'magicWords',
    action: defaults.action || function() {}
  };
}
if (typeof require !== 'undefined') {
  var chai = require('chai');
}
function prepForTest(done) {
  genie.reset();
  genie.restoreContext();
  genie.enabled(true);
  genie.returnOnDisabled(true);
  done && done();
}

var expect = chai.expect;


describe('genie', function(){
  beforeEach(prepForTest);

  describe('#', function() {
    beforeEach(prepForTest);
    it('should register with an object', function() {
      var minimalObject = genie({
        magicWords: 'magicWord',
        action: function() {}
      });
      var wishData = {
        name: 'value'
      };
      var maximalObject = genie({
        id: 'coolId',
        context: ['gandpa', 'child', 'grandchild'],
        data: wishData,
        magicWords: ['magic', 'word'],
        action: function() {}
      });
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(2);
      expect(maximalObject).to.have.property('id').to.equal('coolId');
      expect(maximalObject).to.have.property('context').to.have.property('any').with.length(3);
      expect(maximalObject).to.have.property('data').to.equal(wishData);
      expect(maximalObject).to.have.property('magicWords').with.length(2);
    });

    it('should register with an array', function() {
      var wishes = genie([
        {
          magicWords: 'wish1',
          action: function(){}
        },
        {
          magicWords: 'wish2',
          action: function(){}
        },
        {
          magicWords: 'wish3',
          action: function(){}
        }
      ]);

      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(3);
    });

    it('should overwrite wish with duplicateId', function() {
      var wishOne = genie(fillInWish({
        id: 'id'
      }));
      var wishTwo = genie(fillInWish({
        id: 'id'
      }));
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(1);
      expect(wishTwo).to.equal(allWishes[0]);
      expect(wishOne).to.not.equal(allWishes[0]);
    });

    it('should not have any wishes registered prior to registration', function() {
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(0);
    });

    it('should have one wish registered upon registration and zero upon deregistration', function() {
      var wish = genie(fillInWish());
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(1);
      genie.deregisterWish(wish);
      allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(0);
    });

    it('should make the last wish registered without giving magic words', function() {
      genie(fillInWish());
      var wishToBeMade = genie(fillInWish());
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(2);
      var madeWish = genie.makeWish();
      expect(wishToBeMade.data.timesMade.total).to.equal(1);
      expect(madeWish).to.equal(wishToBeMade);
    });

    it('should return empty object and not register a wish when genie is disabled', function() {
      genie.enabled(false);
      var emptyObject = genie(fillInWish());
      expect(emptyObject).to.be.empty;
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(0);

      genie.enabled(true);
      genie.returnOnDisabled(false);
      genie.enabled(false);
      var nullObject = genie(fillInWish());

      expect(nullObject).to.be.null;
      allWishes = genie.getMatchingWishes();
      expect(allWishes).to.be.null;
    });

    describe('special wish types', function() {
      describe('navigation wish type', function() {
        it('should navigate when a wish is made whose action is a string', function() {
          var destination = window.location.href + '#success';
          var moveToSuccess = genie({
            magicWords: 'Add success hash',
            action: destination
          });
          genie.makeWish(moveToSuccess);
          expect(window.location.href).to.equal(destination);
          // Cannot really test the new tab action, but if I could, it would look like this:
          // wish = genie({
          //   magicWords: 'Open GenieJS repo',
          //   action: {
          //     destination: 'http://www.github.com/kentcdodds/genie',
          //     openNewTab: true
          //   }
          // });
          // genie.makeWish(wish);
        });
      });
    });
  });

  describe('#reset', function() {
    beforeEach(prepForTest);
    it('should reset all options', function() {
      var originalOptions = genie.options();

      var wish = genie(fillInWish());
      genie.makeWish(wish);

      expect(genie.options()).to.not.equal(originalOptions);
      genie.reset();
//      expect(genie.options()).to.equal(originalOptions);
    });
  });


  // End registration

  describe('#deregisterWish #deregisterWishesWithContex', function() {
    beforeEach(prepForTest);
    var allWishCount = 5;
    var wish1;
    var allWishes;
    beforeEach(function(done) {
      wish1 = genie(fillInWish());
      genie(fillInWish({
        context: 'context1'
      }));
      genie(fillInWish({
        context: 'context1'
      }));
      genie(fillInWish({
        context: 'context2'
      }));
      genie(fillInWish({
        context: 'context2'
      }));
      done();
    });
    it('should have one less wish when a wish is deregistered', function() {
      allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(allWishCount);
      genie.deregisterWish(wish1);

      allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(allWishCount - 1);
    });
    
    it('should remove only wishes in a given context (excluding the default context) when deregisterWishesWithContext is called', function() {
      allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(allWishCount);
      genie.deregisterWishesWithContext('context1');

      allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(allWishCount - 2);
    });
  });
  // End #deregisterWish #deregisterWishesWithContex

  describe('#context #addContext #removeContext', function() {
    beforeEach(prepForTest);
    var defaultContextWish;
    var complexContextNone;
    beforeEach(function(done) {
      defaultContextWish = genie(fillInWish());
      var newContextWish1 = genie(fillInWish({
        context: 'context1'
      }));
      var newContextWish2 = genie(fillInWish({
        context: 'context2'
      }));
      var newContextWish3 = genie(fillInWish({
        context: ['context3']
      }));
      var multiContextWish = genie(fillInWish({
        context: ['context1', 'context2', 'context3']
      }));
      var complexContextAll = genie(fillInWish({
        context: {
          all: ['context1', 'context2', 'context3']
        }
      }));
      var complexContextAny = genie(fillInWish({
        context: {
          any: ['context1', 'context3', 'context5']
        }
      }));
      complexContextNone = genie(fillInWish({
        context: {
          none: ['context1', 'context2']
        }
      }));
      var veryComplexContext = genie(fillInWish({
        context: {
          all: ['context1', 'context3'],
          any: ['context4', 'context5'],
          none: ['context2']
        }
      }));
      done();
    });
    it('should have all wishes when genie.context is default', function() {
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(9);
    });

    it('should have only wishes with default context when genie.context is not default', function() {
      genie.context('different-context');
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(2);
      expect(allWishes[0]).to.equal(complexContextNone);
      expect(allWishes[1]).to.equal(defaultContextWish);
    });

    it('should have only in context wishes (including default context wishes) when genie.context is not default', function() {
      genie.context('context1');
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(4);
    });

    it('should be able to have multiple contexts', function() {
      genie.context(['context1', 'context2']);
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(5);
    });

    it('should be able to add a string context', function() {
      genie.context('context1');
      genie.addContext('context2');
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(5);
    });

    it('should be able to add an array of contexts', function() {
      genie.context('context1');
      genie.addContext(['context2', 'context3']);
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(7);
    });

    it('should be able to remove string context', function() {
      genie.context(['context1', 'context2']);
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(5);

      genie.removeContext('context1');
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(3);
    });

    it('should be able to remove an array of contexts', function() {
      genie.context(['context1', 'context2', 'context3']);
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(7);

      genie.removeContext(['context1', 'context2']);
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(5);
    });
    
    it('should be able to manage complex contexts', function() {
      genie.context(['context1', 'context3', 'context5']);
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(6);
    });
  }); // end #context #addContext #removeContext
  
  describe('#getMatchingWishes', function() {
    beforeEach(prepForTest);
    var wishes;
    var wishesArray;
    beforeEach(function(done) {
      wishes = {};
      wishesArray = [];
      wishes.equal = genie(fillInWish({
        magicWords: 'tTOtc' // equal
      }));
      wishesArray.push(wishes.equal);
      
      wishes.equal2 = genie(fillInWish({
        magicWords: ['First Magic Word', 'tTOtc'] // equal 2nd magic word
      }));
      wishesArray.push(wishes.equal2);
      
      wishes.contains = genie(fillInWish({
        magicWords: 'The ttotc container' // contains
      }));
      wishesArray.push(wishes.contains);
      
      wishes.contains2 = genie(fillInWish({
        magicWords: ['First Magic Word', 'The ttotc container'] // contains 2nd magic word
      }));
      wishesArray.push(wishes.contains2);
      
      wishes.acronym = genie(fillInWish({
        magicWords: 'The Tail of Two Cities' // acronym
      }));
      wishesArray.push(wishes.acronym);
      
      wishes.acronym2 = genie(fillInWish({
        magicWords: ['First Magic Word', 'The Tail of Two Cities'] // acronym 2nd magic word
      }));
      wishesArray.push(wishes.acronym2);
      
      wishes.match = genie(fillInWish({
        magicWords: 'The Tail of Forty Cities' // match
      }));
      wishesArray.push(wishes.match);
      
      wishes.match2 = genie(fillInWish({
        magicWords: ['First Magic Word', 'The Tail of Forty Cities'] // match 2nd magic word
      }));
      wishesArray.push(wishes.match2);
      
      wishes.noMatch = genie(fillInWish({
        magicWords: 'no match'
      }));
      wishesArray.push(wishes.noMatch);
      
      done();
    });
    
    it('should return wishes in order of most recently registered when not given any params', function() {
      var allWishes = genie.getMatchingWishes();
      var j = wishesArray.length - 1;
      for (var i = 0; i < allWishes.length && j >= 0; i++, j--) {
        expect(allWishes[i]).to.equal(wishesArray[j]);
      }
    });
    
    it('should match equal, contains, acronym, and then match with the second magic word match coming after the first', function() {
      var ttotcAcronym = 'ttotc';

      // Even though they were registered in reverse order, the matching should follow this pattern
      var matchingWishes = genie.getMatchingWishes(ttotcAcronym);
      expect(matchingWishes).to.have.length(wishesArray.length - 1);
      expect(matchingWishes[0]).to.equal(wishes.equal);
      expect(matchingWishes[1]).to.equal(wishes.equal2);
      expect(matchingWishes[2]).to.equal(wishes.contains);
      expect(matchingWishes[3]).to.equal(wishes.contains2);
      expect(matchingWishes[4]).to.equal(wishes.acronym);
      expect(matchingWishes[5]).to.equal(wishes.acronym2);
      expect(matchingWishes[6]).to.equal(wishes.match);
      expect(matchingWishes[7]).to.equal(wishes.match2);
    });
    
    it('should match entered magic words before anything else', function() {
      genie.makeWish(wishes.contains, 'tt');
      // This shouldn't affect the results of a search with more text

      genie.makeWish(wishes.match, 'ttot');
      var matchingWishes = genie.getMatchingWishes('ttot');
      expect(matchingWishes).to.have.length(wishesArray.length - 1);
      expect(matchingWishes[0]).to.equal(wishes.match);
      expect(matchingWishes[1]).to.equal(wishes.equal); // starts with (not equal) in this case
      expect(matchingWishes[2]).to.equal(wishes.equal2); // starts with 2 in this case
      expect(matchingWishes[3]).to.equal(wishes.contains);
      expect(matchingWishes[4]).to.equal(wishes.contains2);
      expect(matchingWishes[5]).to.equal(wishes.acronym);
      expect(matchingWishes[6]).to.equal(wishes.acronym2);
      expect(matchingWishes[7]).to.equal(wishes.match2);
      
      genie.makeWish(wishes.match2, 'ttotc');
      matchingWishes = genie.getMatchingWishes('ttot');
      expect(matchingWishes).to.have.length(wishesArray.length - 1);
      expect(matchingWishes[0]).to.equal(wishes.match);
      expect(matchingWishes[1]).to.equal(wishes.match2);
      expect(matchingWishes[2]).to.equal(wishes.equal); // starts with in this case
      expect(matchingWishes[3]).to.equal(wishes.equal2); // starts with 2 in this case
      expect(matchingWishes[4]).to.equal(wishes.contains);
      expect(matchingWishes[5]).to.equal(wishes.contains2);
      expect(matchingWishes[6]).to.equal(wishes.acronym);
      expect(matchingWishes[7]).to.equal(wishes.acronym2);


      matchingWishes = genie.getMatchingWishes('ttotc');
      expect(matchingWishes).to.have.length(wishesArray.length - 1);
      expect(matchingWishes[0]).to.equal(wishes.match2);
      expect(matchingWishes[1]).to.equal(wishes.equal);
      expect(matchingWishes[2]).to.equal(wishes.equal2);
      expect(matchingWishes[3]).to.equal(wishes.contains);
      expect(matchingWishes[4]).to.equal(wishes.contains2);
      expect(matchingWishes[5]).to.equal(wishes.acronym);
      expect(matchingWishes[6]).to.equal(wishes.acronym2);
      expect(matchingWishes[7]).to.equal(wishes.match);
    });

    it('should follow the rules with "on deck" and "king of the hill"', function() {
      var fred = wishes.contains2;
      var ethel = wishes.acronym2;
      var lucy = wishes.match2;

      var wordToGet = 'magic';

      // In opposite order of their registration
      var mertzMatch = genie.getMatchingWishes(wordToGet);
      expect(mertzMatch[0]).to.equal(lucy);
      expect(mertzMatch[1]).to.equal(ethel);
      expect(mertzMatch[2]).to.equal(fred);

      // In order of called then opposite registration
      genie.makeWish(ethel, wordToGet);
      mertzMatch = genie.getMatchingWishes(wordToGet);
      expect(mertzMatch[0]).to.equal(ethel);
      expect(mertzMatch[1]).to.equal(lucy);
      expect(mertzMatch[2]).to.equal(fred);

      /*
       * More complicated here. A specific wish must be called
       * twice in a row for a specific magic word for it to
       * be lucy if that magic word already has a wish
       * associated with it. So lucy must be called with
       * 'mertz' twice in a row before she can take the
       * top spot.
       */
      genie.makeWish(lucy, wordToGet);
      mertzMatch = genie.getMatchingWishes(wordToGet);
      expect(mertzMatch[0]).to.equal(ethel);
      expect(mertzMatch[1]).to.equal(lucy);
      expect(mertzMatch[2]).to.equal(fred);

      /*
       * Lucy is now king of the hill.
       * Ethel is second, and fred isn't
       * even on the hill at all...
       */
      genie.makeWish(lucy, wordToGet);
      mertzMatch = genie.getMatchingWishes(wordToGet);
      expect(mertzMatch[0]).to.equal(lucy);
      expect(mertzMatch[1]).to.equal(ethel);
      expect(mertzMatch[2]).to.equal(fred);

      /*
       * De-registering lucy and making a
       * wish with fred will place ethel as
       * king of the hill and fred as second
       */
      genie.deregisterWish(lucy);
      genie.makeWish(fred, wordToGet);
      mertzMatch = genie.getMatchingWishes(wordToGet);
      expect(mertzMatch.length).to.equal(3);
      expect(mertzMatch[0]).to.equal(ethel);
      expect(mertzMatch[1]).to.equal(fred);
    });
  });

  describe('#enabled', function() {
    describe('returnOnDisabled behavior when disabled', function() {
      beforeEach(prepForTest);
      it('should cause functions to return a reasonable empty return when enabled', function() {
        genie.enabled(false);
        expect(genie()).to.be.empty;
        expect(genie.getMatchingWishes()).to.be.empty;
        expect(genie.makeWish()).to.be.empty;
        expect(genie.options()).to.be.empty;
        expect(genie.deregisterWish()).to.be.empty;
        expect(genie.reset()).to.be.empty;
        expect(genie.context()).to.be.empty;
        expect(genie.revertContext()).to.be.empty;
        expect(genie.restoreContext()).to.be.empty;
        expect(genie.enabled()).to.be.false;
        expect(genie.returnOnDisabled()).to.be.true;
      });
      it('should cause functions to return a reasonable empty return when disabled', function() {
        genie.returnOnDisabled(false);
        genie.enabled(false);

        expect(genie()).to.be.null;
        expect(genie.getMatchingWishes()).to.be.null;
        expect(genie.makeWish()).to.be.null;
        expect(genie.options()).to.be.null;
        expect(genie.deregisterWish()).to.be.null;
        expect(genie.reset()).to.be.null;
        expect(genie.context()).to.be.null;
        expect(genie.revertContext()).to.be.null;
        expect(genie.restoreContext()).to.be.null;
        expect(genie.enabled()).to.equal(false); // Special case. Enabled always runs.
        expect(genie.returnOnDisabled()).to.be.null;
      });
    });
  });
});