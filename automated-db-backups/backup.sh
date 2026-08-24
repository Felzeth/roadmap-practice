#!/bin/bash
set -euo pipefail

# =============================================================================
# MongoDB Backup Script
# Dumps the database and uploads the backup to Cloudflare R2
# =============================================================================

# Configuration from environment variables
MONGO_URI="${MONGO_URI:-mongodb://localhost:27017}"
MONGO_DB="${MONGO_DB:-myapp}"
R2_BUCKET="${R2_BUCKET:-db-backups}"
R2_ENDPOINT="${R2_ENDPOINT:-https://<account-id>.r2.cloudflarestorage.com}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Generate timestamp for backup filename
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_NAME="${MONGO_DB}_${TIMESTAMP}"
BACKUP_DIR="/tmp/backups"
BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
    exit 1
}

# Check required tools
check_dependencies() {
    log "Checking dependencies..."
    
    for cmd in mongodump tar aws; do
        if ! command -v "$cmd" &> /dev/null; then
            error "$cmd is not installed. Please install it first."
        fi
    done
    
    # Check required environment variables
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        error "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set"
    fi
    
    log "All dependencies satisfied ✓"
}

# Create backup directory
setup() {
    log "Setting up backup directory..."
    mkdir -p "$BACKUP_DIR"
}

# Dump MongoDB database
dump_database() {
    log "Starting MongoDB dump..."
    log "Database: ${MONGO_DB}"
    log "URI: ${MONGO_URI}"
    
    # Create the dump
    mongodump \
        --uri="$MONGO_URI" \
        --db="$MONGO_DB" \
        --out="$BACKUP_DIR/$BACKUP_NAME" \
        --gzip \
        2>&1 | tail -5
    
    if [ $? -ne 0 ]; then
        error "mongodump failed"
    fi
    
    log "MongoDB dump completed ✓"
}

# Compress the backup into a tarball
compress_backup() {
    log "Compressing backup..."
    
    cd "$BACKUP_DIR"
    tar -czf "$BACKUP_FILE" "$BACKUP_NAME"
    
    if [ $? -ne 0 ]; then
        error "Compression failed"
    fi
    
    # Get file size
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    log "Backup compressed: ${BACKUP_FILE} (${FILE_SIZE}) ✓"
}

# Upload to Cloudflare R2
upload_to_r2() {
    log "Uploading backup to Cloudflare R2..."
    log "Bucket: ${R2_BUCKET}"
    log "Key: backups/${BACKUP_NAME}.tar.gz"
    
    # Configure AWS CLI for R2
    export AWS_DEFAULT_REGION="auto"
    
    aws s3 cp \
        "$BACKUP_FILE" \
        "s3://${R2_BUCKET}/backups/${BACKUP_NAME}.tar.gz" \
        --endpoint-url "$R2_ENDPOINT" \
        --storage-class STANDARD \
        2>&1 | tail -3
    
    if [ $? -ne 0 ]; then
        error "Upload to R2 failed"
    fi
    
    log "Upload completed ✓"
}

# Clean up old backups from R2
cleanup_old_backups() {
    log "Cleaning up backups older than ${BACKUP_RETENTION_DAYS} days..."
    
    CUTOFF_DATE=$(date -d "${BACKUP_RETENTION_DAYS} days ago" +%Y-%m-%d 2>/dev/null || \
                  date -v-${BACKUP_RETENTION_DAYS}d +%Y-%m-%d 2>/dev/null || \
                  echo "")
    
    if [ -z "$CUTOFF_DATE" ]; then
        warn "Could not calculate cutoff date, skipping cleanup"
        return
    fi
    
    # List and delete old backups
    aws s3 ls "s3://${R2_BUCKET}/backups/" \
        --endpoint-url "$R2_ENDPOINT" \
        | while read -r line; do
            # Extract date from filename (format: myapp_2024-01-15_12-00-00.tar.gz)
            FILE_DATE=$(echo "$line" | grep -oP '\d{4}-\d{2}-\d{2}' | head -1)
            FILE_NAME=$(echo "$line" | awk '{print $4}')
            
            if [ -n "$FILE_DATE" ] && [ -n "$FILE_NAME" ]; then
                if [[ "$FILE_DATE" < "$CUTOFF_DATE" ]]; then
                    log "Deleting old backup: $FILE_NAME"
                    aws s3 rm "s3://${R2_BUCKET}/backups/${FILE_NAME}" \
                        --endpoint-url "$R2_ENDPOINT"
                fi
            fi
        done
    
    log "Cleanup completed ✓"
}

# Clean up local files
cleanup_local() {
    log "Cleaning up local backup files..."
    rm -rf "$BACKUP_DIR/$BACKUP_NAME"
    rm -f "$BACKUP_FILE"
    log "Local cleanup completed ✓"
}

# Main execution
main() {
    log "=========================================="
    log "Starting MongoDB Backup Process"
    log "=========================================="
    
    check_dependencies
    setup
    dump_database
    compress_backup
    upload_to_r2
    cleanup_old_backups
    cleanup_local
    
    log "=========================================="
    log "Backup completed successfully! 🎉"
    log "=========================================="
}

# Run main function
main "$@"
