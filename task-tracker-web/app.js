/**
 * Task Tracker — browser app logic
 */

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');

let tasks = [];

// ── Add Task ────────────────────────────────────

function addTask(description) {
  const trimmed = description.trim();
  if (!trimmed) return;

  tasks.push({
    id: Date.now(),
    description: trimmed,
    completed: false,
  });

  renderTasks();
}

// ── Toggle Complete ─────────────────────────────

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
  }
  renderTasks();
}

// ── Delete Task ─────────────────────────────────

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
}

// ── Render ──────────────────────────────────────

function renderTasks() {
  taskList.innerHTML = '';

  // Pending first, then completed
  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed);
  const sorted = [...pending, ...completed];

  sorted.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.completed ? ' completed' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.description;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '&#128465;';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

// ── Events ──────────────────────────────────────

taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addTask(taskInput.value);
  taskInput.value = '';
  taskInput.focus();
});

// Initial render
renderTasks();
