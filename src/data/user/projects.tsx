"use server";
import type { Enum, SAPayload } from "@/types";
import { serverGetLoggedInUser } from "@/utils/server/serverGetLoggedInUser";
import { PrismaClient, projects } from '@prisma/client';
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { getRepoDetails } from "./repos";


export async function getSlimProjectById(projectId: string) {
  const prisma = new PrismaClient();

  try {
    const project = await prisma.projects.findUnique({
      where: {
        id: projectId,
      },
      select: {
        id: true,
        name: true,
        project_status: true,
        organization_id: true,
        team_id: true,
        slug: true,
        repo_id: true,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  } finally {
    await prisma.$disconnect();
  }
}

export async function getSlimProjectBySlug(projectSlug: string) {
  const prisma = new PrismaClient();

  try {
    const project = await prisma.projects.findUnique({
      where: {
        slug: projectSlug,
      },
      select: {
        id: true,
        slug: true,
        name: true,
        organization_id: true,
        branch: true,
        deleted_at: true,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  } finally {
    await prisma.$disconnect();
  }
}

export async function getProjectById(projectId: string) {
  const prisma = new PrismaClient();

  try {
    const project = await prisma.projects.findUnique({
      where: {
        id: projectId,
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return project;
  } finally {
    await prisma.$disconnect();
  }
}

export const createProjectAction = async ({
  organizationId,
  name,
  slug,
  repoId,
  branch,
  terraformWorkingDir,
  workspace,
  workflow_file,
  iac_type,
  include_patterns,
  exclude_patterns,
  managedState,
  labels,
  teamId,
  is_drift_detection_enabled,
  drift_crontab,
}: {
  organizationId: string;
  name: string;
  slug: string;
  repoId: bigint;
  branch: string;
  terraformWorkingDir: string;
  workspace?: string;
  workflow_file?: string;
  iac_type: "terraform" | "terragrunt" | "opentofu";
  include_patterns?: string;
  exclude_patterns?: string;
  managedState: boolean;
  labels: string[];
  teamId: number | null;
  is_drift_detection_enabled: boolean;
  drift_crontab?: string;
}): Promise<SAPayload<projects>> => {
  "use server";
  const prisma = new PrismaClient();
  try {
    const project = await prisma.projects.create({
      data: {
        id: randomUUID(),
        organization_id: organizationId,
        name,
        slug,
        team_id: teamId,
        repo_id: repoId,
        branch,
        terraform_working_dir: terraformWorkingDir,
        workspace,
        workflow_file,
        iac_type,
        include_patterns,
        exclude_patterns,
        is_managing_state: managedState,
        is_in_main_branch: true,
        is_generated: true,
        project_status: "draft",
        latest_action_on: String(new Date()),
        labels,
        is_drift_detection_enabled,
        drift_crontab,
      }
    });
    // why are we revalidating paths in a getter query?
    // a getter query is not supposed to have side effects. bad code.
    // leaving as is because idk what breaks if I remove it
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
  } catch (error) {
    console.log(`could not create project ${name} for org ID: ${organizationId}`, error);
    return {
      status: 'error',
      message: error.message,
    };
  } finally {
    await prisma.$disconnect()
  }
};

export async function approveProjectAction(projectId: string): Promise<SAPayload<projects>> { // Replace 'Project' with your Prisma Project type
  const prisma = new PrismaClient();

  try {
    const updatedProject = await prisma.projects.update({
      where: {
        id: projectId,
      },
      data: {
        project_status: 'approved'
      }
    });

    revalidatePath(`/project/${projectId}`, "layout");

    return {
      status: 'success',
      data: updatedProject
    };

  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to approve project'
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function rejectProjectAction(projectId: string): Promise<SAPayload<projects>> {
  const prisma = new PrismaClient();

  try {
    const updatedProject = await prisma.projects.update({
      where: {
        id: projectId,
      },
      data: {
        project_status: 'draft'
      }
    });

    revalidatePath(`/project/${projectId}`, "layout");

    return {
      status: 'success',
      data: updatedProject
    };

  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to reject project'
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function submitProjectForApprovalAction(projectId: string): Promise<SAPayload<projects>> {
  const prisma = new PrismaClient();

  try {
    const updatedProject = await prisma.projects.update({
      where: {
        id: projectId,
      },
      data: {
        project_status: 'pending_approval'
      }
    });

    revalidatePath(`/project/${projectId}`, "layout");

    return {
      status: 'success',
      data: updatedProject
    };

  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to submit project for approval'
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function markProjectAsCompletedAction(projectId: string): Promise<SAPayload<projects>> {
  const prisma = new PrismaClient();

  try {
    const updatedProject = await prisma.projects.update({
      where: {
        id: projectId,
      },
      data: {
        project_status: 'completed'
      }
    });

    revalidatePath(`/project/${projectId}`, "layout");

    return {
      status: 'success',
      data: updatedProject
    };

  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to mark project as completed'
    };
  } finally {
    await prisma.$disconnect();
  }
}

export type ProjectListType = {
  id: string;
  name: string;
  latest_action_on: string | null;
  created_at: string | Date;
  repo_full_name: string | null;
  slug: string;
}

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
}): Promise<projects[]> {
  const prisma = new PrismaClient();

  try {
    const whereCondition: any = {
      organization_id: organizationId,
      name: {
        contains: query,
        mode: 'insensitive', // This is equivalent to ilike
      },
      deleted_at: null,
    };

    if (userRole !== 'admin' && userId !== 'owner') {
      const userTeams = await prisma.team_members.findMany({
        where: {
          user_id: userId
        },
        select: {
          team_id: true
        }
      });

      const userTeamIds = userTeams.map(team => team.team_id);

      whereCondition.OR = [
        { team_id: null },
        { team_id: { in: userTeamIds } }
      ];
    }

    if (teamIds.length > 0) {
      whereCondition.team_id = { in: teamIds };
    }

    const projects = await prisma.projects.findMany({
      where: whereCondition,
      include: {
        teams: {
          select: {
            name: true
          }
        }
      }
    });

    return projects;
  } finally {
    await prisma.$disconnect();
  }
}

export async function getProjectsListForUser({
  userId,
  userRole,
  organizationId,
  query = '',
  teamIds = [],
  driftedOnly = false,
}: {
  userId: string;
  userRole: Enum<'organization_member_role'>;
  organizationId: string;
  query?: string;
  teamIds?: number[];
  driftedOnly?: boolean;
}): Promise<ProjectListType[]> {
  const prisma = new PrismaClient();

  try {
    const whereCondition: any = {
      organization_id: organizationId,
      name: {
        contains: query,
        mode: 'insensitive', // equivalent to ilike
      },
      deleted_at: null,
    };

    if (userRole !== 'admin' && userId !== 'owner') {
      const userTeams = await prisma.team_members.findMany({
        where: {
          user_id: userId
        },
        select: {
          team_id: true
        }
      });

      const userTeamIds = userTeams.map(team => team.team_id);

      whereCondition.OR = [
        { team_id: null },
        { team_id: { in: userTeamIds } }
      ];
    }

    if (teamIds.length > 0) {
      whereCondition.team_id = { in: teamIds };
    }

    const projects = await prisma.projects.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        slug: true,
        latest_action_on: true,
        created_at: true,
        repo_id: true,
        latest_drift_output: true,
      },
      orderBy: {
        latest_action_on: 'desc'
      }
    });

    if (!projects) return [];

    const driftFilteredProjects = driftedOnly
      ? projects.filter(project => !!project.latest_drift_output)
      : projects;

    const projectsWithRepoDetails = await Promise.all(
      driftFilteredProjects.map(async (project) => {
        const repoDetails = await getRepoDetails(Number(project.repo_id));
        const { repo_id, ...projectWithoutRepoId } = project;
        return {
          ...projectWithoutRepoId,
          created_at: String(projectWithoutRepoId.created_at),
          repo_full_name: repoDetails?.repo_full_name || null,
        };
      })
    );

    return projectsWithRepoDetails;

  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
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
  const prisma = new PrismaClient();

  try {
    const whereCondition: any = {
      id: { in: projectIds },
      deleted_at: null,
    };

    // Handle team filtering for non-admin users
    if (userRole !== 'admin' && userId !== 'owner') {
      const userTeams = await prisma.team_members.findMany({
        where: {
          user_id: userId
        },
        select: {
          team_id: true
        }
      });

      const userTeamIds = userTeams.map(team => team.team_id);

      whereCondition.OR = [
        { team_id: null },
        { team_id: { in: userTeamIds } }
      ];
    }

    if (teamIds.length > 0) {
      whereCondition.team_id = { in: teamIds };
    }

    const projects = await prisma.projects.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        slug: true,
        latest_action_on: true,
        created_at: true,
        repo_id: true,
      },
      orderBy: {
        latest_action_on: 'desc'
      }
    });

    if (!projects) return [];

    const projectsWithRepoDetails = await Promise.all(
      projects.map(async (project) => {
        const repoDetails = await getRepoDetails(Number(project.repo_id));
        const { repo_id, ...projectWithoutRepoId } = project;
        return {
          ...projectWithoutRepoId,
          created_at: String(projectWithoutRepoId.created_at),
          repo_full_name: repoDetails?.repo_full_name || null,
        };
      })
    );

    return projectsWithRepoDetails;

  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
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
  const prisma = new PrismaClient();

  try {
    const whereCondition: any = {
      organization_id: organizationId,
      name: {
        contains: query,
        mode: 'insensitive', // equivalent to ilike
      },
      deleted_at: null,
    };

    // Handle team filtering for non-admin users
    if (userRole !== 'admin' && userId !== 'owner') {
      const userTeams = await prisma.team_members.findMany({
        where: {
          user_id: userId
        },
        select: {
          team_id: true
        }
      });

      const userTeamIds = userTeams.map(team => team.team_id);

      whereCondition.OR = [
        { team_id: null },
        { team_id: { in: userTeamIds } }
      ];
    }

    if (teamIds.length > 0) {
      whereCondition.team_id = { in: teamIds };
    }

    const projects = await prisma.projects.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        slug: true,
        latest_action_on: true,
        created_at: true,
        repo_id: true,
      },
      orderBy: {
        latest_action_on: 'desc'
      }
    });

    if (!projects) return [];

    const projectsWithRepoDetails = await Promise.all(
      projects.map(async (project) => {
        const repoDetails = await getRepoDetails(Number(project.repo_id));
        const { repo_id, ...projectWithoutRepoId } = project;
        return {
          ...projectWithoutRepoId,
          repo_full_name: repoDetails?.repo_full_name || null,
        };
      })
    );

    return projectsWithRepoDetails.map(project => project.id);

  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
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
  const prisma = new PrismaClient();

  try {
    const userRole = await prisma.organization_members.findFirst({
      where: {
        AND: [
          { organization_id: organizationId },
          { member_id: userId },
        ]
      },
      select: {
        member_role: true
      }
    });

    if (!userRole) {
      throw new Error('User not found in organization');
    }

    const whereCondition: any = {
      organization_id: organizationId,
      name: {
        contains: query,
        mode: 'insensitive', // equivalent to ilike
      },
      deleted_at: null,
    };

    // Handle team filtering for non-admin users
    if (userRole.member_role !== 'admin') {
      const userTeams = await prisma.team_members.findMany({
        where: {
          user_id: userId
        },
        select: {
          team_id: true
        }
      });

      const userTeamIds = userTeams.map(team => team.team_id);

      whereCondition.OR = [
        { team_id: null },
        { team_id: { in: userTeamIds } }
      ];
    }

    if (teamIds.length > 0) {
      whereCondition.team_id = { in: teamIds };
    }

    const count = await prisma.projects.count({
      where: whereCondition
    });

    return count;
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAllProjectsInOrganization({
  organizationId,
  query = "",
  page = 1,
  limit = 20,
}: {
  organizationId: string;
  query?: string;
  page?: number;
  limit?: number;
}) {
  const prisma = new PrismaClient();

  try {
    const zeroIndexedPage = page - 1;

    const whereCondition: any = {
      organization_id: organizationId,
      deleted_at: null,
    };

    if (query) {
      whereCondition.name = {
        contains: query,
        mode: 'insensitive', // equivalent to ilike
      };
    }

    const projects = await prisma.projects.findMany({
      where: whereCondition,
      take: limit,
      skip: zeroIndexedPage * limit,
      orderBy: {
        created_at: 'desc'
      }
    });

    return projects;

  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAllProjectsListInOrganization({
  organizationId,
  query = "",
  page = 1,
  limit = 20,
}: {
  organizationId: string;
  query?: string;
  page?: number;
  limit?: number;
}) {
  const prisma = new PrismaClient();

  try {
    const zeroIndexedPage = page - 1;

    // Build the where condition
    const whereCondition: any = {
      organization_id: organizationId,
      deleted_at: null,
    };

    // Add search condition if query exists
    if (query) {
      whereCondition.name = {
        contains: query,
        mode: 'insensitive', // equivalent to ilike
      };
    }

    const projects = await prisma.projects.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        slug: true,
        latest_action_on: true,
        created_at: true,
        repo_id: true,
      },
      take: limit,
      skip: zeroIndexedPage * limit,
      orderBy: {
        latest_action_on: 'desc'
      }
    });

    if (!projects) return [];

    // Fetch repo details for each project
    const projectsWithRepoDetails = await Promise.all(
      projects.map(async (project) => {
        const repoDetails = await getRepoDetails(Number(project.repo_id));
        const { repo_id, ...projectWithoutRepoId } = project;
        return {
          ...projectWithoutRepoId,
          repo_full_name: repoDetails?.repo_full_name || null,
        };
      })
    );

    return projectsWithRepoDetails;

  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

export async function getProjectsList({
  organizationId,
  teamId,
  query = "",
  page = 1,
  limit = 5,
}: {
  organizationId: string;
  teamId: number | null;
  query?: string;
  page?: number;
  limit?: number;
}): Promise<ProjectListType[]> {
  const prisma = new PrismaClient();

  try {
    const zeroIndexedPage = page - 1;

    const whereCondition: any = {
      organization_id: organizationId,
      deleted_at: null,
    };

    if (teamId !== null) {
      whereCondition.team_id = teamId;
    } else {
      whereCondition.team_id = null;
    }

    if (query) {
      whereCondition.name = {
        contains: query,
        mode: 'insensitive', // equivalent to ilike
      };
    }

    const projects = await prisma.projects.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        slug: true,
        latest_action_on: true,
        created_at: true,
        repo_id: true,
      },
      take: limit,
      skip: zeroIndexedPage * limit,
      orderBy: {
        latest_action_on: 'desc'
      }
    });

    if (!projects) return [];

    // Fetch repo details for each project
    const projectsWithRepoDetails: ProjectListType[] = await Promise.all(
      projects.map(async (project) => {
        const repoDetails = await getRepoDetails(Number(project.repo_id));
        const { repo_id, ...projectWithoutRepoId } = project;
        return {
          ...projectWithoutRepoId,
          created_at: String(projectWithoutRepoId.created_at),
          repo_full_name: repoDetails?.repo_full_name || null,
        };
      })
    );

    return projectsWithRepoDetails;

  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

export async function getProjectsTotalCount({
  organizationId,
  query = "",
  page = 1,
  limit = 5,
}: {
  organizationId: string;
  query?: string;
  page?: number;
  limit?: number;
}) {
  const prisma = new PrismaClient();

  try {
    const whereCondition: any = {
      organization_id: organizationId,
    };

    if (query) {
      whereCondition.name = {
        contains: query,
        mode: 'insensitive', // equivalent to ilike
      };
    }

    const totalCount = await prisma.projects.count({
      where: whereCondition
    });

    return Math.ceil(totalCount / limit) || 0;

  } finally {
    await prisma.$disconnect();
  }
}

export async function getProjectsForUserTotalCount({
  organizationId,
  query = "",
  page = 1,
  limit = 5,
}: {
  organizationId: string;
  query?: string;
  page?: number;
  limit?: number;
}) {
  const prisma = new PrismaClient();

  try {
    // Build the where condition
    const whereCondition: any = {
      organization_id: organizationId,
      deleted_at: null,
    };

    // Add search condition if query exists
    if (query) {
      whereCondition.name = {
        contains: query,
        mode: 'insensitive', // equivalent to ilike
      };
    }

    // Get total count of matching records
    const totalCount = await prisma.projects.count({
      where: whereCondition
    });

    // Calculate total pages
    return Math.ceil(totalCount / limit) || 0;

  } finally {
    await prisma.$disconnect();
  }
}

export async function updateProjectSettingsAction({
  projectId,
  terraformWorkingDir,
  iac_type,
  workspace,
  workflow_file,
  include_patterns,
  exclude_patterns,
  labels,
  managedState,
  is_drift_detection_enabled,
  drift_crontab,
  auto_approve,
}: {
  projectId: string;
  terraformWorkingDir: string;
  iac_type: 'terraform' | 'terragrunt' | 'opentofu';
  workspace: string;
  workflow_file: string;
  include_patterns?: string;
  exclude_patterns?: string;
  labels: string[];
  managedState: boolean;
  is_drift_detection_enabled: boolean;
  drift_crontab: string;
  auto_approve: boolean;
}): Promise<SAPayload<projects>> {
  const prisma = new PrismaClient();

  try {
    const updatedProject = await prisma.projects.update({
      where: {
        id: projectId
      },
      data: {
        terraform_working_dir: terraformWorkingDir,
        iac_type,
        workspace,
        workflow_file,
        include_patterns,
        exclude_patterns,
        labels,
        is_managing_state: managedState,
        is_drift_detection_enabled,
        drift_crontab,
        auto_approve,
      }
    });

    return {
      status: 'success',
      data: updatedProject
    };

  } catch (error) {
    console.error("Error updating project settings:", error);
    return {
      status: 'error',
      message: 'Failed to update project settings'
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteProject(projectId: string): Promise<SAPayload<unknown>> {
  const prisma = new PrismaClient();

  try {
    const updatedProject = await prisma.projects.update({
      where: {
        id: projectId
      },
      data: {
        deleted_at: new Date()
      }
    });

    return {
      status: 'success',
      data: updatedProject
    };

  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to delete project'
    };
  } finally {
    await prisma.$disconnect();
  }
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
    user_id: user.id,
    project_id: projectId,
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