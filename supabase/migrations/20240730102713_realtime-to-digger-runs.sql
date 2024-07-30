  ALTER PUBLICATION supabase_realtime ADD TABLE public.digger_runs;
  ALTER TABLE public.digger_runs REPLICA IDENTITY FULL;

CREATE INDEX ON digger_runs (project_id);