drop index if exists "public"."idx_digger_runs_approval_status";

alter table "public"."digger_runs" drop column "approval_status";

drop type "public"."digger_run_approval_status";


