ALTER TABLE public.project_runs ADD column org_id uuid;

ALTER TABLE public.project_runs ADD CONSTRAINT fk_project_runs_orgid FOREIGN KEY (org_id) REFERENCES public.organizations(id);

