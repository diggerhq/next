
-- Get organization of a team
-- This function is used to get an organization of a team
CREATE OR REPLACE FUNCTION public.get_organization_id_by_team_id(p_id integer) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $function$
DECLARE v_organization_id UUID;
BEGIN
SELECT organization_id INTO v_organization_id
FROM teams
WHERE id = p_id;
RETURN v_organization_id;
EXCEPTION
WHEN NO_DATA_FOUND THEN RAISE EXCEPTION 'No organization found for the provided id: %',
p_id;
END;
$function$;
REVOKE ALL ON FUNCTION public.get_organization_id_by_team_id(p_id integer)
FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_organization_id_by_team_id(p_id integer)
FROM ANON;


CREATE OR REPLACE FUNCTION public.get_organization_id_by_team_id(p_id bigint) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $function$
DECLARE v_organization_id UUID;
BEGIN
SELECT organization_id INTO v_organization_id
FROM teams
WHERE id = p_id;
RETURN v_organization_id;
EXCEPTION
WHEN NO_DATA_FOUND THEN RAISE EXCEPTION 'No organization found for the provided id: %',
p_id;
END;
$function$;
REVOKE ALL ON FUNCTION public.get_organization_id_by_team_id(p_id bigint)
FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_organization_id_by_team_id(p_id bigint)
FROM ANON;

-- Get organizations for user
-- This function is used to get all organizations that a user is a member of
CREATE OR REPLACE FUNCTION public.get_organizations_for_user(user_id uuid) RETURNS TABLE(organization_id uuid) LANGUAGE plpgsql SECURITY DEFINER AS $function$ BEGIN RETURN QUERY
SELECT o.id AS organization_id
FROM organizations o
  JOIN organization_members ot ON o.id = ot.organization_id
WHERE ot.member_id = user_id;
END;
$function$;
REVOKE ALL ON FUNCTION public.get_organizations_for_user
FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_organizations_for_user
FROM ANON;
-- Get project admins of a team
-- This function is used to get all admins of a team
CREATE OR REPLACE FUNCTION public.get_team_admins_by_team_id(team_id bigint) RETURNS TABLE(user_id uuid) LANGUAGE plpgsql SECURITY DEFINER AS $function$ BEGIN RETURN QUERY
SELECT team_members.user_id
FROM team_members
WHERE team_members.team_id = $1
  AND role = 'admin';
END;
$function$;
REVOKE ALL ON FUNCTION public.get_team_admins_by_team_id
FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_team_admins_by_team_id
FROM ANON;
-- Get project members of a team
-- This function is used to get all members of a team
CREATE OR REPLACE FUNCTION public.get_team_members_team_id(team_id bigint) RETURNS TABLE(user_id uuid) LANGUAGE plpgsql SECURITY DEFINER AS $function$ BEGIN RETURN QUERY
SELECT team_members.user_id
FROM team_members
WHERE team_members.team_id = $1;
END;
$function$;
REVOKE ALL ON FUNCTION public.get_team_members_team_id
FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_team_members_team_id
FROM ANON;

CREATE OR REPLACE FUNCTION get_team_id_for_project_id(project_id UUID) RETURNS INT8 AS $$
DECLARE team_id INT8;
BEGIN
SELECT p.team_id INTO team_id
FROM projects p
WHERE p.id = project_id;
RETURN team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
REVOKE ALL ON FUNCTION public.get_team_id_for_project_id
FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_team_id_for_project_id
FROM ANON;