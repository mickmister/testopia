import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { compileTest } from '../src/compiler.js';

test('Vite never resolves imports in excluded test callbacks', async () => {
  const root = process.cwd();
  const temp = await mkdtemp(join(root, '.testopia-fixture-'));
  try {
    const file = join(temp, 'isolation.spec.ts');
    const outDir = join(temp, 'output');
    await mkdir(outDir);
    await writeFile(file, `import { feature, test } from '@testopia/core';
      feature('isolation', () => {
        test.unit('runs', async ({ expect }) => { expect(1).toBe(1); });
        test.e2e('excluded', async () => {
          await import('./this-module-intentionally-does-not-exist');
        });
      });`);
    const output = await compileTest({ file, runner: 'vitest', selected: ['unit'], outDir, root });
    const bundle = await readFile(output, 'utf8');
    assert.match(bundle, /isolation/);
    assert.doesNotMatch(bundle, /this-module-intentionally-does-not-exist/);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
