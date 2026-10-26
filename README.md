# Testopia

**Stories first. Tests together. The right tool for every behavior.**

Testopia is an in-development TypeScript-native testing framework built around the power of **co-location**. Instead of scattering unit, integration, and end-to-end tests across tool-specific directories, a feature's tests live together. The test structure encodes user stories and observable behavior; Testopia will select the right runner and environment for each use case.

## Planned developer experience

```ts
import { feature, scenario, test } from '@testopia/core';

feature('User authentication', () => {
  scenario('A registered user can sign in', () => {
    test.unit('validates credentials', async ({ expect }) => {
      const { validateCredentials } = await import('./auth');
      expect(validateCredentials('user@example.com')).toBe(true);
    });

    test.integration('persists a session', async ({ db }) => {
      // Verify session persistence using an isolated database fixture.
    });

    test.e2e('signs in through the browser', async ({ page }) => {
      // Use a Page Object to exercise the real user journey.
    });
  });
});
```

*The DSL above is a design target, not an implemented API.* Testopia will use Vite to selectively remove excluded categories before bundling, and runner-specific core engine entry points will register tests with Vitest or Playwright without generating runner-specific test code. Same-file and imported helpers, Page Objects, and code coverage are part of the roadmap.

See [the master implementation issue](https://github.com/mickmister/testopia/issues/1) for the architecture, milestones, and acceptance criteria.

## Continuous integration

GitHub Actions runs on **pushes to every branch**, pull requests, and manual dispatch. The initial foundation uses Node's built-in test runner for a dependency-free smoke test; Vitest, Playwright, and coverage checks will be added as the framework is implemented.

```sh
npm test
```

## License

[MIT](LICENSE).
