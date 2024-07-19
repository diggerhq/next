CREATE TABLE "public"."repos" (
  "id" bigserial NOT NULL,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz,
  "deleted_at" timestamptz,
  "name" text,
  "organization_id" uuid,
  "digger_config" text,
  PRIMARY KEY ("id"),
  CONSTRAINT "fk_repos_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "idx_org_repo" to table: "repos"
CREATE UNIQUE INDEX "idx_org_repo" ON "public"."repos" ("name", "organization_id");
-- Create index "idx_repos_deleted_at" to table: "repos"
CREATE INDEX "idx_repos_deleted_at" ON "public"."repos" ("deleted_at");
-- Create "projects" table

ALTER TABLE "public"."projects" 
  ADD COLUMN "latest_action_on" text,
  ADD COLUMN "repo_id" bigserial,
  ADD COLUMN "configuration_yaml" text,
  ADD COLUMN "status" text,
  ADD COLUMN "is_generated" boolean,
  ADD COLUMN "is_in_main_branch" boolean,
  ADD COLUMN "deleted_at" timestamptz,
  ADD COLUMN "terraform_working_dir" text,
  ADD COLUMN "is_managing_state" boolean,
  ADD COLUMN "labels" text[];


ALTER TABLE "public"."projects"
  ADD CONSTRAINT "fk_projects_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE "public"."projects"
  ADD CONSTRAINT "fk_projects_repo" FOREIGN KEY ("repo_id") REFERENCES "public"."repos" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;