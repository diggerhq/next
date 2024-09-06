"use server";
import { ProjectListType } from "@/app/(dynamic-pages)/(authenticated-pages)/(application-pages)/org/[organizationId]/(specific-organization-pages)/projects/ProjectsWithPagination";
import { CommentList } from "@/components/Projects/CommentList";
import type { Tables } from "@/lib/database.types";
import { supabaseAdminClient } from "@/supabase-clients/admin/supabaseAdminClient";
import { createSupabaseUserServerActionClient } from "@/supabase-clients/user/createSupabaseUserServerActionClient";
import { createSupabaseUserServerComponentClient } from "@/supabase-clients/user/createSupabaseUserServerComponentClient";
import type { CommentWithUser, Enum, SAPayload } from "@/types";
import { normalizeComment } from "@/utils/comments";
import { serverGetLoggedInUser } from "@/utils/server/serverGetLoggedInUser";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";
import { getRepoDetails } from "./repos";

export async function getSlimProjectById(projectId: string) {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from("projects")
    .select("id,name,project_status,organization_id,team_id,slug, repo_id")
    .eq("id", projectId)
    .single();
  if (error) {
    throw error;
  }
  return data;
}

export const getSlimProjectBySlug = async (projectSlug: string) => {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from("projects")
    .select("id, slug, name, organization_id, branch")
    .eq("slug", projectSlug)
    .single();
  if (error) {
    throw error;
  }
  return data;
}

export async function getProjectById(projectId: string) {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();
  if (error) {
    throw error;
  }
  return data;
}

export async function getProjectTitleById(projectId: string) {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();
  if (error) {
    throw error;
  }
  return data.name;
}

export const createProjectAction = async ({
  organizationId,
  name,
  slug,
  repoId,
  terraformWorkingDir,
  branch,
  managedState,
  labels,
  teamId,
  is_drift_detection_enabled,
  drift_crontab,
}: {
  organizationId: string;
  name: string;
  slug: string;
  repoId: number;
  terraformWorkingDir: string;
  branch: string;
  managedState: boolean;
  labels: string[];
  teamId: number | null;
  is_drift_detection_enabled: boolean;
  drift_crontab: string;
}): Promise<SAPayload<Tables<"projects">>> => {
  "use server";
  const supabaseClient = createSupabaseUserServerActionClient();
  const { data: project, error } = await supabaseClient
    .from("projects")
    .insert({
      organization_id: organizationId,
      name,
      slug,
      team_id: teamId,
      repo_id: repoId,
      terraform_working_dir: terraformWorkingDir,
      branch: branch,
      is_managing_state: managedState,
      is_in_main_branch: true,
      is_generated: true,
      project_status: "draft",
      latest_action_on: new Date().toISOString(),
      labels,
      is_drift_detection_enabled,
      drift_crontab,
    })
    .select("*")
    .single();


  if (error) {
    return {
      status: 'error',
      message: error.message,
    };
  }

  if (teamId) {
    revalidatePath(`/org/[organizationId]/team/[teamId]`, "layout");
  } else {
    revalidatePath(`/org/[organizationId]`, "layout");
    revalidatePath(`/org/[organizationId]/projects/`, "layout");
  }




  return {
    status: 'success',
    data: project,
  };
};

export const getProjectComments = async (
  projectId: string,
): Promise<Array<CommentWithUser>> => {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from("project_comments")
    .select("*, user_profiles(*)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) {
    throw error;
  }

  return data.map(normalizeComment);
};

export const createProjectCommentAction = async (
  projectId: string,
  text: string,
): Promise<SAPayload<{ id: number, commentList: React.JSX.Element }>> => {
  const supabaseClient = createSupabaseUserServerActionClient();
  const user = await serverGetLoggedInUser();
  const { data, error } = await supabaseClient
    .from("project_comments")
    .insert({ project_id: projectId, text, user_id: user.id })
    .select("*, user_profiles(*)")
    .single();
  if (error) {
    return { status: 'error', message: error.message };
  }
  revalidatePath(`/project/${projectId}`, "page");

  return {
    status: 'success',
    data: {
      id: data.id,
      commentList: (
        <Suspense>
          <CommentList comments={[normalizeComment(data)]} />
        </Suspense>
      ),
    },
  };
};

export const approveProjectAction = async (projectId: string): Promise<SAPayload<Tables<"projects">>> => {
  const supabaseClient = createSupabaseUserServerActionClient();
  const { data, error } = await supabaseClient
    .from("projects")
    .update({ project_status: "approved" })
    .eq("id", projectId)
    .select("*")
    .single();

  if (error) {
    return { status: 'error', message: error.message };
  }

  revalidatePath(`/project/${projectId}`, "layout");
  return { status: 'success', data };
};

