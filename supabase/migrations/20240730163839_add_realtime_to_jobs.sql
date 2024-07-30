  ALTER PUBLICATION supabase_realtime ADD TABLE public.digger_jobs;

CREATE INDEX ON digger_jobs (batch_id);