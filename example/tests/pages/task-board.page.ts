import type { Page } from '@playwright/test';

export class TaskBoardPage {
  constructor(private readonly page: Page) {}

  async goto() {
    const errors: string[] = [];
    this.page.on('pageerror', error => errors.push(error.message));
    this.page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });
    const response = await this.page.goto('http://127.0.0.1:3000/');
    try {
      await this.page.getByRole('heading', { name: 'Testopia Task Board' }).waitFor({ timeout: 10000 });
    } catch (cause) {
      const body = (await this.page.locator('body').innerText().catch(() => '<body unavailable>')).slice(0, 2000);
      throw new Error(`Task board did not render (HTTP ${response?.status() ?? 'unknown'}, URL ${this.page.url()}). Browser errors: ${JSON.stringify(errors)}. Body: ${body}`, { cause });
    }
  }

  async addTask(title: string) {
    await this.page.getByLabel('Task title').fill(title);
    await this.page.getByRole('button', { name: 'Add task' }).click();
  }

  task(title: string) {
    return this.page.getByRole('list', { name: 'Tasks' }).getByText(title);
  }

  async completeTask(title: string) {
    await this.page.getByRole('button', { name: `Complete ${title}` }).click();
  }
}
