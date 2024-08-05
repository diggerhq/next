-- Rename the table
ALTER TABLE encrypted_env_vars RENAME TO env_vars;

-- Rename the column
ALTER TABLE env_vars RENAME COLUMN encrypted_value TO value;