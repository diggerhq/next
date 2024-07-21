CREATE TABLE public.digger_job_parent_links (
	id uuid not null default gen_random_uuid (),
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	deleted_at timestamptz NULL,
	github_installation_id int8 NULL,
	github_app_id int8 NULL,
	account_id int8 NULL,
	login text NULL,
	repo text NULL,
	status int8 NULL,
	CONSTRAINT digger_job_parent_links_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_digger_job_parent_links_deleted_at ON public.digger_job_parent_links USING btree (deleted_at);