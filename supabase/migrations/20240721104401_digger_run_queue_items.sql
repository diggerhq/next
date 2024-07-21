CREATE TABLE public.digger_run_queue_items (
	id bigserial NOT NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	deleted_at timestamptz NULL,
	digger_run_id int8 NULL,
	project_id int8 NULL,
	CONSTRAINT digger_run_queue_items_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_digger_run_queue_items_deleted_at ON public.digger_run_queue_items USING btree (deleted_at);
CREATE INDEX idx_digger_run_queue_run_id ON public.digger_run_queue_items USING btree (digger_run_id);