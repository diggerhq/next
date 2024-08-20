alter table public.projects
add column if not exists is_drift_detection_enabled boolean,
add column if not exists drift_crontab text;