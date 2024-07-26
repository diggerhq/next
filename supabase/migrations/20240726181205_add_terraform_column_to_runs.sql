ALTER TABLE "public"."digger_runs"
ADD COLUMN "terraform_output" text;

ALTER TABLE "public"."digger_runs"
ADD COLUMN "apply_logs" text;

ALTER TABLE "public"."digger_runs"
ADD COLUMN "approver_user_id" uuid NULL;