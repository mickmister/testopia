import type { Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}
  async goto() {
    await this.page.setContent(`<label>Email <input aria-label="Email"></label>
      <button onclick="document.querySelector('[role=status]').textContent = 'Signed in: ' + document.querySelector('input').value">Sign in</button>
      <div role="status"></div>`);
  }
  async signIn(email: string) {
    await this.page.getByRole('textbox', { name: 'Email' }).fill(email);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
}
