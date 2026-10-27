#!/usr/bin/env node
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { compileTest, categories } from './compiler.js';
import { parseOptions, discoverFiles, namePattern } from './filters.js';

const root = process.cwd();
const options = parseOptions(process.argv.slice(2));

async function main() {
  const selected = (options['--type'] || categories.join(',')).split(',').map(x => x.trim());
  for (const category of selected) if (!categories.includes(category)) throw new Error(`Unknown category: ${category}`);
  const coverage = options.coverage;
  if (coverage && !selected.some(x => x !== 'e2e')) throw new Error('Coverage currently requires unit or integration tests (Vitest)');
  const requestedRunner = options['--runner'];
  if (requestedRunner && !['vitest', 'playwright'].includes(requestedRunner)) throw new Error(`Unknown runner: ${requestedRunner}`);
  const runners = [...new Set(selected.map(x => x === 'e2e' ? 'playwright' : 'vitest'))]
    .filter(x => !requestedRunner || x === requestedRunner);
  if (requestedRunner && !runners.length) throw new Error('Requested runner does not support selected categories');
  const files = discoverFiles(root, options.files);
  const grep = namePattern(options.names);
  if (!files.length) throw new Error('No .spec.ts files matched the requested --file filters');
  const buildRoot = join(root, '.testopia');
  await rm(buildRoot, { recursive: true, force: true });
  await mkdir(buildRoot, { recursive: true });
  let failures = 0;
  for (const runner of runners) {
    const outDir = join(buildRoot, runner);
    const active = selected.filter(x => (x === 'e2e' ? 'playwright' : 'vitest') === runner);
    for (const file of files) await compileTest({ file: resolve(root, file), runner, selected: active, outDir, root });
    const config = join(buildRoot, `${runner}.config.mjs`);
    if (runner === 'vitest') {
      await writeFile(config, `export default { test: { include: ['.testopia/vitest/**/*.test.mjs'], passWithNoTests: true, coverage: { provider: 'v8', reporter: ['text', 'html', 'lcov', 'json'], reportsDirectory: 'coverage' } } };\n`);
    } else {
      await writeFile(config, `export default { testDir: './playwright', testMatch: '**/*.spec.mjs', reporter: 'line', use: { browserName: 'chromium' }, webServer: { command: 'npm run dev --prefix example', cwd: ${JSON.stringify(root)}, url: 'http://127.0.0.1:3000/', reuseExistingServer: !process.env.CI, timeout: 120000 } };\n`);
    }
    const bin = resolve(root, 'node_modules', '.bin', runner === 'vitest' ? 'vitest' : 'playwright');
    const runnerArgs = runner === 'vitest' ? ['run', '--config', config, ...(coverage ? ['--coverage'] : []), ...(grep ? ['--testNamePattern', grep] : [])] : ['test', '--config', config, ...(grep ? ['--grep', grep] : [])];
    console.log(`Testopia: running ${active.join(',')} with ${runner}`);
    const result = spawnSync(bin, runnerArgs, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
    if (result.error) throw result.error;
    if (result.status !== 0) failures++;
  }
  if (failures) process.exitCode = 1;
}

main().catch(error => { console.error(error); process.exitCode = 1; });
