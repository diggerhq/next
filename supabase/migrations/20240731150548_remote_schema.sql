CREATE UNIQUE INDEX teams_pkey ON public.teams USING btree (id);

alter table "public"."teams" add constraint "teams_pkey" PRIMARY KEY using index "teams_pkey";

alter table "public"."projects" add constraint "projects_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."projects" validate constraint "projects_team_id_fkey";


