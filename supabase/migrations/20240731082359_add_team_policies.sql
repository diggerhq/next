-- Drop the policy for reading project comments
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = 'project_comments'
        AND policyname = 'All organization members of a project can read project comments'
    ) THEN
        DROP POLICY "All organization members of a project can read project comments" ON "public"."project_comments";
    END IF;
END $$;

-- Drop the policy for inserting project comments
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = 'project_comments'
        AND policyname = 'All organization members of a project can make project comments'
    ) THEN
        DROP POLICY "All organization members of a project can make project comments" ON "public"."project_comments";
    END IF;
END $$;


CREATE policy "Enable delete for org admins only" ON "public"."teams" AS permissive FOR DELETE TO authenticated USING (
  (
    (
      SELECT auth.uid()
    ) IN (
      SELECT get_organization_admin_ids(teams.organization_id) AS get_organization_admin_ids
    )
  )
);

CREATE policy "Enable insert for org admins only" ON "public"."teams" AS permissive FOR
INSERT TO authenticated WITH CHECK (
    (
      (
        SELECT auth.uid()
      ) IN (
        SELECT get_organization_admin_ids(teams.organization_id) AS get_organization_admin_ids
      )
    )
  );



CREATE policy "Enable read access for org admins or team members" ON "public"."teams" AS permissive FOR
SELECT TO authenticated USING (
    (
      (
        (
          SELECT auth.uid()
        ) IN (
          SELECT get_organization_admin_ids(teams.organization_id) AS get_organization_admin_ids
        )
      )
      OR (
        (
          SELECT auth.uid()
        ) IN (
          SELECT get_team_members_team_id(teams.id) AS get_team_members_team_id
        )
      )
    )
  );


CREATE policy "Enable update for org admins" ON "public"."teams" AS permissive FOR
UPDATE TO authenticated USING (
    (
      (
        SELECT auth.uid()
      ) IN (
        SELECT get_organization_admin_ids(teams.organization_id) AS get_organization_admin_ids
      )
    )
  ) WITH CHECK (
    (
      (
        SELECT auth.uid()
      ) IN (
        SELECT get_organization_admin_ids(teams.organization_id) AS get_organization_admin_ids
      )
    )
  );


CREATE policy "Enable read access for all team members" ON "public"."projects" AS permissive FOR
SELECT TO authenticated USING (
    (
      (organization_id IS NULL)
      OR (
        (team_id IS NULL)
        AND (
          (
            SELECT auth.uid()
          ) IN (
            SELECT get_organization_member_ids(projects.organization_id) AS get_organization_member_ids
          )
        )
      )
      OR (
        (
          SELECT auth.uid()
        ) IN (
          SELECT get_team_members_team_id(projects.team_id) AS get_team_members_team_id
        )
      )
      OR (
        (
          SELECT auth.uid()
        ) IN (
          SELECT get_organization_admin_ids(projects.organization_id) AS get_organization_admin_ids
        )
      )
    )
  );


CREATE policy "All team members can read organizations" ON "public"."organizations" AS permissive FOR
SELECT TO authenticated USING (
    (
      (
        (
          SELECT auth.uid()
        )  IN (
          SELECT get_organization_member_ids(organizations.id) AS get_organization_member_ids
        )
      )
      OR (
        id IN (
          SELECT get_invited_organizations_for_user_v2(
              (
                SELECT auth.uid()
              ),
              ((auth.jwt()->>'email'::text))::character varying
            ) AS get_invited_organizations_for_user_v2
        )
      )
    )
  );

CREATE policy "All team members of a project can make project comments" ON "public"."project_comments" AS permissive FOR
INSERT TO authenticated WITH CHECK (
    (
      (
        (
          SELECT auth.uid()
        ) IN (
          SELECT get_organization_admin_ids(get_organization_id_for_project_id(project_id)) AS get_organization_admin_ids
        )
      )
      OR (
        (
          SELECT auth.uid()
        ) IN (
          SELECT get_team_members_team_id(get_team_id_for_project_id(project_id)) AS get_team_members_team_id
        )
      )
    )
  );

  CREATE policy "All team members of a project can read project comments" ON "public"."project_comments" AS permissive FOR
SELECT TO authenticated USING (
    (
      (
        (
          SELECT auth.uid()
        ) IN (
          SELECT get_organization_admin_ids(get_organization_id_for_project_id(project_id)) AS get_organization_admin_ids
        )
      )
      OR (
        (
          SELECT auth.uid()
        ) IN (
          SELECT get_team_members_team_id(get_team_id_for_project_id(project_id)) AS get_team_members_team_id
        )
      )
    )
  );