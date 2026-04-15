-- Migration v4: Add personal todo lists
-- psql -U postgres -d achievements_db -f DB/migrate_v4.sql

-- Recurring todos (repeating tasks, no due date)
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

-- Timeline todos (one-off tasks with a due date)
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

CREATE INDEX IF NOT EXISTS idx_timeline_due  ON timeline_todos(due_date);
CREATE INDEX IF NOT EXISTS idx_timeline_status ON timeline_todos(status);

CREATE TRIGGER set_updated_at_timeline_todos
    BEFORE UPDATE ON timeline_todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Daily todo lists (one list per calendar date)
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
INSERT INTO recurring_todos (title, recurrence_pattern, is_active) VALUES
    ('Review open PRs',       'daily',   TRUE),
    ('Weekly team sync prep', 'weekly',  TRUE),
    ('Monthly 1:1 notes',     'monthly', TRUE);

INSERT INTO timeline_todos (title, due_date, priority, status) VALUES
    ('Write Q2 self-review',       CURRENT_DATE + 7,  'high',   'pending'),
    ('Update architecture diagrams', CURRENT_DATE + 14, 'medium', 'pending'),
    ('Fix flaky integration test',  CURRENT_DATE - 1,  'high',   'in_progress');

INSERT INTO daily_lists (date) VALUES (CURRENT_DATE);

INSERT INTO daily_tasks (list_id, title, sort_order) VALUES
    (1, 'Check monitoring dashboards', 1),
    (1, 'Respond to Slack threads',    2),
    (1, 'Review overnight CI runs',    3);
