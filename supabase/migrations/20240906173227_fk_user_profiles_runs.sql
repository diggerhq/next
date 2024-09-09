-- First, drop the existing foreign key constraint
ALTER TABLE digger_runs
DROP CONSTRAINT IF EXISTS fk_triggered_by_user;

-- Then, modify the triggered_by_user_id column to match the data type of the id in user_profiles
-- Assuming the id in user_profiles is UUID. If it's different, adjust accordingly.
ALTER TABLE digger_runs
ALTER COLUMN triggered_by_user_id TYPE UUID;

-- Finally, add the new foreign key constraint referencing user_profiles
ALTER TABLE digger_runs
ADD CONSTRAINT fk_triggered_by_user
FOREIGN KEY (triggered_by_user_id)
REFERENCES user_profiles(id);