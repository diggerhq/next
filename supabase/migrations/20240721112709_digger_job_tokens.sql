CREATE TABLE public.digger_job_tokens (
	id bigserial NOT NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	deleted_at timestamptz NULL,
	value text NULL,
	expiry timestamptz NULL,
	organisation_id int8 NULL,
	"type" text NULL,
	CONSTRAINT job_tokens_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_job_tokens_deleted_at ON public.digger_job_tokens USING btree (deleted_at);