import { globSync } from 'node:fs';

export const usage = 'Usage: testopia test [--type unit,integration,e2e] [--runner vitest|playwright] [--file glob] [--test text] [--feature text] [--scenario text] [--coverage]';

const valueFlags = new Set(['--type', '--runner', '--file', '--test', '--feature', '--scenario']);
const booleanFlags = new Set(['--coverage']);

export function parseOptions(argv) {
  const options = { files: [], names: {}, coverage: false };
  let i = argv[0] === 'test' ? 1 : 0;
  if (argv[i] && !argv[i].startsWith('--')) throw new Error(usage);
  for (; i < argv.length; i++) {
    const flag = argv[i];
    if (booleanFlags.has(flag)) {
      options.coverage = true;
    } else if (valueFlags.has(flag)) {
      const value = argv[++i];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag}\n${usage}`);
      if (flag === '--file') options.files.push(value);
      else if (['--test', '--feature', '--scenario'].includes(flag)) {
        if (options.names[flag]) throw new Error(`Duplicate option: ${flag}`);
        options.names[flag] = value;
      } else {
        if (options[flag]) throw new Error(`Duplicate option: ${flag}`);
        options[flag] = value;
      }
    } else {
      throw new Error(`Unknown argument: ${flag}\n${usage}`);
    }
  }
  return options;
}

export function discoverFiles(root, patterns = []) {
  const exclude = ['**/node_modules/**', '**/.testopia/**', '**/.output/**', '**/.tanstack/**'];
  const all = globSync('**/*.spec.ts', { cwd: root, exclude }).sort();
  if (!patterns.length) return all;
  // Match the user's globs against source paths, never generated bundles.
  const selected = new Set();
  for (const pattern of patterns) {
    const normalized = pattern.replaceAll('\\', '/').replace(/^\.\//, '');
    for (const file of globSync(normalized, { cwd: root, exclude })) {
      if (all.includes(file)) selected.add(file);
    }
  }
  return [...selected].sort();
}

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function namePattern(names) {
  const parts = ['--feature', '--scenario', '--test']
    .filter(key => names[key])
    .map(key => `(?=[\\s\\S]*${escapeRegex(names[key])})`);
  return parts.length ? `^${parts.join('')}[\\s\\S]*$` : undefined;
}
