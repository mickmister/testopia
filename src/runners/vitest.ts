import { describe, it, expect } from 'vitest';

type Callback = (context: { expect: typeof expect }) => void | Promise<void>;
type Case = ((name: string, callback: Callback) => void) & {
  skip: (name: string, callback: Callback) => void;
  only: (name: string, callback: Callback) => void;
};

function makeCase(register: typeof it): Case {
  const run = ((name: string, callback: Callback) => register(name, () => callback({ expect }))) as Case;
  run.skip = (name, callback) => register.skip(name, () => callback({ expect }));
  run.only = (name, callback) => register.only(name, () => callback({ expect }));
  return run;
}

function unsupported(category: string): Case {
  const fail = (() => { throw new Error(`Unexpected ${category} test in Vitest bundle; check category elimination`); }) as unknown as Case;
  fail.skip = fail;
  fail.only = fail;
  return fail;
}

export const feature = describe;
export const scenario = describe;
export const test = {
  unit: makeCase(it),
  integration: makeCase(it),
  e2e: unsupported('e2e'),
};
