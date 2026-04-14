#!/usr/bin/env bash
# Restore database from a backup file
# Usage: ./DB/restore.sh <backup_file.sql>

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup_file.sql>"
  echo ""
  echo "Available backups:"
  ls -1t "$(dirname "$0")/backups/"*.sql 2>/dev/null || echo "  (none found)"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: file not found: $BACKUP_FILE"
  exit 1
fi

DB_NAME="achievements_db"
DB_USER="${PGUSER:-postgres}"
DB_HOST="${PGHOST:-localhost}"
DB_PORT="${PGPORT:-5432}"

echo "WARNING: This will overwrite all data in '$DB_NAME'."
read -r -p "Continue? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo "Restoring '$DB_NAME' from $BACKUP_FILE ..."

psql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --username="$DB_USER" \
  --no-password \
  --dbname="$DB_NAME" \
  --file="$BACKUP_FILE"

echo "Restore complete."
