# Project: Office Work Tracker

## Purpose
Track and showcase professional achievements over the years. Records are organised by project and team, and can be exported as a plain-text file.

---

## Stack

| Layer    | Technology                          | Location |
|----------|-------------------------------------|----------|
| Frontend | Angular 17 (standalone components)  | `UI/`    |
| Backend  | Python 3.11+ / FastAPI + SQLAlchemy | `API/`   |
| Database | PostgreSQL 14+                      | `DB/`    |

---

## Project Structure

```
WP/
├── MEMORY.md              ← this file
├── README.md              ← setup and usage guide
├── DB/
│   ├── init.sql           ← creates DB, table, trigger, sample data
│   ├── backup.sh          ← manual backup script
│   ├── restore.sh         ← restore from a backup file
│   ├── .gitignore         ← excludes DB/backups/
│   └── README.md
├── API/
│   ├── app/
│   │   ├── main.py        ← FastAPI app, CORS, router registration
│   │   ├── database.py    ← SQLAlchemy engine + session + Base
│   │   ├── models/
│   │   │   └── achievement.py   ← ORM model
│   │   ├── schemas/
│   │   │   └── achievement.py   ← Pydantic request/response schemas
│   │   ├── routers/
│   │   │   └── achievements.py  ← all HTTP endpoints
│   │   └── services/
│   │       └── achievement_service.py  ← business logic + txt formatter
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore         ← excludes .env, venv, __pycache__
└── UI/
    ├── src/
    │   ├── main.ts                        ← bootstrap (provideRouter, provideHttpClient)
    │   ├── styles.css                     ← global CSS variables and base styles
    │   ├── environments/
    │   │   ├── environment.ts             ← apiBaseUrl: http://localhost:8000/api/v1
    │   │   └── environment.prod.ts        ← apiBaseUrl: /api/v1
    │   └── app/
    │       ├── app.component.ts           ← nav shell + router-outlet
    │       ├── app.routes.ts              ← / → Home, /achievements → Achievements
    │       ├── core/services/
    │       │   └── achievement.service.ts ← all HTTP calls + downloadTxt()
    │       ├── shared/models/
    │       │   └── achievement.model.ts   ← Achievement and AchievementPayload interfaces
    │       └── pages/
    │           ├── home/
    │           │   └── home.component.ts  ← landing page with nav card
    │           └── achievements/
    │               ├── achievements.component.ts       ← list, delete, download
    │               └── achievement-form/
    │                   └── achievement-form.component.ts ← add/edit reactive form
    ├── angular.json
    ├── package.json
    ├── tsconfig.json
    └── .gitignore         ← excludes node_modules, dist, .angular
```

---

## Database Schema

**Table: `achievements`**

| Column        | Type         | Notes                         |
|---------------|--------------|-------------------------------|
| id            | SERIAL PK    | Auto-increment                |
| title         | VARCHAR(255) | Required                      |
| description   | TEXT         | Optional                      |
| date          | DATE         | Required (YYYY-MM-DD)         |
| team_name     | VARCHAR(255) | Required                      |
| project_name  | VARCHAR(255) | Required                      |
| created_at    | TIMESTAMPTZ  | Set on insert                 |
| updated_at    | TIMESTAMPTZ  | Auto-updated via DB trigger   |

---

## API Endpoints

Base URL: `http://localhost:8000/api/v1`

| Method | Path                       | Description                   |
|--------|----------------------------|-------------------------------|
| GET    | `/achievements/`           | List all (sorted date desc)   |
| POST   | `/achievements/`           | Create a new achievement      |
| PUT    | `/achievements/{id}`       | Update an achievement         |
| DELETE | `/achievements/{id}`       | Delete an achievement         |
| GET    | `/achievements/download`   | Download all as `.txt` file   |
| GET    | `/health`                  | Health check                  |

> The `/download` route is registered before `/{id}` to prevent FastAPI treating "download" as an id parameter.

---

## Environment Variables

`API/.env` (not committed — copy from `.env.example`):

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/achievements_db
```

Scripts also respect `PGUSER`, `PGHOST`, `PGPORT` env vars.

---

## Running Locally

| Step | Command |
|------|---------|
| 1. Database (once) | `psql -U postgres -f DB/init.sql` |
| 2. API | `cd API && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000` |
| 3. UI | `cd UI && ng serve` |

- UI: http://localhost:4200
- API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

---

## Database Backup & Restore

```bash
# Create a backup → saved to DB/backups/achievements_db_<timestamp>.sql
./DB/backup.sh

# Custom output directory
./DB/backup.sh /path/to/backups

# Restore (prompts for confirmation)
./DB/restore.sh DB/backups/achievements_db_20260414_143000.sql

# List available backups
./DB/restore.sh
```

- Retains the 10 most recent backups automatically
- `DB/backups/` is git-ignored

---

## Features

- List all achievements sorted by date (newest first)
- Add achievements with title, date, team name, project name, description
- Edit any achievement inline
- Delete with confirmation prompt
- Download all achievements as a formatted `.txt` file
- Manual database backup and restore via shell scripts