export const rejectProjectAction = async (projectId: string): Promise<SAPayload<Tables<"projects">>> => {
  const supabaseClient = createSupabaseUserServerActionClient();
  const { data, error } = await supabaseClient
    .from("projects")
    .update({ project_status: "draft" })
    .eq("id", projectId)
    .select("*")
    .single();

  if (error) {
    return { status: 'error', message: error.message };
  }

  revalidatePath(`/project/${projectId}`, "layout");
  return { status: 'success', data };
};

export const submitProjectForApprovalAction = async (
  projectId: string,
): Promise<SAPayload<Tables<"projects">>> => {
  const supabaseClient = createSupabaseUserServerActionClient();
  const { data, error } = await supabaseClient
    .from("projects")
    .update({ project_status: "pending_approval" })
    .eq("id", projectId)
    .select("*")
    .single();

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath(`/project/${projectId}`, "layout");
  return { status: "success", data };
};

export const markProjectAsCompletedAction = async (projectId: string): Promise<SAPayload<Tables<"projects">>> => {
  const supabaseClient = createSupabaseUserServerActionClient();
  const { data, error } = await supabaseClient
    .from("projects")
    .update({ project_status: "completed" })
    .eq("id", projectId)
    .select("*")
    .single();

  if (error) {
    return { status: 'error', message: error.message };
  }

  revalidatePath(`/project/${projectId}`, "layout");
  return { status: 'success', data };
};

export async function getProjectsForUser({
  userId,
  userRole,
  organizationId,
  query = '',
  teamIds = [],
}: {
  userId: string;
  userRole: Enum<'organization_member_role'>;
  organizationId: string;
  query?: string;
  teamIds?: number[];
}): Promise<Tables<'projects'>[]> {
  const supabase = createSupabaseUserServerComponentClient();

  let supabaseQuery = supabase
    .from('projects')
    .select('*, teams(name)')
    .eq('organization_id', organizationId)
    .ilike('name', `%${query}%`);

  if (userRole !== 'admin' || userId !== 'owner') {
    // For non-admin users, get their team memberships
    const { data: userTeams } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    const userTeamIds = userTeams?.map(team => team.team_id) || [];

    // Filter by user's teams and organization-level projects
    supabaseQuery = supabaseQuery.or(`team_id.is.null,team_id.in.(${userTeamIds.join(',')})`);
  }

  // Apply team filter if provided
  if (teamIds.length > 0) {
    supabaseQuery = supabaseQuery.in('team_id', teamIds);
  }

  const { data, error } = await supabaseQuery;

  if (error) throw error;
  return data || [];
}

export async function getProjectsListForUser({
  userId,
  userRole,
  organizationId,
  query = '',
  teamIds = [],
}: {
  userId: string;
  userRole: Enum<'organization_member_role'>;
  organizationId: string;
  query?: string;
  teamIds?: number[];
}): Promise<ProjectListType[]> {
  const supabase = createSupabaseUserServerComponentClient();

  let supabaseQuery = supabase
    .from('projects')
    .select('id,name, slug, latest_action_on, created_at, repo_id')
    .eq('organization_id', organizationId)
    .ilike('name', `%${query}%`);

  if (userRole !== 'admin' || userId !== 'owner') {
    // For non-admin users, get their team memberships
    const { data: userTeams } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    const userTeamIds = userTeams?.map(team => team.team_id) || [];

    // Filter by user's teams and organization-level projects
    supabaseQuery = supabaseQuery.or(`team_id.is.null,team_id.in.(${userTeamIds.join(',')})`);
  }

  // Apply team filter if provided
  if (teamIds.length > 0) {
    supabaseQuery = supabaseQuery.in('team_id', teamIds);
  }

  const { data, error } = await supabaseQuery.order('latest_action_on', {
    ascending: false,
  });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  if (!data) return [];

  // Fetch repo details for each project
  const projectsWithRepoDetails = await Promise.all(
    data.map(async (project) => {
      const repoDetails = await getRepoDetails(project.repo_id);
      const { repo_id, ...projectWithoutRepoId } = project;
      return {
        ...projectWithoutRepoId,
        repo_full_name: repoDetails?.repo_full_name || null,
      };
    })
  );

  return projectsWithRepoDetails;
}

