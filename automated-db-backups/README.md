# Automated DB Backups

Set up automated MongoDB backups to Cloudflare R2 every 12 hours using GitHub Actions or cron jobs.

Based on the [Automated DB Backups](https://roadmap.sh/projects/automated-db-backups) challenge from roadmap.sh.

## Features

- **Automated Backups** - Scheduled every 12 hours via GitHub Actions
- **Cloudflare R2 Storage** - Free tier compatible, S3-compatible storage
- **Compression** - gzip compression for smaller backup files
- **Retention Policy** - Automatic cleanup of old backups (configurable)
- **Restore Script** - Download and restore from R2 with one command
- **Manual Trigger** - Run backups on-demand via GitHub Actions

## Prerequisites

- MongoDB instance running (local or remote)
- Cloudflare account with R2 enabled
- GitHub repository (for scheduled workflow)

## Setup

### 1. Configure Cloudflare R2

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → R2
2. Create a new bucket (e.g., `db-backups`)
3. Create an API token with read/write permissions
4. Note your Account ID and API credentials

### 2. Set GitHub Secrets

Go to your repository → Settings → Secrets and variables → Actions

Add the following secrets:

| Secret | Description |
|--------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `MONGO_DB` | Database name to backup |
| `R2_BUCKET` | R2 bucket name |
| `R2_ENDPOINT` | R2 endpoint URL |
| `AWS_ACCESS_KEY_ID` | R2 API access key |
| `AWS_SECRET_ACCESS_KEY` | R2 API secret key |
| `BACKUP_RETENTION_DAYS` | Days to keep backups (default: 30) |

### 3. Install MongoDB Tools (for local testing)

```bash
# Ubuntu/Debian
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-mongosh mongodb-org-tools

# macOS
brew install mongodb-community@7.0
```

### 4. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your values
source .env
```

## Usage

### Manual Backup (Local)

```bash
chmod +x backup.sh
./backup.sh
```

### Restore from R2

```bash
chmod +x restore.sh

# Restore latest backup
./restore.sh latest

# List available backups
./restore.sh list

# Restore specific backup
./restore.sh restore myapp_2024-01-15_12-00-00.tar.gz
```

### GitHub Actions

The workflow runs automatically every 12 hours. You can also trigger it manually:

1. Go to Actions → Automated Database Backup
2. Click "Run workflow"
3. Select backup type (full/quick)
4. Click "Run workflow"

## Cron Job Alternative

If you prefer running on your server instead of GitHub Actions:

```bash
# Edit crontab
crontab -e

# Add this line (runs every 12 hours)
0 */12 * * * /path/to/automated-db-backups/backup.sh >> /var/log/mongo-backup.log 2>&1
```

## File Structure

```
automated-db-backups/
├── .github/
│   └── workflows/
│       └── backup.yml          # GitHub Actions workflow
├── backup.sh                   # Backup script
├── restore.sh                  # Restore script
├── .env.example                # Environment variables template
└── README.md                   # This file
```

## Troubleshooting

### Backup fails with "mongodump: not found"

Install MongoDB Database Tools:

```bash
# Ubuntu
sudo apt-get install -y mongodb-org-tools

# macOS
brew install mongodb-community@7.0
```

### Upload fails with "Access Denied"

Check your R2 API token permissions:
- Must have `Object Read` and `Object Write` permissions
- Token must be associated with the correct bucket

### Restore fails with "Connection refused"

Ensure MongoDB is running and accessible:

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```
