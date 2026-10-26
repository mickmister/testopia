import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { createTask, type Task, validateTitle } from '../lib/tasks';

export const Route = createFileRoute('/')({
  ssr: false,
  component: TaskBoard,
});

function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');

  function addTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateTitle(title)) return;
    setTasks(current => [...current, createTask(current.length + 1, title)]);
    setTitle('');
  }

  function completeTask(id: number) {
    setTasks(current => current.map(task => task.id === id ? { ...task, completed: true } : task));
  }

  return (
    <main>
      <h1>Testopia Task Board</h1>
      <p>Plan your day</p>
      <form onSubmit={addTask}>
        <label htmlFor="task-title">Task title</label>
        <input id="task-title" value={title} onChange={event => setTitle(event.target.value)} />
        <button type="submit" disabled={!validateTitle(title)}>Add task</button>
      </form>
      <h2>Tasks</h2>
      <ul aria-label="Tasks">
        {tasks.map(task => (
          <li key={task.id}>
            <span>{task.completed ? '✓ ' : ''}{task.title}</span>{' '}
            {!task.completed && <button onClick={() => completeTask(task.id)}>Complete {task.title}</button>}
          </li>
        ))}
      </ul>
    </main>
  );
}
