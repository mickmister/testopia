import ts from 'typescript';
import MagicString from 'magic-string';
import { build } from 'vite';
import { resolve, basename, join } from 'node:path';

export const categories = ['unit', 'integration', 'e2e'];

export function filterCategories(source, filename, selected) {
  const chosen = new Set(selected);
  for (const category of chosen) {
    if (!categories.includes(category)) throw new Error(`Unknown test category: ${category}`);
  }
  const file = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const edits = new MagicString(source);
  const removed = [];
  function visit(node) {
    if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression)) {
      const call = node.expression;
      let expression = call.expression;
      // Supports test.unit(), test.unit.skip(), test.unit.only().
      if (ts.isPropertyAccessExpression(expression) && ['skip', 'only'].includes(expression.name.text)) {
        expression = expression.expression;
      }
      if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.expression) &&
          expression.expression.text === 'test' && categories.includes(expression.name.text)) {
        const category = expression.name.text;
        if (!chosen.has(category)) {
          edits.remove(node.getStart(file), node.getEnd());
          removed.push(category);
          return;
        }
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return { code: edits.toString(), map: edits.generateMap({ hires: true, source: filename, includeContent: true }), removed };
}

export function categoryPlugin(selected) {
  return {
    name: 'testopia-category-elimination',
    enforce: 'pre',
    transform(source, id) {
      if (!/\.[cm]?[jt]sx?$/.test(id.split('?')[0]) || id.includes('node_modules')) return null;
      if (!source.includes('test.')) return null;
      const transformed = filterCategories(source, id, selected);
      return transformed.removed.length ? { code: transformed.code, map: transformed.map } : null;
    },
  };
}

export async function compileTest({ file, runner, selected, outDir, root = process.cwd() }) {
  if (!['vitest', 'playwright'].includes(runner)) throw new Error(`Unsupported runner: ${runner}`);
  const adapter = resolve(root, 'src', 'runners', `${runner}.ts`);
  const stem = basename(file).replace(/\.[cm]?[jt]sx?$/, '');
  const outputName = `${stem}-${Buffer.from(resolve(file)).toString('hex').slice(-12)}.${runner === 'vitest' ? 'test' : 'spec'}.mjs`;
  await build({
    configFile: false,
    root,
    logLevel: 'warn',
    plugins: [categoryPlugin(selected)],
    resolve: { alias: [{ find: '@testopia/core', replacement: adapter }] },
    build: {
      outDir,
      emptyOutDir: false,
      sourcemap: true,
      target: 'node22',
      minify: false,
      rollupOptions: {
        input: resolve(file),
        external: ['vitest', '@playwright/test'],
        output: { format: 'es', entryFileNames: outputName, inlineDynamicImports: true },
      },
    },
  });
  return join(outDir, outputName);
}
