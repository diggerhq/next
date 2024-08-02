import { ProjectsCardList } from "@/components/Projects/ProjectsCardList";
import { Search } from "@/components/Search";
import { TeamsCardList } from "@/components/Teams/TeamsCardList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { T } from "@/components/ui/Typography";
import { getLoggedInUserOrganizationRole, getOrganizationTitle } from "@/data/user/organizations";
import { getAllProjectsInOrganization, getProjectsForUser } from "@/data/user/projects";
import { getSlimTeamById, getTeams } from "@/data/user/teams";
import { Tables } from "@/lib/database.types";
import { Enum } from "@/types";
import { serverGetLoggedInUser } from "@/utils/server/serverGetLoggedInUser";
import {
  organizationParamSchema,
  projectsfilterSchema
} from "@/utils/zod-schemas/params";
import { Layers, Plus, Settings } from "lucide-react";
import type { Metadata } from 'next';
import Link from "next/link";
import { Suspense } from "react";
import type { z } from "zod";
import { DashboardClientWrapper } from "./DashboardClientWrapper";
import { DashboardLoadingFallback } from "./DashboardLoadingFallback";
import ProjectsLoadingFallback from "./ProjectsLoadingFallback";
import TeamsLoadingFallback from "./TeamsLoadingFallback";

async function Projects({
  organizationId,
  filters,
  userId,
  userRole,
}: {
  organizationId: string;
  filters: z.infer<typeof projectsfilterSchema>;
  userId: string;
  userRole: Enum<'organization_member_role'>;
}) {
  let projects: Tables<'projects'>[];

  if (userRole === 'admin') {
    projects = await getAllProjectsInOrganization({
      organizationId,
      ...filters,
    });
  } else {
    projects = await getProjectsForUser({
      userId,
      userRole,
      organizationId,
      ...filters,
    });
  }

  const projectWithTeamNames = await Promise.all(projects.map(async (project) => {
    if (project.team_id) {
      try {
        const team = await getSlimTeamById(project.team_id);
        return { ...project, teamName: team?.name || 'Unknown Team' };
      } catch (error) {
        console.error(`Error fetching team for project ${project.id}:`, error);
        return { ...project };
      }
    }
    return project;
  }));

  return <ProjectsCardList projects={projectWithTeamNames} />;
}

async function Teams({
  organizationId,
  filters,
}: {
  organizationId: string;
  filters: z.infer<typeof projectsfilterSchema>;
}) {
  const teams = await getTeams({
    organizationId,
    ...filters,
  });
  return <TeamsCardList teams={teams} />;
}



export type DashboardProps = {
  params: { organizationId: string };
  searchParams: unknown;
};

async function Dashboard({ params, searchParams }: DashboardProps) {
  const { organizationId } = organizationParamSchema.parse(params);
  const validatedSearchParams = projectsfilterSchema.parse(searchParams);
  const { id: userId } = await serverGetLoggedInUser();
  const userRole = await getLoggedInUserOrganizationRole(organizationId);

  return (
    <DashboardClientWrapper>
      <div className="flex justify-between gap-4 w-full">
        <T.H2>Dashboard</T.H2>
        <Link href={`/org/${organizationId}/settings`}>
          <Button className="w-fit" variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Organization Settings
          </Button>
        </Link>
      </div>
      <Card >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Recent Projects
            </CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-4">
                <Search placeholder="Search projects" />
                {/* <MultiSelect
                  options={userTeams.map(team => ({ label: team.name, value: team.id }))}
                  placeholder="Filter by teams"
                /> */}
              </div>
              <Button variant="secondary" size="sm" asChild>
                <Link href={`/org/${organizationId}/projects`}>
                  <Layers className="mr-2 h-4 w-4" />
                  View all projects
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex space-x-4">
                <Link href={`/org/${organizationId}/projects/create`}>
                  <Button variant="default" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>

          <Suspense fallback={<ProjectsLoadingFallback quantity={3} />}>
            <Projects
              organizationId={organizationId}
              filters={validatedSearchParams}
              userId={userId}
              userRole={userRole}
            />
            {validatedSearchParams.query && (
              <p className="mt-4 text-sm text-muted-foreground">
                Searching for{" "}
                <span className="font-medium">{validatedSearchParams.query}</span>
              </p>
            )}
          </Suspense>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle>Recent Teams</CardTitle>
          <div className="flex items-center space-x-4">
            <Search className="w-[200px]" placeholder="Search teams" />
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/org/${organizationId}/teams`}>
                <Layers className="mr-2 h-4 w-4" />
                View all teams
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TeamsLoadingFallback quantity={3} />}>
            <Teams
              organizationId={organizationId}
              filters={validatedSearchParams}
            />
            {validatedSearchParams.query && (
              <p className="mt-4 text-sm text-muted-foreground">
                Searching for{" "}
                <span className="font-medium">{validatedSearchParams.query}</span>
              </p>
            )}
          </Suspense>
        </CardContent>

      </Card>
    </DashboardClientWrapper>
  );
}

export async function generateMetadata({ params }: DashboardProps): Promise<Metadata> {
  const { organizationId } = organizationParamSchema.parse(params);
  const title = await getOrganizationTitle(organizationId);

  return {
    title: `Dashboard | ${title}`,
    description: `View your projects and team members for ${title}`,
  };
}

export default async function OrganizationPage({ params, searchParams }: DashboardProps) {
  return (
    <Suspense fallback={<DashboardLoadingFallback />}>
      <Dashboard params={params} searchParams={searchParams} />
    </Suspense>
  );
}
