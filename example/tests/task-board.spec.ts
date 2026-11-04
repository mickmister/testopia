import { feature, scenario, test } from '@testopia/core';
import { TaskBoardPage } from './pages/task-board.page';

feature('Task board', () => {
  const sampleTitle = () => '  Write   documentation  ';

  scenario('A user adds a task', () => {
    test.unit('normalizes whitespace in task titles', async ({ expect }) => {
      const { normalizeTitle } = await import('../src/lib/tasks');
      expect(normalizeTitle(sampleTitle())).toBe('Write documentation');
    });

    test.unit('rejects too-short task titles', async ({ expect }) => {
      const { validateTitle } = await import('../src/lib/tasks');
      expect(validateTitle(' x ')).toBe(false);
    });

    test.integration('persists a new task in a repository', async ({ expect }) => {
      const { TaskRepository } = await import('../src/lib/tasks');
      const repository = new TaskRepository();
      repository.add(sampleTitle());
      expect(repository.list()).toEqual([{ id: 1, title: 'Write documentation', completed: false }]);
    });

    test.e2e('shows the task in the real TanStack Start app', async ({ page, expect }) => {
      const board = new TaskBoardPage(page);
      await board.goto();
      await board.addTask('Write documentation');
      await expect(board.task('Write documentation')).toBeVisible();
    });
  });

  scenario('A user completes a task', () => {
    test.integration('updates the repository state', async ({ expect }) => {
      const { TaskRepository } = await import('../src/lib/tasks');
      const repository = new TaskRepository();
      const task = repository.add('Review pull request');
      repository.complete(task.id);
      expect(repository.list()[0].completed).toBe(true);
    });

    test.e2e('marks a task completed in the browser', async ({ page, expect }) => {
      const board = new TaskBoardPage(page);
      await board.goto();
      await board.addTask('Review pull request');
      await board.completeTask('Review pull request');
      await expect(page.getByRole('list', { name: 'Tasks' })).toContainText('✓ Review pull request');
    });
  });
});
