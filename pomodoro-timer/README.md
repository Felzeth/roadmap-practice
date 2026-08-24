# Pomodoro Timer

A beautiful, accessible Pomodoro Timer web application built with HTML, CSS, and JavaScript. Based on the Pomodoro Technique for improved productivity and time management.

Based on the [Pomodoro Timer](https://roadmap.sh/projects/pomodoro-timer) challenge from roadmap.sh.

## Features

- **Start, Pause, Reset** - Full timer controls
- **Skip to Next Session** - Jump to the next work or break session
- **Configurable Intervals** - Customize work, short break, and long break durations
- **Session Tracking** - Visual dots showing completed work sessions
- **Automatic Session Switching** - Automatically transitions between work and break sessions
- **Long Break After 4 Sessions** - Earns a long break after completing 4 work sessions
- **Sound Notifications** - Pleasant chime when a session ends (toggleable)
- **Persistent Settings** - Saves your preferences to localStorage
- **Responsive Design** - Works on desktop and mobile devices
- **Keyboard Shortcuts** - Space (start/pause), R (reset), S (skip), 1/2/3 (switch sessions)
- **Accessibility** - ARIA labels, keyboard navigation, focus states, reduced motion support

## How to Run

Open `index.html` in your browser.

```bash
git clone https://github.com/Felzeth/roadmap-practice.git
cd roadmap-practice/pomodoro-timer
open index.html
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Start / Pause timer |
| `R` | Reset timer |
| `S` | Skip to next session |
| `1` | Switch to Work session |
| `2` | Switch to Short Break |
| `3` | Switch to Long Break |

## Project Structure

```
├── index.html
├── styles.css
├── app.js
└── README.md
```
