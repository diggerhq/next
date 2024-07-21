-- public.digger_job_parent_links definition

-- Drop table

DROP TABLE public.digger_job_parent_links;

CREATE TABLE public.digger_job_parent_links (
	id bigserial NOT NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	deleted_at timestamptz NULL,
	digger_job_id text NULL,
	parent_digger_job_id text NULL,
	CONSTRAINT digger_job_parent_links_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_digger_job_parent_links_deleted_at ON public.digger_job_parent_links USING btree (deleted_at);