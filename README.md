# Office Work Tracker

A full-stack application for recording and managing professional achievements.

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | Angular 17 (standalone components)|
| Backend  | Python 3.11+ / FastAPI            |
| Database | PostgreSQL 14+                    |

---

## Prerequisites

Make sure the following are installed before proceeding:

- [Node.js 18+](https://nodejs.org/) and npm
- [Angular CLI](https://angular.io/cli): `npm install -g @angular/cli`
- [Python 3.11+](https://www.python.org/downloads/)
- [PostgreSQL 14+](https://www.postgresql.org/download/) running locally

---

## Project Structure

```
WP/
├── DB/       PostgreSQL schema and seed data
├── API/      Python FastAPI backend
└── UI/       Angular frontend
```

---

## 1. Database Setup

Connect to PostgreSQL as a superuser and run the init script:

```bash
psql -U postgres -f DB/init.sql
```

This will:
- Create the `achievements_db` database
- Create the `achievements` table
- Add an `updated_at` auto-update trigger
- Insert three sample rows

To reset the database at any time:

```bash
psql -U postgres -c "DROP DATABASE IF EXISTS achievements_db;"
psql -U postgres -f DB/init.sql
```

---

## 2. API Setup

```bash
cd API
```

### Create and activate a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate      # macOS / Linux
.venv\Scripts\activate         # Windows
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and update the connection string to match your PostgreSQL credentials:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/achievements_db
```

### Start the API server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

Interactive API docs (Swagger UI): `http://localhost:8000/docs`

---

## 3. UI Setup

```bash
cd UI
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
ng serve
```

The app will be available at `http://localhost:4200`.

---

## Running the Full Application

Start all three in separate terminal tabs:

| Terminal | Command                                              |
|----------|------------------------------------------------------|
| 1        | `psql -U postgres -f DB/init.sql` (once only)        |
| 2        | `cd API && uvicorn app.main:app --reload --port 8000`|
| 3        | `cd UI && ng serve`                                  |

Then open `http://localhost:4200` in your browser.

---

## API Endpoints

Base URL: `http://localhost:8000/api/v1`

| Method | Path                        | Description                     |
|--------|-----------------------------|---------------------------------|
| GET    | `/achievements/`            | List all achievements           |
| POST   | `/achievements/`            | Create a new achievement        |
| PUT    | `/achievements/{id}`        | Update an achievement           |
| DELETE | `/achievements/{id}`        | Delete an achievement           |
| GET    | `/achievements/download`    | Download all as a `.txt` file   |
| GET    | `/health`                   | Health check                    |

### Achievement fields

| Field          | Type   | Required | Description                  |
|----------------|--------|----------|------------------------------|
| `title`        | string | Yes      | Short title of the achievement|
| `date`         | date   | Yes      | Date achieved (YYYY-MM-DD)   |
| `team_name`    | string | Yes      | Team responsible             |
| `project_name` | string | Yes      | Project it belongs to        |
| `description`  | string | No       | Longer description           |

---

## Database Backup & Restore

Backup and restore scripts live in `DB/`. Backups are saved as plain SQL files under `DB/backups/` (excluded from git).

### Create a backup

```bash
./DB/backup.sh
```

This dumps the full `achievements_db` to a timestamped file:

```
DB/backups/achievements_db_20260414_143000.sql
```

The script automatically keeps only the 10 most recent backups and deletes older ones.

**Custom output directory:**

```bash
./DB/backup.sh /path/to/my/backups
```

**Override PostgreSQL connection settings via environment variables:**

```bash
PGUSER=myuser PGHOST=myhost PGPORT=5433 ./DB/backup.sh
```

### Restore from a backup

```bash
./DB/restore.sh DB/backups/achievements_db_20260414_143000.sql
```

You will be prompted to confirm before any data is overwritten.

To see all available backups, run the script without arguments:

```bash
./DB/restore.sh
```

> **Note:** On macOS/Linux the scripts are ready to run. On Windows, use Git Bash or WSL.

---

## Features

- **List** all achievements sorted by date (newest first)
- **Add** new achievements with title, date, team, project, and description
- **Edit** any achievement inline
- **Delete** achievements with a confirmation prompt
- **Download** all achievements as a formatted `.txt` file

## Installing DB
```bash
brew install postgresql
brew services start postgresql
createuser -s postgres  
psql -U postgres
createuser -s postgres -U chanukaelvitigala
```

## Useful Commands
```bash
lsof -ti :8000 | xargs kill -9   
```