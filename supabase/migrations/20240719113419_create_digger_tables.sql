-- Create "digger_batches" table
CREATE TABLE IF NOT EXISTS "public"."digger_batches" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "pr_number" bigint,
  "status" smallint NOT NULL,
  "branch_name" text NOT NULL,
  "digger_config" text,
  "github_installation_id" bigint,
  "repo_full_name" text NOT NULL,
  "repo_owner" text NOT NULL,
  "repo_name" text NOT NULL,
  "batch_type" text NOT NULL,
  "comment_id" bigint,
  "source_details" bytea,
  "vcs" text,
  "gitlab_project_id" bigint,
  PRIMARY KEY ("id")
);

-- Create "digger_job_summaries" table
CREATE TABLE IF NOT EXISTS "public"."digger_job_summaries" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" timestamptz,
  "resources_created" bigint NOT NULL DEFAULT 0,
  "resources_deleted" bigint NOT NULL DEFAULT 0,
  "resources_updated" bigint NOT NULL DEFAULT 0,
  PRIMARY KEY ("id")
);

-- Create index "idx_digger_job_summaries_deleted_at" to table: "digger_job_summaries"
CREATE INDEX IF NOT EXISTS "idx_digger_job_summaries_deleted_at" ON "public"."digger_job_summaries" ("deleted_at");

-- Create "digger_jobs" table
CREATE TABLE IF NOT EXISTS "public"."digger_jobs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" timestamptz,
  "digger_job_id" text NOT NULL,
  "status" smallint NOT NULL,
  "batch_id" uuid NOT NULL,
  "status_updated_at" timestamptz,
  "digger_job_summary_id" uuid,
  "workflow_file" text,
  "workflow_run_url" text,
  "plan_footprint" bytea,
  "pr_comment_url" text,
  "terraform_output" text,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_digger_jobs_batch" FOREIGN KEY ("batch_id") REFERENCES "public"."digger_batches" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_digger_jobs_digger_job_summary" FOREIGN KEY ("digger_job_summary_id") REFERENCES "public"."digger_job_summaries" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

-- Create index "idx_digger_jobs_deleted_at" to table: "digger_jobs"
CREATE INDEX IF NOT EXISTS "idx_digger_jobs_deleted_at" ON "public"."digger_jobs" ("deleted_at");

-- Create index "idx_digger_job_id" to table: "digger_jobs"
CREATE INDEX IF NOT EXISTS "idx_digger_job_id" ON "public"."digger_jobs" ("batch_id");

-- Create "digger_locks" table
CREATE TABLE IF NOT EXISTS "public"."digger_locks" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" timestamptz,
  "resource" text NOT NULL,
  "lock_id" bigint NOT NULL,
  "organization_id" uuid NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_digger_locks_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

-- Create index "idx_digger_locked_resource" to table: "digger_locks"
CREATE INDEX IF NOT EXISTS "idx_digger_locked_resource" ON "public"."digger_locks" ("resource");

-- Create index "idx_digger_locks_deleted_at" to table: "digger_locks"
CREATE INDEX IF NOT EXISTS "idx_digger_locks_deleted_at" ON "public"."digger_locks" ("deleted_at");

-- Create "digger_run_stages" table
CREATE TABLE IF NOT EXISTS "public"."digger_run_stages" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" timestamptz,
  "batch_id" uuid NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_digger_run_stages_batch" FOREIGN KEY ("batch_id") REFERENCES "public"."digger_batches" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

-- Create index "idx_digger_run_stages_deleted_at" to table: "digger_run_stages"
CREATE INDEX IF NOT EXISTS "idx_digger_run_stages_deleted_at" ON "public"."digger_run_stages" ("deleted_at");

-- Create index "idx_digger_run_batch_id" to table: "digger_run_stages"
CREATE INDEX IF NOT EXISTS "idx_digger_run_batch_id" ON "public"."digger_run_stages" ("batch_id");

-- Create "digger_runs" table
CREATE TABLE IF NOT EXISTS "public"."digger_runs" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" timestamptz,
  "triggertype" text NOT NULL,
  "pr_number" bigint,
  "status" text NOT NULL,
  "commit_id" text NOT NULL,
  "digger_config" text,
  "github_installation_id" bigint,
  "repo_id" bigserial NOT NULL,
  "run_type" text NOT NULL,
  "plan_stage_id" uuid,
  "apply_stage_id" uuid,
  "project_name" text,
  "is_approved" boolean,
  "approval_author" text,
  "approval_date" timestamptz,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_digger_runs_repo" FOREIGN KEY ("repo_id") REFERENCES "public"."repos" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_digger_runs_plan_stage" FOREIGN KEY ("plan_stage_id") REFERENCES "public"."digger_run_stages" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "fk_digger_runs_apply_stage" FOREIGN KEY ("apply_stage_id") REFERENCES "public"."digger_run_stages" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

-- Create index "idx_digger_runs_deleted_at" to table: "digger_runs"
CREATE INDEX IF NOT EXISTS "idx_digger_runs_deleted_at" ON "public"."digger_runs" ("deleted_at");

-- Create "github_app_installation_links" table
CREATE TABLE IF NOT EXISTS "public"."github_app_installation_links" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" timestamptz,
  "github_installation_id" bigint NOT NULL,
  "organization_id" uuid NOT NULL,
  "status" smallint NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_github_app_installation_links_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

-- Create index "idx_github_app_installation_links_deleted_at" to table: "github_app_installation_links"
CREATE INDEX IF NOT EXISTS "idx_github_app_installation_links_deleted_at" ON "public"."github_app_installation_links" ("deleted_at");

-- Create index "idx_github_installation_org" to table: "github_app_installation_links"
CREATE INDEX IF NOT EXISTS "idx_github_installation_org" ON "public"."github_app_installation_links" ("github_installation_id", "organization_id");

-- Create "github_app_installations" table
CREATE TABLE IF NOT EXISTS "public"."github_app_installations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" timestamptz,
  "github_installation_id" bigint NOT NULL,
  "github_app_id" bigint NOT NULL,
  "account_id" bigint NOT NULL,
  "login" text NOT NULL,
  "repo" text,
  "status" bigint NOT NULL,
  PRIMARY KEY ("id")
);

-- Create index "idx_github_app_installations_deleted_at" to table: "github_app_installations"
CREATE INDEX IF NOT EXISTS "idx_github_app_installations_deleted_at" ON "public"."github_app_installations" ("deleted_at");

-- Create "github_apps" table
CREATE TABLE IF NOT EXISTS "public"."github_apps" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" timestamptz,
  "github_id" bigint NOT NULL,
  "name" text NOT NULL,
  "github_app_url" text NOT NULL,
  PRIMARY KEY ("id")
);

-- Create index "idx_github_apps_deleted_at" to table: "github_apps"
CREATE INDEX IF NOT EXISTS "idx_github_apps_deleted_at" ON "public"."github_apps" ("deleted_at");