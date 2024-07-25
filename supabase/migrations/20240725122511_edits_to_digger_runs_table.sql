-- 20240725000000_add_project_id_to_digger_runs.sql

-- Add project_id column to digger_runs table
ALTER TABLE "public"."digger_runs"
ADD COLUMN "project_id" uuid;

-- Add foreign key constraint
ALTER TABLE "public"."digger_runs"
ADD CONSTRAINT "fk_digger_runs_project" 
FOREIGN KEY ("project_id") 
REFERENCES "public"."projects" ("id") 
ON DELETE SET NULL;

-- Create index for project_id
CREATE INDEX "idx_digger_runs_project_id" ON "public"."digger_runs" ("project_id");