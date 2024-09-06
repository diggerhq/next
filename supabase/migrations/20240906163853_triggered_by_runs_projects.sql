-- Drop the existing triggered_by_user_id column if it exists
ALTER TABLE projects
DROP COLUMN IF EXISTS triggered_by_user_id;

-- Add triggered_by_user_id column to projects table as UUID
ALTER TABLE digger_runs
ADD COLUMN triggered_by_user_id UUID;

-- Add foreign key constraint
ALTER TABLE digger_runs
ADD CONSTRAINT fk_triggered_by_user
FOREIGN KEY (triggered_by_user_id)
REFERENCES auth.users(id);