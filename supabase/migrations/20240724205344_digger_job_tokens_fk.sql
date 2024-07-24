ALTER TABLE digger_job_tokens
ADD CONSTRAINT fk_jt_organisation_id
FOREIGN KEY (organisation_id) REFERENCES organizations(id);
