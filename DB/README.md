# Database Setup

## PostgreSQL

### Prerequisites
- PostgreSQL 14+ installed and running

### Initial Setup

```bash
psql -U postgres -f init.sql
```

This will:
1. Create the `achievements_db` database
2. Create the `achievements` table
3. Add a trigger to auto-update `updated_at`
4. Insert sample data

### Connect
```bash
psql -U postgres -d achievements_db
```

### Reset (wipe and re-create)
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS achievements_db;"
psql -U postgres -f init.sql
```

## Schema

| Column        | Type         | Notes                        |
|---------------|--------------|------------------------------|
| id            | SERIAL PK    | Auto-increment               |
| title         | VARCHAR(255) | Required                     |
| description   | TEXT         | Optional                     |
| date          | DATE         | Required (YYYY-MM-DD)        |
| team_name     | VARCHAR(255) | Required                     |
| project_name  | VARCHAR(255) | Required                     |
| created_at    | TIMESTAMPTZ  | Set on insert                |
| updated_at    | TIMESTAMPTZ  | Auto-updated via trigger     |
