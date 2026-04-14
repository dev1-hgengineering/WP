-- Run this script once to set up the database
-- Usage: psql -U postgres -f DB/init.sql

CREATE DATABASE achievements_db;

\c achievements_db;

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

-- Trigger to auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON achievements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Sample data
INSERT INTO achievements (title, description, date, team_name, project_name) VALUES
    ('Launched v2.0', 'Successfully delivered the v2.0 release on schedule with zero downtime.', '2025-03-15', 'Platform', 'Project Alpha'),
    ('Reduced build time by 40%', 'Optimized CI pipeline reducing average build time from 25 min to 15 min.', '2025-06-01', 'DevOps', 'Internal Tooling'),
    ('Onboarded 3 new engineers', 'Created onboarding runbooks and mentored three new team members.', '2025-09-10', 'Platform', 'Team Growth');
