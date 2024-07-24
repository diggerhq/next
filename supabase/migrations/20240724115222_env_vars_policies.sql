ALTER TABLE encrypted_env_vars ENABLE ROW LEVEL SECURITY;

-- Revoke all privileges on the encrypted_value column
REVOKE ALL ON encrypted_env_vars FROM PUBLIC;

-- Grant SELECT on non-secret rows
CREATE POLICY "Allow select on non-secret vars" ON encrypted_env_vars
FOR SELECT USING (auth.uid() = project_id AND NOT is_secret);

-- Grant INSERT to authenticated users
CREATE POLICY "Allow insert for authenticated users" ON encrypted_env_vars
FOR INSERT TO authenticated WITH CHECK (auth.uid() = project_id);

-- Grant UPDATE to authenticated users for non-encrypted_value columns
CREATE POLICY "Allow update for authenticated users (non-encrypted)" ON encrypted_env_vars
FOR UPDATE TO authenticated
USING (auth.uid() = project_id)
WITH CHECK (auth.uid() = project_id);

-- Grant UPDATE to authenticated users for encrypted_value column only when not secret
CREATE POLICY "Allow update encrypted_value for non-secret vars" ON encrypted_env_vars
FOR UPDATE TO authenticated
USING (auth.uid() = project_id AND NOT is_secret)
WITH CHECK (auth.uid() = project_id AND NOT is_secret);

-- Grant DELETE to authenticated users
CREATE POLICY "Allow delete for authenticated users" ON encrypted_env_vars
FOR DELETE TO authenticated USING (auth.uid() = project_id);

