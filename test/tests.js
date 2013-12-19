// tests.js

function getBlankWish(magicWords) {
  return {
    magicWords: magicWords,
    action: function() {}
  };
}
if (typeof require !== 'undefined') {
  var chai = require('chai');
}
var expect = chai.expect;

describe('genie', function(){
  beforeEach(function(done) {
    genie.reset();
    genie.restoreContext();
    genie.enabled(true);
    genie.returnOnDisabled(true);
    done();
  });

  describe('#', function() {
    it('should register with arguments', function() {
      var allArgs = genie('wish', function(){}, 'context', {}, 'id-1');
      var allArgsAndWishArray = genie(['magic', 'word'], function(){}, 'context', {}, 'id-2');

      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(2);
      expect(allArgs).to.have.property('magicWords').with.length(1);
      expect(allArgsAndWishArray).to.have.property('magicWords').with.length(2);
    });

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
      expect(maximalObject).to.have.property('context').with.length(3);
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
      var wishOne = genie('magic', function(){}, 'context', {}, 'id');
      var wishTwo = genie('word', function(){}, 'context', {}, 'id');
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
      var wish = genie('wish', function() {});
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(1);
      genie.deregisterWish(wish);
      allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(0);
    });

    it('should make the first wish registered without giving magic words', function() {
      var shouldBeOne = 0;
      var shouldBeZero = 0;
      var wishToBeMade = genie('wish1', function() {
        shouldBeOne++;
      });
      genie('wish0', function() {
        shouldBeZero++;
      });
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(2);
      var madeWish = genie.makeWish();
      expect(shouldBeOne).to.equal(1);
      expect(madeWish).to.equal(wishToBeMade);
    });

    it('should return empty object and not register a wish when genie is disabled', function() {
      genie.enabled(false);
      var emptyObject = genie('not registered', function(){});
      expect(emptyObject).to.be.empty;
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(0);

      genie.enabled(true);
      genie.returnOnDisabled(false);
      genie.enabled(false);
      var nullObject = genie('null returned', function(){});

      //expect(nullObject).to.be.null;
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.be.null;
    });
  });
  // End registration

  describe('#getMatchingWishes', function() {

  });

  describe('#context', function() {
    var defaultContextWish, newContextWish1, newContextWish2, multiContextWish;
    beforeEach(function(done) {
      defaultContextWish = genie(getBlankWish('wish0'));
      newContextWish1 = genie({
        magicWords: 'wish1',
        context: 'new-context1',
        action: function(){}
      });
      newContextWish2 = genie({
        magicWords: 'wish2',
        context: 'new-context2',
        action: function(){}
      });
      multiContextWish = genie({
        magicWords: 'wish2',
        context: ['new-context1', 'new-context2', 'unique-context'],
        action: function(){}
      });
      done();
    });
    it('should have all wishes when genie.context is default', function() {
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(4);
    });

    it('should have only wishes with default context when genie.context is not default', function() {
      genie.context('different-context');
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(1);
      expect(allWishes[0]).to.equal(defaultContextWish);
    });

    it('should have only in context wishes (including default context wishes) when genie.context is not default', function() {
      genie.context('new-context1');
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(3);
    });

    it('should be able to have multiple contexts', function() {
      genie.context(['new-context1', 'new-context2']);
      var allWishes = genie.getMatchingWishes();
      expect(allWishes).to.have.length(4);
    });
  });
});