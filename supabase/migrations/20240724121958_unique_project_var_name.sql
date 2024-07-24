ALTER TABLE encrypted_env_vars 
ADD CONSTRAINT unique_project_var_name UNIQUE (project_id, name);