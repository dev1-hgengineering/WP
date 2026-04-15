-- Run this script once to set up the database
-- Usage: psql -U postgres -f DB/init.sql

CREATE DATABASE achievements_db;

\c achievements_db;

-- Shared trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(255)             NOT NULL,
    description  TEXT,
    date         DATE                     NOT NULL,
    team_name    VARCHAR(255)             NOT NULL,
    project_name VARCHAR(255)             NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON achievements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Developers
CREATE TABLE IF NOT EXISTS developers (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL UNIQUE,
    email      VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_developers
    BEFORE UPDATE ON developers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initiatives
CREATE TABLE IF NOT EXISTS initiatives (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL UNIQUE,
    description         TEXT,
    status              VARCHAR(50)  NOT NULL DEFAULT 'active',
    is_recurring        BOOLEAN      NOT NULL DEFAULT FALSE,
    recurrence_pattern  VARCHAR(100),
    start_date          DATE,
    end_date            DATE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_initiatives
    BEFORE UPDATE ON initiatives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initiative <-> Developer (many-to-many)
CREATE TABLE IF NOT EXISTS initiative_developers (
    initiative_id  INTEGER NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
    developer_id   INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
    joined_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (initiative_id, developer_id)
);

CREATE INDEX IF NOT EXISTS idx_initdev_initiative ON initiative_developers(initiative_id);
CREATE INDEX IF NOT EXISTS idx_initdev_developer  ON initiative_developers(developer_id);

-- Initiative Tasks
CREATE TABLE IF NOT EXISTS initiative_tasks (
    id                  SERIAL PRIMARY KEY,
    initiative_id       INTEGER NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
    developer_id        INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    status              VARCHAR(50)  NOT NULL DEFAULT 'pending',
    is_recurring        BOOLEAN      NOT NULL DEFAULT FALSE,
    recurrence_pattern  VARCHAR(100),
    due_date            DATE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_itask_initiative ON initiative_tasks(initiative_id);
CREATE INDEX IF NOT EXISTS idx_itask_developer  ON initiative_tasks(developer_id);

CREATE TRIGGER set_updated_at_initiative_tasks
    BEFORE UPDATE ON initiative_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Developer Tasks (independent)
CREATE TABLE IF NOT EXISTS developer_tasks (
    id                  SERIAL PRIMARY KEY,
    developer_id        INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    status              VARCHAR(50)  NOT NULL DEFAULT 'pending',
    is_recurring        BOOLEAN      NOT NULL DEFAULT FALSE,
    recurrence_pattern  VARCHAR(100),
    due_date            DATE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dtask_developer ON developer_tasks(developer_id);

CREATE TRIGGER set_updated_at_developer_tasks
    BEFORE UPDATE ON developer_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Recurring todos
CREATE TABLE IF NOT EXISTS recurring_todos (
    id                  SERIAL PRIMARY KEY,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    recurrence_pattern  VARCHAR(100) NOT NULL,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_recurring_todos
    BEFORE UPDATE ON recurring_todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Timeline todos
CREATE TABLE IF NOT EXISTS timeline_todos (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    due_date    DATE         NOT NULL,
    priority    VARCHAR(20)  NOT NULL DEFAULT 'medium',
    status      VARCHAR(50)  NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_timeline_due    ON timeline_todos(due_date);
CREATE INDEX IF NOT EXISTS idx_timeline_status ON timeline_todos(status);

CREATE TRIGGER set_updated_at_timeline_todos
    BEFORE UPDATE ON timeline_todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Daily todo lists
CREATE TABLE IF NOT EXISTS daily_lists (
    id         SERIAL PRIMARY KEY,
    date       DATE NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tasks within a daily list
CREATE TABLE IF NOT EXISTS daily_tasks (
    id         SERIAL PRIMARY KEY,
    list_id    INTEGER      NOT NULL REFERENCES daily_lists(id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    is_done    BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order INTEGER      NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_tasks_list ON daily_tasks(list_id);

CREATE TRIGGER set_updated_at_daily_tasks
    BEFORE UPDATE ON daily_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data
INSERT INTO achievements (title, description, date, team_name, project_name) VALUES
    ('Launched v2.0', 'Successfully delivered the v2.0 release on schedule with zero downtime.', '2025-03-15', 'Platform', 'Platform Modernisation'),
    ('Reduced build time by 40%', 'Optimized CI pipeline reducing average build time from 25 min to 15 min.', '2025-06-01', 'DevOps', 'Internal Tooling'),
    ('Onboarded 3 new engineers', 'Created onboarding runbooks and mentored three new team members.', '2025-09-10', 'Platform', 'Team Growth');

INSERT INTO developers (name, email) VALUES
    ('Alice Johnson', 'alice@example.com'),
    ('Bob Smith',     'bob@example.com'),
    ('Carol White',   'carol@example.com');

INSERT INTO initiatives (name, description, status, is_recurring, start_date, end_date) VALUES
    ('Platform Modernisation', 'Rewrite core services and migrate to new infrastructure', 'active', FALSE, '2026-01-01', '2026-06-30'),
    ('Weekly Code Reviews',    'Regular team code review sessions',                      'active', TRUE,  '2026-01-06', NULL);

UPDATE initiatives SET recurrence_pattern = 'weekly' WHERE name = 'Weekly Code Reviews';

INSERT INTO initiative_developers (initiative_id, developer_id)
SELECT i.id, d.id FROM initiatives i, developers d WHERE i.name = 'Platform Modernisation';

INSERT INTO initiative_tasks (initiative_id, developer_id, title, status, is_recurring, due_date)
SELECT i.id, d.id, 'Set up CI pipeline', 'completed', FALSE, '2026-02-01'
FROM initiatives i, developers d WHERE i.name = 'Platform Modernisation' AND d.name = 'Alice Johnson';

INSERT INTO initiative_tasks (initiative_id, developer_id, title, status, is_recurring, recurrence_pattern)
SELECT i.id, d.id, 'Weekly sync notes', 'in_progress', TRUE, 'weekly'
FROM initiatives i, developers d WHERE i.name = 'Weekly Code Reviews' AND d.name = 'Bob Smith';

INSERT INTO developer_tasks (developer_id, title, status, is_recurring, due_date) VALUES
    ((SELECT id FROM developers WHERE name = 'Alice Johnson'), 'Update team wiki',    'pending',     FALSE, '2026-04-30'),
    ((SELECT id FROM developers WHERE name = 'Bob Smith'),     'Complete Go training','in_progress', FALSE, '2026-05-15');

INSERT INTO developer_tasks (developer_id, title, status, is_recurring, recurrence_pattern) VALUES
    ((SELECT id FROM developers WHERE name = 'Carol White'), 'Daily standup notes', 'in_progress', TRUE, 'daily');
