# Testopia

**Stories first. Tests together. The right tool for every behavior.**

Testopia is a TypeScript-native testing framework built around the power of **co-location**. Instead of scattering unit, integration, and end-to-end tests across tool-specific directories, a feature's tests live together. Their structure encodes user stories and observable behavior; Testopia selects the right runner and environment for each use case.

## Mixed-runner vertical slice

The first executable implementation is now available. It includes category-based Vite elimination, a CLI, and runner-specific DSL adapters for Vitest and Playwright.

```ts
import { feature, scenario, test } from '@testopia/core';

feature('User authentication', () => {
  scenario('A registered user can sign in', () => {
    test.unit('validates credentials', async ({ expect }) => {
      const { validateCredentials } = await import('./auth');
      expect(validateCredentials('user@example.com')).toBe(true);
    });

    test.integration('persists a session', async ({ expect }) => {
      // Check service behavior and persistence.
    });

    test.e2e('signs in through the browser', async ({ page }) => {
      // Use a Page Object to exercise the real user journey.
    });
  });
});
```

Only selected test calls are retained in the compiled output. The core engine is replaced at build time using Vite aliases; test declarations are **not** rewritten into runner-specific registration code. Ordinary local and imported helpers work as usual. See [the TanStack Start app](example/README.md), [its mixed-category tests](example/tests/task-board.spec.ts), and [the initial smoke example](examples/basic/auth.spec.ts) and [its Page Object](examples/basic/login-page.ts).

## Running tests

Requires Node.js 22 or newer.

```sh
npm install
npm install --prefix example
npx playwright install chromium
npm test                     # compiler and smoke tests
npm run test:framework       # all categories (Vitest + Playwright)
npm run test:unit
npm run test:integration
npm run test:e2e
node src/cli.js test --type unit,integration
node src/cli.js test --runner playwright --type e2e
```

### Filtering

Filters work across Vitest and Playwright. File filters are glob patterns relative to the working directory; repeat `--file` to select multiple globs (union). Name filters are **literal, case-sensitive substrings** of the full test title (feature + scenario + test), combined with AND semantics.

```sh
node src/cli.js test --file 'example/**/*.spec.ts'
node src/cli.js test --file 'example/**/*.spec.ts' --type e2e
node src/cli.js test --test 'normalizes whitespace'
node src/cli.js test --feature 'Task board' --scenario 'A user adds a task'
node src/cli.js test --file 'example/**/*.spec.ts' --scenario 'A user completes a task' --type integration,e2e
```

`--file` restricts source files before compilation; `--feature`, `--scenario`, and `--test` use the native runner's full-name filtering after category compilation. These name filters do not remove individual test callbacks from bundles. Quote globs to avoid shell expansion. An unmatched file glob fails immediately; an unmatched name filter is reported by the underlying runner.

Generated bundles and temporary runner configs are written to `.testopia/`. Source maps are enabled. This is a **vertical slice**, not a published or feature-complete library: fixture injection, browser application coverage, and full TypeScript package ergonomics are still on the roadmap.

## CI

GitHub Actions runs on **push to every branch**, pull requests, and manual dispatch. It tests on Node.js 22 and 24, installs Chromium, runs compiler tests, then runs both native test runners through Testopia.

See [issue #1](https://github.com/mickmister/testopia/issues/1) for architecture, milestones, and acceptance criteria.

## License

[MIT](LICENSE).
