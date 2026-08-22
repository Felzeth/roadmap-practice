# Task Tracker

A browser-based task tracker to add, complete, and delete tasks. Built with vanilla HTML, CSS, and JavaScript.

Based on the [Task Tracker](https://roadmap.sh/projects/task-tracker-web) challenge from roadmap.sh.

## How to Run

Open `index.html` in your browser.

```bash
git clone https://github.com/Felzeth/roadmap-practice.git
cd roadmap-practice/task-tracker-web
open index.html
```

## Features

- Add tasks by typing and pressing Enter or clicking the button
- Toggle completion with the checkbox
- Delete tasks with the trash icon
- Completed tasks move to the bottom with strikethrough
- Unmarking a task returns it to the pending list

## Project Structure

```
├── index.html
├── styles.css
├── app.js
└── README.md
```

## How It Works

- Tasks are stored in an array of objects with `id`, `description`, and `completed` properties
- `renderTasks()` clears the DOM and re-renders based on the current array state
- Pending tasks appear first, completed tasks at the bottom
