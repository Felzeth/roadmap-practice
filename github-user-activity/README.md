# GitHub User Activity CLI

A command-line interface (CLI) tool that fetches and displays recent GitHub activity for a specified user. Built using only Python's standard library and the GitHub API.

Based on the [GitHub User Activity](https://roadmap.sh/projects/github-user-activity) project from roadmap.sh.

## Features

- **Fetch Recent Activity** - Gets the latest events from a GitHub user's activity feed
- **Display Events** - Shows events with timestamps, colors, and readable descriptions
- **User Profile Info** - View user details (name, bio, followers, etc.)
- **Error Handling** - Gracefully handles invalid usernames, rate limits, and network errors
- **No External Dependencies** - Uses only Python's built-in libraries (JSON, urllib, datetime)

## Prerequisites

- Python 3.7 or later
- Internet connection (for GitHub API access)

## Usage

### Basic Usage

```bash
python3 cli.py <username>
```

Example:

```bash
python3 cli.py kamranahmedse
```

### Options

| Option | Description |
|--------|-------------|
| `--help`, `-h` | Show help message |
| `--info`, `-i` | Show user profile information |
| `--all` | Show all events (not just the latest 5) |

### Examples

```bash
# Show recent activity for a user
python3 cli.py kamranahmedse

# Show user profile info
python3 cli.py -i kamranahmedse

# Show all events
python3 cli.py --all kamranahmedse
```

## Requirements

| Requirement | Description |
|-------------|-------------|
| Username as Argument | The tool accepts the GitHub username as a command-line argument |
| GitHub API | Fetches events from `https://api.github.com/users/<username>/events` |
| Display Output | Shows activity in the terminal with descriptive messages |
| Error Handling | Handles invalid usernames and API failures gracefully |
| No External Libraries | Uses only Python standard library |

## Output Format

```
==================================================
Fetching activity for user: kamranahmedse
==================================================

[2024-01-15 14:30]
🐙 Pushed 3 commits to kamranahmedse/developer-roadmap

[2024-01-14 10:15]
🐙 Opened a new issue in kamranahmedse/developer-roadmap

[2024-01-13 09:00]
🐙 Starred kamranahmedse/developer-roadmap

...
==================================================
Displaying 5 of 12 recent events
==================================================
```

## API Endpoints Used

- **Events**: `GET https://api.github.com/users/<username>/events`
- **User Profile**: `GET https://api.github.com/users/<username>`

## Rate Limits

| Plan | Requests/hour |
|------|---------------|
| Unauthenticated | 60 |
| Authenticated | 5,000 |

## Project Structure

```
github-user-activity/
├── cli.py           # Main CLI application
├── requirements.txt # Dependencies (none required)
└── README.md        # This file
```

## License

MIT