export async function getSlimProjectsForUser({
  userId,
  userRole,
  projectIds,
  teamIds = [],
}: {
  userId: string;
  userRole: Enum<'organization_member_role'>;
  projectIds: string[];
  teamIds?: number[];
}): Promise<ProjectListType[]> {
  const supabase = createSupabaseUserServerComponentClient();

  let supabaseQuery = supabase
    .from('projects')
    .select('id,name, slug, latest_action_on, created_at, repo_id')
    .in('id', projectIds);

  if (userRole !== 'admin' || userId !== 'owner') {
    // For non-admin users, get their team memberships
    const { data: userTeams } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    const userTeamIds = userTeams?.map(team => team.team_id) || [];

    // Filter by user's teams and organization-level projects
    supabaseQuery = supabaseQuery.or(`team_id.is.null,team_id.in.(${userTeamIds.join(',')})`);
  }

  // Apply team filter if provided
  if (teamIds.length > 0) {
    supabaseQuery = supabaseQuery.in('team_id', teamIds);
  }

  const { data, error } = await supabaseQuery.order('latest_action_on', {
    ascending: false,
  });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  if (!data) return [];

  // Fetch repo details for each project
  const projectsWithRepoDetails = await Promise.all(
    data.map(async (project) => {
      const repoDetails = await getRepoDetails(project.repo_id);
      const { repo_id, ...projectWithoutRepoId } = project;
      return {
        ...projectWithoutRepoId,
        repo_full_name: repoDetails?.repo_full_name || null,
      };
    })
  );

  return projectsWithRepoDetails;
}
export async function getProjectsIdsListForUser({
  userId,
  userRole,
  organizationId,
  query = '',
  teamIds = [],
}: {
  userId: string;
  userRole: Enum<'organization_member_role'>;
  organizationId: string;
  query?: string;
  teamIds?: number[];
}): Promise<string[]> {
  const supabase = createSupabaseUserServerComponentClient();

  let supabaseQuery = supabase
    .from('projects')
    .select('id,name, slug, latest_action_on, created_at, repo_id')
    .eq('organization_id', organizationId)
    .ilike('name', `%${query}%`);

  if (userRole !== 'admin' || userId !== 'owner') {
    // For non-admin users, get their team memberships
    const { data: userTeams } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    const userTeamIds = userTeams?.map(team => team.team_id) || [];

    // Filter by user's teams and organization-level projects
    supabaseQuery = supabaseQuery.or(`team_id.is.null,team_id.in.(${userTeamIds.join(',')})`);
  }

  // Apply team filter if provided
  if (teamIds.length > 0) {
    supabaseQuery = supabaseQuery.in('team_id', teamIds);
  }

  const { data, error } = await supabaseQuery.order('latest_action_on', {
    ascending: false,
  });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  if (!data) return [];

  // Fetch repo details for each project
  const projectsWithRepoDetails = await Promise.all(
    data.map(async (project) => {
      const repoDetails = await getRepoDetails(project.repo_id);
      const { repo_id, ...projectWithoutRepoId } = project;
      return {
        ...projectWithoutRepoId,
        repo_full_name: repoDetails?.repo_full_name || null,
      };
    })
  );

  return projectsWithRepoDetails.map(project => project.id);
}

export async function getProjectsCountForUser({
  userId,
  organizationId,
  query = '',
  teamIds = [],
}: {
  userId: string;
  organizationId: string;
  query?: string;
  teamIds?: number[];
}): Promise<number> {
  const supabase = createSupabaseUserServerComponentClient();

  // Get the user's role in the organization
  const { data: userRole } = await supabase
    .from('organization_members')
    .select('member_role')
    .eq('organization_id', organizationId)
    .eq('member_id', userId)
    .single();

  if (!userRole) {
    throw new Error('User not found in organization');
  }

  let supabaseQuery = supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .ilike('name', `%${query}%`);

  if (userRole.member_role !== 'admin') {
    // For non-admin users, get their team memberships
    const { data: userTeams } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    const userTeamIds = userTeams?.map(team => team.team_id) || [];

    // Filter by user's teams and organization-level projects
    supabaseQuery = supabaseQuery.or(`team_id.is.null,team_id.in.(${userTeamIds.join(',')})`);
  }

  // Apply team filter if provided
  if (teamIds.length > 0) {
    supabaseQuery = supabaseQuery.in('team_id', teamIds);
  }

  const { count, error } = await supabaseQuery;

  if (error) throw error;
  return count || 0;
}





