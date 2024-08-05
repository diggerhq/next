CREATE UNIQUE INDEX team_members_pkey ON public.team_members USING btree (id);

alter table "public"."team_members" add constraint "team_members_pkey" PRIMARY KEY using index "team_members_pkey";

alter table "public"."teams" add constraint "teams_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES organizations(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."teams" validate constraint "teams_organization_id_fkey";


