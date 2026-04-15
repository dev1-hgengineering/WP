-- Migration v2: Add clusters, projects, developers, developer_progress
-- Run against an existing achievements_db:
-- psql -U postgres -d achievements_db -f DB/migrate_v2.sql

-- Clusters
CREATE TABLE IF NOT EXISTS clusters (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_updated_at_clusters
    BEFORE UPDATE ON clusters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id          SERIAL PRIMARY KEY,
    cluster_id  INTEGER NOT NULL REFERENCES clusters(id) ON DELETE RESTRICT,
    name        VARCHAR(255) NOT NULL,
    team_name   VARCHAR(255),
    description TEXT,
    status      VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (cluster_id, name)
);

CREATE TRIGGER set_updated_at_projects
    BEFORE UPDATE ON projects
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

-- Developer Progress
CREATE TABLE IF NOT EXISTS developer_progress (
    id           SERIAL PRIMARY KEY,
    developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
    project_id   INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status       VARCHAR(50) NOT NULL DEFAULT 'in_progress',
    milestone    VARCHAR(255),
    notes        TEXT,
    date         DATE NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dev_progress_developer ON developer_progress(developer_id);
CREATE INDEX IF NOT EXISTS idx_dev_progress_project   ON developer_progress(project_id);

CREATE TRIGGER set_updated_at_developer_progress
    BEFORE UPDATE ON developer_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data
INSERT INTO clusters (name, description) VALUES
    ('Platform Modernisation', 'Initiatives to modernise core platform infrastructure'),
    ('Developer Experience', 'Tools and processes to improve engineering productivity')
ON CONFLICT DO NOTHING;

INSERT INTO projects (cluster_id, name, team_name, description, status) VALUES
    (1, 'Project Alpha', 'Platform', 'Core API rewrite', 'active'),
    (1, 'Project Beta',  'Platform', 'Data pipeline upgrade', 'active'),
    (2, 'Internal Tooling', 'DevOps', 'CI/CD improvements', 'completed')
ON CONFLICT DO NOTHING;

INSERT INTO developers (name, email) VALUES
    ('Alice Johnson', 'alice@example.com'),
    ('Bob Smith',     'bob@example.com'),
    ('Carol White',   'carol@example.com')
ON CONFLICT DO NOTHING;