export const getAllProjectsInOrganization = async ({
  organizationId,
  query = "",
  page = 1,
  limit = 20,
}: {
  query?: string;
  page?: number;
  organizationId: string;
  limit?: number;
}) => {
  const zeroIndexedPage = page - 1;
  const supabase = createSupabaseUserServerComponentClient();
  let supabaseQuery = supabase
    .from("projects")
    .select("*")
    .eq("organization_id", organizationId)
    .range(zeroIndexedPage * limit, (zeroIndexedPage + 1) * limit - 1);

  if (query) {
    supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
  }

  const { data, error } = await supabaseQuery.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return data || [];
};

export const getAllProjectIdsInOrganization = async (organizationId: string) => {
  const supabase = createSupabaseUserServerComponentClient();
  const supabaseQuery = supabase
    .from("projects")
    .select("id")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  const { data, error } = await supabaseQuery;

  if (error) {
    console.error("Error fetching project IDs:", error);
    return [];
  }

  return data?.map(project => project.id) || [];
};

export const getProjectIdsInOrganization = async (organizationId: string, count: number) => {
  const supabase = createSupabaseUserServerComponentClient();
  const supabaseQuery = supabase
    .from("projects")
    .select("id")
    .eq("organization_id", organizationId);

  const { data, error } = await supabaseQuery;

  if (error) {
    console.error("Error fetching project IDs:", error);
    return [];
  }

  const projectIds = data?.map(project => project.id) || [];

  // Shuffle the array and slice to get random project IDs
  return projectIds.sort(() => Math.random() - 0.5).slice(0, count);
};


export const getOrganizationLevelProjects = async ({
  organizationId,
  query = "",
  page = 1,
  limit = 5,
}: {
  query?: string;
  page?: number;
  organizationId: string;
  limit?: number;
}) => {
  const zeroIndexedPage = page - 1;
  const supabase = createSupabaseUserServerComponentClient();
  let supabaseQuery = supabase
    .from("projects")
    .select("*")
    .eq("organization_id", organizationId)
    .is('team_id', null)
    .range(zeroIndexedPage * limit, (zeroIndexedPage + 1) * limit - 1);

  if (query) {
    supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
  }

  const { data, error } = await supabaseQuery.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return data || [];
};


export const getProjects = async ({
  organizationId,
  teamId,
  query = "",
  page = 1,
  limit = 5,
}: {
  query?: string;
  page?: number;
  organizationId: string;
  teamId: number | null;
  limit?: number;
}) => {
  const zeroIndexedPage = page - 1;
  const supabase = createSupabaseUserServerComponentClient();
  let supabaseQuery = supabase
    .from("projects")
    .select("*")
    .eq("organization_id", organizationId)
    .range(zeroIndexedPage * limit, (zeroIndexedPage + 1) * limit - 1);

  // Add team filter
  if (teamId !== null) {
    supabaseQuery = supabaseQuery.eq('team_id', teamId);
  } else {
    supabaseQuery = supabaseQuery.is('team_id', null);
  }

  if (query) {
    supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
  }

  const { data, error } = await supabaseQuery.order("created_at", {
    ascending: false,
  });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  console.log('projects data', data);

  return data || [];
};

export const getAllProjectsListInOrganization = async ({
  organizationId,
  query = "",
  page = 1,
  limit = 20,
}: {
  query?: string;
  page?: number;
  organizationId: string;
  limit?: number;
}) => {
  const zeroIndexedPage = page - 1;
  const supabase = createSupabaseUserServerComponentClient();
  let supabaseQuery = supabase
    .from("projects")
    .select("id,name, slug, latest_action_on, created_at, repo_id")
    .eq("organization_id", organizationId)
    .range(zeroIndexedPage * limit, (zeroIndexedPage + 1) * limit - 1);

  if (query) {
    supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
  }

  const { data, error } = await supabaseQuery.order("latest_action_on", {
    ascending: false,
  });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  if (!data) return [];

  // Fetch repo details for each project
  const projectsWithRepoDetails = await Promise.all(
    data.map(async (project) => {
      const repoDetails = await getRepoDetails(project.repo_id);
      const { repo_id, ...projectWithoutRepoId } = project;
      return {
        ...projectWithoutRepoId,
        repo_full_name: repoDetails?.repo_full_name || null,
      };
    })
  );

  return projectsWithRepoDetails;
};

