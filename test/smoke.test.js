import assert from 'node:assert/strict';
import test from 'node:test';

test('CI can execute the Testopia smoke suite', () => {
  assert.equal(1 + 1, 2);
});
