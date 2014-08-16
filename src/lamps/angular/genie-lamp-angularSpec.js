/* jshint -W030 */
var expect = chai.expect;

describe('genie-lamp-angular', function() {
  'use strict';

  beforeEach(module('uxGenie'));

  describe('genie constant', function() {
    it('should have the genie function injected as a constant', inject(function (genie) {
      expect(genie).to.be.a.function;
    }));
  });
});