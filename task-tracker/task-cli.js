#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(process.cwd(), 'tasks.json');

// ── Helpers ─────────────────────────────────────────────

function loadTasks() {
  if (!fs.existsSync(DB_FILE)) {
    return [];
  }
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

function saveTasks(tasks) {
  fs.writeFileSync(DB_FILE, JSON.stringify(tasks, null, 2));
}

function nextId(tasks) {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map(t => t.id)) + 1;
}

function now() {
  return new Date().toISOString();
}

function printTask(task) {
  const statusLabel =
    task.status === 'done' ? '✅ done' :
    task.status === 'in-progress' ? '🔄 in-progress' :
    '⬜ todo';
  console.log(`  [${task.id}] ${task.description} (${statusLabel})`);
}

function error(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

// ── Commands ────────────────────────────────────────────

const commands = {
  add(args) {
    const description = args.join(' ');
    if (!description) error('Please provide a task description.');

    const tasks = loadTasks();
    const task = {
      id: nextId(tasks),
      description,
      status: 'todo',
      createdAt: now(),
      updatedAt: now(),
    };
    tasks.push(task);
    saveTasks(tasks);
    console.log(`Task added successfully (ID: ${task.id})`);
  },

  update(args) {
    const id = parseInt(args[0], 10);
    const description = args.slice(1).join(' ');
    if (isNaN(id)) error('Please provide a valid task ID.');
    if (!description) error('Please provide a new description.');

    const tasks = loadTasks();
    const task = tasks.find(t => t.id === id);
    if (!task) error(`Task with ID ${id} not found.`);

    task.description = description;
    task.updatedAt = now();
    saveTasks(tasks);
    console.log(`Task ${id} updated successfully.`);
  },

  delete(args) {
    const id = parseInt(args[0], 10);
    if (isNaN(id)) error('Please provide a valid task ID.');

    const tasks = loadTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) error(`Task with ID ${id} not found.`);

    tasks.splice(index, 1);
    saveTasks(tasks);
    console.log(`Task ${id} deleted successfully.`);
  },

  'mark-in-progress'(args) {
    const id = parseInt(args[0], 10);
    if (isNaN(id)) error('Please provide a valid task ID.');

    const tasks = loadTasks();
    const task = tasks.find(t => t.id === id);
    if (!task) error(`Task with ID ${id} not found.`);

    task.status = 'in-progress';
    task.updatedAt = now();
    saveTasks(tasks);
    console.log(`Task ${id} marked as in-progress.`);
  },

  'mark-done'(args) {
    const id = parseInt(args[0], 10);
    if (isNaN(id)) error('Please provide a valid task ID.');

    const tasks = loadTasks();
    const task = tasks.find(t => t.id === id);
    if (!task) error(`Task with ID ${id} not found.`);

    task.status = 'done';
    task.updatedAt = now();
    saveTasks(tasks);
    console.log(`Task ${id} marked as done.`);
  },

  list(args) {
    const tasks = loadTasks();
    const filter = args[0];

    if (tasks.length === 0) {
      console.log('No tasks found.');
      return;
    }

    let filtered = tasks;
    if (filter === 'done') {
      filtered = tasks.filter(t => t.status === 'done');
    } else if (filter === 'todo') {
      filtered = tasks.filter(t => t.status === 'todo');
    } else if (filter === 'in-progress') {
      filtered = tasks.filter(t => t.status === 'in-progress');
    } else if (filter) {
      error(`Unknown filter "${filter}". Use: done, todo, in-progress`);
    }

    if (filtered.length === 0) {
      console.log('No tasks found.');
      return;
    }

    filtered.forEach(printTask);
  },
};

// ── Usage ───────────────────────────────────────────────

function showUsage() {
  console.log(`
Usage: task-cli <command> [arguments]

Commands:
  add "description"              Add a new task
  update <id> "description"      Update a task's description
  delete <id>                    Delete a task
  mark-in-progress <id>          Mark a task as in-progress
  mark-done <id>                 Mark a task as done
  list                           List all tasks
  list done                      List completed tasks
  list todo                      List tasks to do
  list in-progress               List tasks in progress
`);
}

// ── Main ────────────────────────────────────────────────

const [, , command, ...args] = process.argv;

if (!command || command === 'help') {
  showUsage();
  process.exit(0);
}

if (commands[command]) {
  commands[command](args);
} else {
  error(`Unknown command "${command}". Run "task-cli help" for usage.`);
}
