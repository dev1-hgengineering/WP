# Project: Office Work Tracker

## Purpose
Track professional achievements, manage initiatives with developer assignments and tasks, and monitor independent developer tasks — all as a senior engineer's personal work tracker.

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
├── MEMORY.md
├── README.md
├── DB/
│   ├── init.sql            ← full schema + sample data (fresh installs)
│   ├── migrate_v2.sql      ← added clusters/projects/developers (superseded)
│   ├── migrate_v3.sql      ← replaced clusters+projects+developer_progress with
│   │                          initiatives + initiative_developers + initiative_tasks + developer_tasks
│   ├── backup.sh / restore.sh
│   └── README.md
├── API/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── achievement.py
│   │   │   ├── developer.py
│   │   │   ├── initiative.py          ← Initiative + InitiativeDeveloper (join table)
│   │   │   ├── initiative_task.py
│   │   │   └── developer_task.py
│   │   ├── schemas/
│   │   │   ├── achievement.py
│   │   │   ├── developer.py
│   │   │   ├── initiative.py          ← includes DeveloperSummary, TaskCounts
│   │   │   ├── initiative_task.py
│   │   │   └── developer_task.py
│   │   ├── routers/
│   │   │   ├── achievements.py
│   │   │   ├── developers.py
│   │   │   ├── initiatives.py
│   │   │   ├── initiative_tasks.py
│   │   │   └── developer_tasks.py
│   │   └── services/
│   │       ├── achievement_service.py
│   │       ├── developer_service.py
│   │       ├── initiative_service.py
│   │       ├── initiative_task_service.py
│   │       └── developer_task_service.py
│   ├── requirements.txt
│   └── .env.example
└── UI/
    └── src/app/
        ├── app.component.ts        ← nav: Home, Achievements, Initiatives, Developers
        ├── app.routes.ts
        ├── core/services/
        │   ├── achievement.service.ts
        │   ├── developer.service.ts
        │   ├── initiative.service.ts
        │   ├── initiative-task.service.ts
        │   └── developer-task.service.ts
        ├── shared/models/
        │   ├── achievement.model.ts
        │   ├── developer.model.ts
        │   ├── initiative.model.ts
        │   ├── initiative-task.model.ts
        │   └── developer-task.model.ts
        └── pages/
            ├── home/
            ├── achievements/
            ├── initiatives/
            │   ├── initiatives.component.ts       ← cards: status, devs, task pills
            │   ├── initiative-form/               ← name, status, recurring toggle, dates
            │   ├── initiative-detail/             ← members panel + task table + quick status
            │   └── initiative-task-form/          ← developer select, recurring toggle
            └── developers/
                ├── developers.component.ts        ← cards with independent task lists
                ├── developer-form/
                └── developer-task-form/           ← compact inline form
```

---

## Database Schema

### `achievements`
Free-text project_name — not linked to initiatives (historical records).

### `developers`
| Column | Type |
|---|---|
| id | SERIAL PK |
| name | VARCHAR(255) UNIQUE |
| email | VARCHAR(255) nullable |

### `initiatives`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL PK | |
| name | VARCHAR(255) UNIQUE | |
| description | TEXT | |
| status | VARCHAR(50) | active / completed / on_hold / cancelled |
| is_recurring | BOOLEAN | |
| recurrence_pattern | VARCHAR(100) | e.g. weekly, daily — set when is_recurring=true |
| start_date | DATE | |
| end_date | DATE | NULL when recurring |

### `initiative_developers` (join table)
- initiative_id FK → initiatives (CASCADE)
- developer_id FK → developers (CASCADE)
- PRIMARY KEY (initiative_id, developer_id)

### `initiative_tasks`
| Column | Type | Notes |
|---|---|---|
| initiative_id | FK → initiatives | CASCADE |
| developer_id | FK → developers | CASCADE |
| title | VARCHAR(255) | |
| status | VARCHAR(50) | pending / in_progress / completed / blocked |
| is_recurring | BOOLEAN | |
| recurrence_pattern | VARCHAR(100) | when recurring |
| due_date | DATE | when one-off |

### `developer_tasks`
Same columns as initiative_tasks minus initiative_id. Independent per developer.

---

## API Endpoints (base: /api/v1)

| Method | Path | Notes |
|---|---|---|
| CRUD | `/achievements/` | + `/download` |
| CRUD | `/developers/` | |
| CRUD | `/initiatives/` | GET enriched with developers + task_counts |
| POST | `/initiatives/{id}/developers` | body: {developer_id} |
| DELETE | `/initiatives/{id}/developers/{dev_id}` | |
| CRUD + PATCH status | `/initiative-tasks/` | filter: ?initiative_id= ?developer_id= ?status= |
| CRUD + PATCH status | `/developer-tasks/` | filter: ?developer_id= ?status= |

---

## Key Design Decisions
- Initiative tasks can be assigned to ANY developer (not enforced to be a member). Membership is tracked separately via initiative_developers.
- `achievements.project_name` stays a free-text string — historical records should not break if initiatives are renamed/deleted.
- Task schedule is either: `is_recurring=true + recurrence_pattern` OR `is_recurring=false + due_date`. Both are nullable at DB level (no CHECK constraint) but validated in UI forms.
- `InitiativeResponse` embeds `developers[]` and `task_counts{}` to avoid N+1 fetches on the list page.

---

## Running Locally

| Step | Command |
|---|---|
| Fresh install | `psql -U postgres -f DB/init.sql` |
| Existing DB (v2→v3) | `psql -U postgres -d achievements_db -f DB/migrate_v3.sql` |
| API | `cd API && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000` |
| UI | `cd UI && ng serve` |

DB connection: `DATABASE_URL=postgresql://postgres:@localhost:5432/achievements_db`

## Backup & Restore
```bash
./DB/backup.sh                         # → DB/backups/<name>_<timestamp>.sql
./DB/restore.sh DB/backups/<file>.sql
```
