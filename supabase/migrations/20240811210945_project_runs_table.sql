CREATE TABLE public.project_runs (
	id uuid NOT NULL,
	created_at timestamptz NULL,
	updated_at timestamptz NULL,
	deleted_at timestamptz NULL,
	project_id uuid NULL,
	started_at int8 NULL,
	ended_at int8 NULL,
	status text NULL,
	command text NULL,
	"output" text NULL,
	actor_username text NULL,
	CONSTRAINT project_runs_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_project_runs_deleted_at ON public.project_runs USING btree (deleted_at);


-- public.project_runs foreign keys

ALTER TABLE public.project_runs ADD CONSTRAINT fk_project_runs_project FOREIGN KEY (project_id) REFERENCES public.projects(id);
