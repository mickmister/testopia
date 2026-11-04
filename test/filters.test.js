import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseOptions, discoverFiles, namePattern } from '../src/filters.js';

test('parses combined filters and repeated file globs', () => {
  assert.deepEqual(parseOptions(['test', '--file', 'example/**/*.spec.ts', '--file', 'other/*.spec.ts', '--type', 'e2e', '--feature', 'Task board', '--test', 'adds a task', '--coverage']), {
    files: ['example/**/*.spec.ts', 'other/*.spec.ts'],
    names: { '--feature': 'Task board', '--test': 'adds a task' },
    coverage: true,
    '--type': 'e2e',
  });
});

test('rejects unknown flags and missing values', () => {
  assert.throws(() => parseOptions(['test', '--file']), /Missing value/);
  assert.throws(() => parseOptions(['test', '--bogus']), /Unknown argument/);
  assert.throws(() => parseOptions(['test', '--test', 'a', '--test', 'b']), /Duplicate option/);
});

test('combines literal name filters without regex injection', () => {
  const pattern = new RegExp(namePattern({ '--feature': 'Task (board)', '--scenario': 'A user adds', '--test': 'shows [task]' }));
  assert.equal(pattern.test('Task (board) A user adds shows [task]'), true);
  assert.equal(pattern.test('Task board A user adds shows [task]'), false);
  assert.equal(pattern.test('Task (board) A user completes shows [task]'), false);
});

test('discovers only selected source specs, excluding nested dependencies', () => {
  const root = mkdtempSync(join(tmpdir(), 'testopia-filter-'));
  try {
    for (const dir of ['example/tests', 'other', 'example/node_modules/pkg']) mkdirSync(join(root, dir), { recursive: true });
    for (const file of ['example/tests/a.spec.ts', 'other/b.spec.ts', 'example/node_modules/pkg/ignored.spec.ts']) writeFileSync(join(root, file), '');
    assert.deepEqual(discoverFiles(root, ['example/**/*.spec.ts']), ['example/tests/a.spec.ts']);
    assert.deepEqual(discoverFiles(root, ['example/**/*.spec.ts', 'other/*.spec.ts']), ['example/tests/a.spec.ts', 'other/b.spec.ts']);
    assert.deepEqual(discoverFiles(root, ['none/*.spec.ts']), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
