CREATE TABLE project_tfvars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    tfvars JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE project_tfvars ADD CONSTRAINT project_tfvars_project_id_key UNIQUE (project_id);

 ALTER TABLE project_tfvars DROP COLUMN created_at;