export const getProjectsList = async ({
  organizationId,
  teamId,
  query = "",
  page = 1,
  limit = 5,
}: {
  query?: string;
  page?: number;
  organizationId: string;
  teamId: number | null;
  limit?: number;
}) => {
  const zeroIndexedPage = page - 1;
  const supabase = createSupabaseUserServerComponentClient();
  let supabaseQuery = supabase
    .from("projects")
    .select("id,name, slug, latest_action_on, created_at, repo_id")
    .eq("organization_id", organizationId)
    .range(zeroIndexedPage * limit, (zeroIndexedPage + 1) * limit - 1);

  // Add team filter
  if (teamId !== null) {
    supabaseQuery = supabaseQuery.eq('team_id', teamId);
  } else {
    supabaseQuery = supabaseQuery.is('team_id', null);
  }

  if (query) {
    supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
  }

  const { data, error } = await supabaseQuery.order("latest_action_on", {
    ascending: false,
  });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  if (!data) return [];

  // Fetch repo details for each project
  const projectsWithRepoDetails: ProjectListType[] = await Promise.all(
    data.map(async (project) => {
      const repoDetails = await getRepoDetails(project.repo_id);
      const { repo_id, ...projectWithoutRepoId } = project;
      return {
        ...projectWithoutRepoId,
        repo_full_name: repoDetails?.repo_full_name || null,
      };
    })
  );

  return projectsWithRepoDetails;
};

export const getProjectsTotalCount = async ({
  organizationId,
  query = "",
  page = 1,
  limit = 5,
}: {
  organizationId: string;
  query?: string;
  page?: number;
  limit?: number;
}) => {
  const zeroIndexedPage = page - 1;
  let supabaseQuery = supabaseAdminClient
    .from("projects")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("organization_id", organizationId)
    .range(zeroIndexedPage * limit, (zeroIndexedPage + 1) * limit - 1);

  if (query) {
    supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
  }

  const { count, error } = await supabaseQuery.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  if (!count) {
    return 0;
  }

  return Math.ceil(count / limit) ?? 0;
};

export const getProjectsForUserTotalCount = async ({
  organizationId,
  query = "",
  page = 1,
  limit = 5,
}: {
  organizationId: string;
  query?: string;
  page?: number;
  limit?: number;
}) => {
  const zeroIndexedPage = page - 1;
  let supabaseQuery = supabaseAdminClient
    .from("projects")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("organization_id", organizationId)
    .range(zeroIndexedPage * limit, (zeroIndexedPage + 1) * limit - 1);

  if (query) {
    supabaseQuery = supabaseQuery.ilike("name", `%${query}%`);
  }

  const { count, error } = await supabaseQuery.order("created_at", {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  if (!count) {
    return 0;
  }

  return Math.ceil(count / limit) ?? 0;
};


// data/user/projects.ts


export async function updateProjectSettingsAction({
  projectId,
  terraformWorkingDir,
  labels,
  managedState,
  is_drift_detection_enabled,
  drift_crontab,
}: {
  projectId: string;
  terraformWorkingDir: string;
  labels: string[];
  managedState: boolean;
  is_drift_detection_enabled: boolean;
  drift_crontab: string;
}): Promise<SAPayload<unknown>> {
  const supabase = createSupabaseUserServerComponentClient();

  try {
    const { data, error } = await supabase
      .from('projects')
      .update({
        terraform_working_dir: terraformWorkingDir,
        labels,
        is_managing_state: managedState,
        is_drift_detection_enabled: is_drift_detection_enabled,
        drift_crontab: drift_crontab,
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;

    return { status: 'success', data };
  } catch (error) {
    console.error("Error updating project settings:", error);
    return { status: 'error', message: 'Failed to update project settings' };
  }
}

export async function deleteProject(projectId: string): Promise<SAPayload<unknown>> {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('projects')
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .single();

  if (error) {
    return { status: 'error', message: error.message };
  }

  return { status: 'success', data };
}

export async function triggerApplyAction({ projectId }: { projectId: string }): Promise<SAPayload<unknown>> {
  const triggerApplyUrl = process.env.DIGGER_TRIGGER_APPLY_URL;
  const webhookSecret = process.env.DIGGER_WEBHOOK_SECRET;
  if (!triggerApplyUrl) {
    throw new Error('DIGGER_TRIGGER_APPLY_URL env variable is not set');
  }
  if (!webhookSecret) {
    throw new Error('DIGGER_WEBHOOK_SECRET env variable is not set');
  }

  const user = await serverGetLoggedInUser();
  const payload = {
    userId: user.id,
    projectId
  }
  const response = await fetch(
    triggerApplyUrl,
    {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Bearer ${webhookSecret}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error(`Digger api responded with status: ${response.status}`);
  }
  return { status: 'success', data: {} };
}