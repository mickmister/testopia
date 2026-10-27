import { feature, scenario, test } from '@testopia/core';
import { LoginPage } from './login-page';

feature('Authentication', () => {
  const makeEmail = (name: string) => `${name}@example.com`;

  scenario('A user can sign in', () => {
    test.unit('builds a valid email', async ({ expect }) => {
      const { isValidEmail } = await import('./validation');
      expect(isValidEmail(makeEmail('alex'))).toBe(true);
    });

    test.integration('shares data between components', async ({ expect }) => {
      const { normalizeEmail } = await import('./validation');
      expect(normalizeEmail(makeEmail('ALEX'))).toBe('alex@example.com');
    });

    test.e2e('signs in using a page object', async ({ page, expect }) => {
      const login = new LoginPage(page);
      await login.goto();
      await login.signIn(makeEmail('alex'));
      await expect(page.getByRole('status')).toHaveText('Signed in: alex@example.com');
    });
  });
});
