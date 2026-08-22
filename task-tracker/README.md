# Task Tracker CLI

A simple command line interface (CLI) to track and manage your tasks. Built with vanilla Node.js — no external libraries.

Based on the [Task Tracker](https://roadmap.sh/projects/task-tracker) project from roadmap.sh.

## How to Run

```bash
# Install globally (one time)
npm link

# Then use directly
task-cli <command> [arguments]
```

Or run without installing:

```bash
node task-cli.js <command> [arguments]
```

## Commands

```bash
# Adding a new task
task-cli add "Buy groceries"
# Output: Task added successfully (ID: 1)

# Updating and deleting tasks
task-cli update 1 "Buy groceries and cook dinner"
task-cli delete 1

# Marking a task as in progress or done
task-cli mark-in-progress 1
task-cli mark-done 1

# Listing all tasks
task-cli list

# Listing tasks by status
task-cli list done
task-cli list todo
task-cli list in-progress
```

## Task Properties

| Property | Description |
|----------|-------------|
| `id` | Unique identifier |
| `description` | Short task description |
| `status` | `todo`, `in-progress`, or `done` |
| `createdAt` | Timestamp when created |
| `updatedAt` | Timestamp when last updated |

## Storage

Tasks are stored in a `tasks.json` file in the current directory. The file is created automatically on first use.
