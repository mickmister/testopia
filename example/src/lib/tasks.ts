export interface Task { id: number; title: string; completed: boolean }

export function normalizeTitle(title: string): string {
  return title.trim().replace(/\s+/g, ' ');
}

export function validateTitle(title: string): boolean {
  return normalizeTitle(title).length >= 3;
}

export function createTask(id: number, title: string): Task {
  if (!validateTitle(title)) throw new Error('Task title must be at least 3 characters');
  return { id, title: normalizeTitle(title), completed: false };
}

export class TaskRepository {
  private readonly tasks = new Map<number, Task>();
  private nextId = 1;

  add(title: string): Task {
    const task = createTask(this.nextId++, title);
    this.tasks.set(task.id, task);
    return task;
  }

  complete(id: number): Task {
    const existing = this.tasks.get(id);
    if (!existing) throw new Error('Task not found');
    const updated = { ...existing, completed: true };
    this.tasks.set(id, updated);
    return updated;
  }

  list(): Task[] {
    return [...this.tasks.values()];
  }
}
