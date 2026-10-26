# Testopia + TanStack Start example

A real [TanStack Start](https://tanstack.com/start) React app and a single co-located behavioral test file.

**Feature:** Task board. **Scenarios:** adding a task and completing a task. Each story has the appropriate mix of unit, integration, and E2E verifications. E2E tests use a reusable Page Object in `tests/pages/task-board.page.ts`.

## Run

From the repository root:

```sh
npm install
npm install --prefix example
npx playwright install chromium
npm run test:framework
```

The Testopia CLI discovers `example/tests/task-board.spec.ts` alongside the earlier smoke example. For E2E, Testopia starts the actual TanStack Start Vite dev server automatically using Playwright's `webServer` configuration. You can also run the app manually with `npm run dev --prefix example`.

```sh
npm run test:unit
npm run test:integration
npm run test:e2e
```

This is an integration demonstration, not a production data store: the React UI keeps tasks in component state, while integration tests verify a separate in-memory `TaskRepository`. The E2E tests exercise the actual TanStack Start app and its server-rendered welcome message.
