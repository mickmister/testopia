import type { Page } from '@playwright/test';

export class TaskBoardPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('http://127.0.0.1:3000/');
    await this.page.getByRole('heading', { name: 'Testopia Task Board' }).waitFor({ timeout: 10000 });
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
