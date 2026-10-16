#!/usr/bin/env python3
"""
GitHub User Activity CLI
Fetches and displays recent GitHub activity for a given username.
Based on the GitHub User Activity project from roadmap.sh.
"""

import sys
import json
import urllib.request
import urllib.error
from datetime import datetime


# ANSI color codes for terminal output
COLORS = {
    "reset": "\033[0m",
    "red": "\033[91m",
    "green": "\033[92m",
    "yellow": "\033[93m",
    "blue": "\033[94m",
    "magenta": "\033[95m",
    "cyan": "\033[96m",
    "bold": "\033[1m",
    "dim": "\033[2m",
}


def print_colored(text, color="reset"):
    """Print colored text if terminal supports it."""
    print(f"{COLORS.get(color, '')}{text}{COLORS['reset']}")


def print_error(message):
    """Print an error message in red."""
    print_colored(f"- {message}", "red")


def print_success(message):
    """Print a success message in green."""
    print_colored(f"OK {message}", "green")


def print_info(message):
    """Print an info message in blue."""
    print_colored(f"> {message}", "blue")


def print_warning(message):
    """Print a warning message in yellow."""
    print_colored(f"! {message}", "yellow")


def print_section(title):
    """Print a section header."""
    print()
    print_colored("=" * 50, "cyan")
    print_colored(title, "bold")
    print_colored("=" * 50, "cyan")
    print()


def print_event_activity(event, repo_name):
    """
    Extract and format the activity message from a GitHub event.

    Args:
        event: GitHub event dictionary.
        repo_name: Repository name for display.

    Returns:
        Tuple of (display_message, color).
    """
    event_type = event.get("type", "UnknownEvent")

    # Message based on event type
    if event_type == "PushEvent":
        commits = event.get("payload", {}).get("commits", [])
        commit_count = len(commits)
        if commit_count > 0:
            return f"Pushed {commit_count} commit(s) to {repo_name}", "green"
        return f"Pushed commits to {repo_name}", "green"

    elif event_type == "PullRequestEvent":
        action = event.get("payload", {}).get("action", "updated")
        return f"Pull request {action} in {repo_name}", "cyan"

    elif event_type == "IssuesEvent":
        action = event.get("payload", {}).get("action", "updated")
        return f"{action} an issue in {repo_name}", "blue"

    elif event_type == "IssueCommentEvent":
        action = event.get("payload", {}).get("action", "commented")
        return f"{action} on an issue in {repo_name}", "blue"

    elif event_type == "WatchEvent":
        action = event.get("payload", {}).get("action", "starred")
        return f"{action} {repo_name}", "yellow"

    elif event_type == "CreateEvent":
        ref_type = event.get("payload", {}).get("ref_type", "repo")
        return f"Created a {ref_type} in {repo_name}", "green"

    elif event_type == "DeleteEvent":
        ref_type = event.get("payload", {}).get("ref_type", "repo")
        return f"Deleted a {ref_type} in {repo_name}", "red"

    elif event_type == "ForkEvent":
        return f"Forked {repo_name}", "green"

    elif event_type == "ReleaseEvent":
        action = event.get("payload", {}).get("action", "published")
        return f"{action} a release in {repo_name}", "magenta"

    elif event_type == "PullRequestReviewEvent":
        action = event.get("payload", {}).get("action", "reviewed")
        return f"{action} a pull request in {repo_name}", "cyan"

    elif event_type == "FollowEvent":
        return "Started following a user", "dim"

    elif event_type == "MemberEvent":
        return "Added a collaborator to a repository", "dim"

    elif event_type == "PublicEvent":
        return f"Made {repo_name} public", "yellow"

    elif event_type == "GollumEvent":
        return f"Created/edited wiki pages in {repo_name}", "cyan"

    else:
        # Generic message for unknown events
        return f"{action} in {repo_name}", "dim"


def fetch_user_events(username):
    """
    Fetch recent events for a GitHub user.

    Args:
        username: GitHub username

    Returns:
        List of event dictionaries, or None if failed.
    """
    url = f"https://api.github.com/users/{username}/events"

    req = urllib.request.Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "github-activity-cli/1.0",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            return data
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print_error(f"User '{username}' not found.")
            print_info("Please check the username and try again.")
        elif e.code == 403:
            print_error("API rate limit exceeded. Please try again later.")
            print_info("Free tier rate limit: 60 requests/hour (unauthenticated).")
        else:
            print_error(f"HTTP Error {e.code}: {e.reason}")
        return None
    except urllib.error.URLError as e:
        print_error(f"Network error: {e.reason}")
        print_info("Please check your internet connection and try again.")
        return None
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        return None


