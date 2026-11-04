import assert from 'node:assert/strict';
import test from 'node:test';
import { filterCategories } from '../src/compiler.js';

const source = `feature('Example', () => {
  const helper = () => 42;
  test.unit('unit', async () => { await import('./node-only'); });
  test.e2e('browser', async () => { await import('./browser-only'); });
  test.e2e.skip('skipped', async () => { await import('./other-browser'); });
});`;

test('unit selection removes browser tests and imports before bundling', () => {
  const result = filterCategories(source, 'example.spec.ts', ['unit']);
  assert.match(result.code, /node-only/);
  assert.doesNotMatch(result.code, /browser-only|other-browser/);
  assert.match(result.code, /const helper/);
  assert.equal(result.removed.length, 2);
});

test('e2e selection removes unit dependencies', () => {
  const result = filterCategories(source, 'example.spec.ts', ['e2e']);
  assert.match(result.code, /browser-only/);
  assert.doesNotMatch(result.code, /node-only/);
});

test('unknown categories are rejected', () => {
  assert.throws(() => filterCategories(source, 'example.spec.ts', ['other']), /Unknown test category/);
});
