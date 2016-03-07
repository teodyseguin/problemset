/* Your tests will go here */
var RandStream = require('../lib/lib').RandStream,
  assert = require('assert');

describe('Sample RandStream test', function () {
  it('should pass if stream is readable', function () {
    var stream = new RandStream();
    assert(stream.readable);
  });
});