def display_events(events, limit=5):
    """
    Display the fetched events.

    Args:
        events: List of event dictionaries
        limit: Maximum number of events to display
    """
    count = 0
    for event in events:
        if count >= limit:
            print_info(f"... and {len(events) - limit} more")
            break

        repo = event.get("repo", {})
        repo_name = repo.get("name", "unknown")
        timestamp = event.get("created_at", "unknown")

        # Format timestamp
        try:
            dt = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
            time_str = dt.strftime("%Y-%m-%d %H:%M")
        except Exception:
            time_str = timestamp

        # Get activity message
        title, color = print_event_activity(event, repo_name)

        # Print event
        print_colored(f"[{time_str}] ", "dim")
        print_colored(f"> {title}", color)
        print()

        count += 1

    print()
    print_section(f"Displaying {min(count, limit)} of {len(events)} recent events")


def display_user_info(username):
    """Display basic user information."""
    url = f"https://api.github.com/users/{username}"

    req = urllib.request.Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "github-activity-cli/1.0",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            return data
    except Exception:
        return None


def show_user_info(username):
    """Show user profile information."""
    user_data = display_user_info(username)

    if user_data:
        print_section(f"User: {username}")

        name = user_data.get("name", "N/A")
        bio = user_data.get("bio", "N/A")
        avatar = user_data.get("avatar_url", "N/A")
        followers = user_data.get("followers", "N/A")
        following = user_data.get("following", "N/A")
        public_repos = user_data.get("public_repos", "N/A")
        location = user_data.get("location", "N/A")
        blog = user_data.get("blog", "N/A")

        print_colored(f"  Name:      {name}", "reset")
        print_colored(f"  Bio:       {bio}", "reset")
        print_colored(f"  Avatar:    {avatar}", "reset")
        print_colored(f"  Followers: {followers}", "reset")
        print_colored(f"  Following: {following}", "reset")
        print_colored(f"  Repos:     {public_repos}", "reset")
        print_colored(f"  Location:  {location}", "reset")
        print_colored(f"  Blog:      {blog}", "reset")
        print()


def main():
    """Main entry point for the CLI."""
    # Check command line arguments
    if len(sys.argv) < 2:
        print_colored("GitHub User Activity CLI", "bold")
        print_colored("Fetch and display recent GitHub activity for a user.", "reset")
        print()
        print_colored("Usage: python3 cli.py <username>", "dim")
        print_colored("Example: python3 cli.py kamranahmedse", "dim")
        print()
        print_colored("Options:", "bold")
        print_colored("  --help, -h     Show this help message", "dim")
        print_colored("  --info, -i     Show user profile information", "dim")
        print_colored("  --all          Show all events (not just the latest 5)", "dim")
        print()
        print_colored("Please provide a GitHub username.", "red")
        sys.exit(1)

    # Parse arguments
    args = sys.argv[1:]
    username = None
    show_info = False
    show_all = False

    for arg in args:
        if arg in ("-h", "--help"):
            print_colored("GitHub User Activity CLI", "bold")
            print_colored("Fetch and display recent GitHub activity for a user.", "reset")
            print()
            print_colored("Usage: python3 cli.py <username>", "dim")
            print_colored("Example: python3 cli.py kamranahmedse", "dim")
            print()
            print_colored("Options:", "bold")
            print_colored("  --help, -h     Show this help message", "dim")
            print_colored("  --info, -i     Show user profile information", "dim")
            print_colored("  --all          Show all events (not just the latest 5)", "dim")
            print()
            sys.exit(0)
        elif arg in ("-i", "--info"):
            show_info = True
        elif arg == "--all":
            show_all = True
        elif not arg.startswith("-"):
            username = arg

    if not username:
        print_error("No username provided.")
        print_info("Usage: python3 cli.py <username>")
        sys.exit(1)

    # Show user info if requested
    if show_info:
        show_user_info(username)
        # Still fetch events for the main output
        events = fetch_user_events(username)
        if events:
            display_events(events, limit=5)
        return

    # Fetch and display events
    print_colored(f"Fetching activity for user: {username}", "cyan")
    print()

    events = fetch_user_events(username)

    if events:
        display_events(events, limit=5 if not show_all else len(events))
        print_success(f"Successfully fetched {len(events)} events!")


if __name__ == "__main__":
    main()
