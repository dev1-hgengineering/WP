#!/usr/bin/env bash
# Manual database backup script
# Usage: ./DB/backup.sh [output_directory]
# Default output directory: DB/backups/

set -euo pipefail

DB_NAME="achievements_db"
DB_USER="${PGUSER:-postgres}"
DB_HOST="${PGHOST:-localhost}"
DB_PORT="${PGPORT:-5432}"

BACKUP_DIR="${1:-$(dirname "$0")/backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql"

mkdir -p "$BACKUP_DIR"

echo "Backing up '$DB_NAME' to $BACKUP_FILE ..."

pg_dump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --no-password \
  --format=plain \
  --clean \
  --if-exists \
  "$DB_NAME" > "$BACKUP_FILE"

echo "Backup complete: $BACKUP_FILE"

# Keep only the 10 most recent backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.sql 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 10 ]; then
  ls -1t "$BACKUP_DIR"/*.sql | tail -n +11 | xargs rm -f
  echo "Old backups pruned (kept latest 10)."
fi
