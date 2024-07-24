ALTER TABLE digger_job_tokens
DROP COLUMN organisation_id;

ALTER TABLE digger_job_tokens
ADD COLUMN organisation_id UUID;

