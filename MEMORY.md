# Project: Office Work Tracker

## Stack
- **UI/** — Angular frontend (standalone components)
- **API/** — Python FastAPI backend
- **DB/**  — PostgreSQL schema and migration scripts

## Features
- **Achievements** — list, add, edit, delete, download as .txt
  - Fields: title, description, date, team name, project name

## Running Locally
1. **Database**: `psql -U postgres -f DB/init.sql`
2. **API**: `cd API && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000`
3. **UI**: `cd UI && npm install && ng serve`

UI runs on http://localhost:4200, API on http://localhost:8000

## Environment
Copy `API/.env.example` to `API/.env` and fill in your DB credentials.
