CREATE policy "Enable read access for all users" ON "public"."organization_credits" AS permissive FOR
SELECT TO authenticated USING (
    (
      (
        SELECT auth.uid()
      ) IN (
        SELECT get_organization_member_ids(organization_credits.organization_id) AS get_organization_member_ids
      )
    )
  );


CREATE policy "Inviter can delete the invitation" ON "public"."organization_join_invitations" AS permissive FOR DELETE TO authenticated USING (
  (
    (
      SELECT auth.uid()
    ) = inviter_user_id
  )
);


CREATE policy "Enable delete for users based on user_id" ON "public"."organization_members" AS permissive FOR DELETE TO authenticated USING (
  (
    (
      SELECT auth.uid()
    ) IN (
      SELECT get_organization_admin_ids(organization_members.organization_id) AS get_organization_admin_ids
    )
  )
);


CREATE policy "Temporary : Everyone can view" ON "public"."organization_members" AS permissive FOR
SELECT TO authenticated USING (TRUE);


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


CREATE policy "All authenticated members can insert" ON "public"."projects" AS permissive FOR
INSERT TO authenticated WITH CHECK (TRUE);


CREATE policy "Enable delete for team admins" ON "public"."projects" AS permissive FOR DELETE TO public USING (
  (
    (
      SELECT auth.uid()
    ) IN (
      SELECT get_organization_admin_ids(projects.organization_id) AS get_organization_admin_ids
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


CREATE policy "Enable update for org members" ON "public"."projects" AS permissive FOR
UPDATE TO public USING (
    (
      (
        SELECT auth.uid()
      ) IN (
        SELECT get_organization_member_ids(projects.organization_id) AS get_organization_member_ids
      )
    )
  ) WITH CHECK (
    (
      (
        SELECT auth.uid()
      ) IN (
        SELECT get_organization_member_ids(projects.organization_id) AS get_organization_member_ids
      )
    )
  );


CREATE policy "Everyone can view user profile" ON "public"."user_profiles" AS permissive FOR
SELECT TO authenticated USING (TRUE);


CREATE policy "All team members can read organizations" ON "public"."organizations" AS permissive FOR
SELECT TO authenticated USING (
    (
      (
        (
          SELECT auth.uid()
        ) = created_by
      )
      OR (
        (
          SELECT auth.uid()
        ) IN (
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

  CREATE policy "Person who created the comment can delete it" ON "public"."project_comments" AS permissive FOR DELETE TO authenticated USING (
  (
    (
      SELECT auth.uid()
    ) = user_id
  )
);

  CREATE policy "Person who created the comment can update it" ON "public"."project_comments" AS permissive FOR
UPDATE TO authenticated USING (
    (
      (
        SELECT auth.uid()
      ) = user_id
    )
  );
