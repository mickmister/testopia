import { test as playwrightTest, expect } from '@playwright/test';

type Callback = (context: { page: Parameters<Parameters<typeof playwrightTest>[1]>[0]['page']; expect: typeof expect }) => void | Promise<void>;
type Case = ((name: string, callback: Callback) => void) & {
  skip: (name: string, callback: Callback) => void;
  only: (name: string, callback: Callback) => void;
};

const e2e = ((name: string, callback: Callback) =>
  playwrightTest(name, async ({ page }) => callback({ page, expect }))) as Case;
e2e.skip = (name, callback) => playwrightTest.skip(name, async ({ page }) => callback({ page, expect }));
e2e.only = (name, callback) => playwrightTest.only(name, async ({ page }) => callback({ page, expect }));

function unsupported(category: string): Case {
  const fail = (() => { throw new Error(`Unexpected ${category} test in Playwright bundle; check category elimination`); }) as unknown as Case;
  fail.skip = fail;
  fail.only = fail;
  return fail;
}

export const feature = playwrightTest.describe;
export const scenario = playwrightTest.describe;
export const test = {
  unit: unsupported('unit'),
  integration: unsupported('integration'),
  e2e,
};
