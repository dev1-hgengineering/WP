-- Migration v3: Replace clusters/projects/developer_progress with initiatives + tasks
-- Run against existing DB:
-- psql -U postgres -d achievements_db -f DB/migrate_v3.sql

-- Drop obsolete tables (order matters for FK constraints)
DROP TABLE IF EXISTS developer_progress;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS clusters;

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

-- Initiative <-> Developer  (many-to-many)
CREATE TABLE IF NOT EXISTS initiative_developers (
    initiative_id  INTEGER NOT NULL REFERENCES initiatives(id) ON DELETE CASCADE,
    developer_id   INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
    joined_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    PRIMARY KEY (initiative_id, developer_id)
);

CREATE INDEX IF NOT EXISTS idx_initdev_initiative ON initiative_developers(initiative_id);
CREATE INDEX IF NOT EXISTS idx_initdev_developer  ON initiative_developers(developer_id);

-- Initiative Tasks (tied to initiative + developer)
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

-- Developer Tasks (independent, per developer only)
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

-- Sample data
INSERT INTO initiatives (name, description, status, is_recurring, start_date, end_date) VALUES
    ('Platform Modernisation', 'Rewrite core services and migrate to new infrastructure', 'active', FALSE, '2026-01-01', '2026-06-30'),
    ('Weekly Code Reviews',    'Regular team code review sessions',                      'active', TRUE,  '2026-01-06', NULL);

UPDATE initiatives SET recurrence_pattern = 'weekly' WHERE name = 'Weekly Code Reviews';

INSERT INTO initiative_developers (initiative_id, developer_id)
SELECT i.id, d.id FROM initiatives i, developers d
WHERE i.name = 'Platform Modernisation';

INSERT INTO initiative_tasks (initiative_id, developer_id, title, status, is_recurring, due_date)
SELECT i.id, d.id, 'Set up CI pipeline', 'completed', FALSE, '2026-02-01'
FROM initiatives i, developers d WHERE i.name = 'Platform Modernisation' AND d.name = 'Alice Johnson';

INSERT INTO initiative_tasks (initiative_id, developer_id, title, status, is_recurring, recurrence_pattern)
SELECT i.id, d.id, 'Weekly sync notes', 'in_progress', TRUE, 'weekly'
FROM initiatives i, developers d WHERE i.name = 'Weekly Code Reviews' AND d.name = 'Bob Smith';

INSERT INTO developer_tasks (developer_id, title, status, is_recurring, due_date) VALUES
    ((SELECT id FROM developers WHERE name = 'Alice Johnson'), 'Update team wiki', 'pending', FALSE, '2026-04-30'),
    ((SELECT id FROM developers WHERE name = 'Bob Smith'),     'Complete Go training', 'in_progress', FALSE, '2026-05-15');

INSERT INTO developer_tasks (developer_id, title, status, is_recurring, recurrence_pattern) VALUES
    ((SELECT id FROM developers WHERE name = 'Carol White'), 'Daily standup notes', 'in_progress', TRUE, 'daily');
