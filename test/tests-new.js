// tests.js

function registerBlankWish(magicWords) {
  return genie(magicWords,function (){});
}

describe('genie', function(){
  beforeEach(function(done) {
    genie.reset();
    genie.restoreContext();
    genie.enabled(true);
    genie.returnOnDisabled(true);
    done();
  });

  describe('registration', function(){
    it('should return -1 when the value is not present', function(){
      chai.assert.equal(-1, [1,2,3].indexOf(5));
      chai.assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});