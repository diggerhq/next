ALTER TABLE projects
ADD COLUMN latest_drift_output TEXT DEFAULT NULL;


ALTER TABLE digger_jobs
ADD COLUMN is_drift_job BOOLEAN DEFAULT FALSE;