#!/bin/bash
set -euo pipefail

# =============================================================================
# MongoDB Restore Script
# Downloads the latest backup from Cloudflare R2 and restores the database
# =============================================================================

# Configuration from environment variables
MONGO_URI="${MONGO_URI:-mongodb://localhost:27017}"
MONGO_DB="${MONGO_DB:-myapp}"
R2_BUCKET="${R2_BUCKET:-db-backups}"
R2_ENDPOINT="${R2_ENDPOINT:-https://<account-id>.r2.cloudflarestorage.com}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}"

# Restore directory
RESTORE_DIR="/tmp/restores"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

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
    
    for cmd in mongorestore tar aws; do
        if ! command -v "$cmd" &> /dev/null; then
            error "$cmd is not installed. Please install it first."
        fi
    done
    
    if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
        error "AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set"
    fi
    
    log "All dependencies satisfied ✓"
}

# List available backups
list_backups() {
    log "Fetching available backups from R2..."
    
    export AWS_DEFAULT_REGION="auto"
    
    echo ""
    echo "Available backups:"
    echo "=================="
    
    aws s3 ls "s3://${R2_BUCKET}/backups/" \
        --endpoint-url "$R2_ENDPOINT" \
        --human-readable \
        | grep "tar.gz" \
        | sort -k2 -r \
        | head -20
    
    echo ""
}

# Download backup from R2
download_backup() {
    local backup_key="$1"
    
    mkdir -p "$RESTORE_DIR"
    
    local backup_file="${RESTORE_DIR}/$(basename "$backup_key")"
    
    log "Downloading backup: ${backup_key}"
    
    aws s3 cp \
        "s3://${R2_BUCKET}/${backup_key}" \
        "$backup_file" \
        --endpoint-url "$R2_ENDPOINT"
    
    if [ $? -ne 0 ]; then
        error "Download failed"
    fi
    
    log "Download completed: ${backup_file} ✓"
    echo "$backup_file"
}

# Extract backup
extract_backup() {
    local backup_file="$1"
    local extract_dir="${RESTORE_DIR}/extracted_${TIMESTAMP}"
    
    log "Extracting backup..."
    
    mkdir -p "$extract_dir"
    tar -xzf "$backup_file" -C "$extract_dir"
    
    if [ $? -ne 0 ]; then
        error "Extraction failed"
    fi
    
    log "Extraction completed ✓"
    echo "$extract_dir"
}

# Restore database
restore_database() {
    local extract_dir="$1"
    
    log "Restoring MongoDB database..."
    log "Database: ${MONGO_DB}"
    log "URI: ${MONGO_URI}"
    
    # Check if there's a gzip dump
    if ls "$extract_dir"/*/*.gz 1> /dev/null 2>&1; then
        # Restore from gzip dump
        mongorestore \
            --uri="$MONGO_URI" \
            --db="$MONGO_DB" \
            --gzip \
            --drop \
            "$extract_dir"
    else
        # Restore from regular dump
        mongorestore \
            --uri="$MONGO_URI" \
            --db="$MONGO_DB" \
            --drop \
            "$extract_dir"
    fi
    
    if [ $? -ne 0 ]; then
        error "Restore failed"
    fi
    
    log "Database restored successfully ✓"
}

# Cleanup
cleanup() {
    log "Cleaning up temporary files..."
    rm -rf "$RESTORE_DIR"
    log "Cleanup completed ✓"
}

# Restore the latest backup
restore_latest() {
    log "=========================================="
    log "Restoring Latest Backup"
    log "=========================================="
    
    export AWS_DEFAULT_REGION="auto"
    
    # Get the latest backup
    LATEST_KEY=$(aws s3 ls "s3://${R2_BUCKET}/backups/" \
        --endpoint-url "$R2_ENDPOINT" \
        | grep "tar.gz" \
        | sort -k2 -r \
        | head -1 \
        | awk '{print $4}')
    
    if [ -z "$LATEST_KEY" ]; then
        error "No backups found in R2"
    fi
    
    log "Latest backup: ${LATEST_KEY}"
    
    local backup_file
    backup_file=$(download_backup "backups/${LATEST_KEY}")
    
    local extract_dir
    extract_dir=$(extract_backup "$backup_file")
    
    restore_database "$extract_dir"
    cleanup
    
    log "=========================================="
    log "Restore completed successfully! 🎉"
    log "=========================================="
}

# Restore a specific backup
restore_specific() {
    local backup_name="$1"
    
    log "=========================================="
    log "Restoring Specific Backup: ${backup_name}"
    log "=========================================="
    
    local backup_file
    backup_file=$(download_backup "backups/${backup_name}")
    
    local extract_dir
    extract_dir=$(extract_backup "$backup_file")
    
    restore_database "$extract_dir"
    cleanup
    
    log "=========================================="
    log "Restore completed successfully! 🎉"
    log "=========================================="
}

# Main execution
main() {
    check_dependencies
    
    case "${1:-latest}" in
        latest)
            restore_latest
            ;;
        list)
            list_backups
            ;;
        restore)
            if [ -z "${2:-}" ]; then
                error "Please provide backup filename: ./restore.sh restore <backup-name.tar.gz>"
            fi
            restore_specific "$2"
            ;;
        *)
            echo "Usage: $0 {latest|list|restore <backup-name>}"
            echo ""
            echo "Commands:"
            echo "  latest              Restore the most recent backup"
            echo "  list                List available backups"
            echo "  restore <filename>  Restore a specific backup"
            exit 1
            ;;
    esac
}

main "$@"
