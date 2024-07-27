ALTER TABLE digger_run_queue_items DROP COLUMN digger_run_id;
ALTER TABLE digger_run_queue_items DROP COLUMN project_id;

ALTER TABLE digger_run_queue_items ADD COLUMN digger_run_id UUID;
ALTER TABLE digger_run_queue_items ADD COLUMN project_id UUID;






