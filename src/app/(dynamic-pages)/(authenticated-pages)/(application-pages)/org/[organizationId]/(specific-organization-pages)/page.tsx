import { ProjectsCardList } from "@/components/Projects/ProjectsCardList";
import { Search } from "@/components/Search";
import { TeamsCardList } from "@/components/Teams/TeamsCardList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrganizationTitle } from "@/data/user/organizations";
import { getAllProjectsInOrganization } from "@/data/user/projects";
import { getSlimTeamById, getTeams } from "@/data/user/teams";
import {
  organizationParamSchema,
  projectsfilterSchema
} from "@/utils/zod-schemas/params";
import { Layers, Plus } from "lucide-react";
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
}: {
  organizationId: string;
  filters: z.infer<typeof projectsfilterSchema>;
}) {
  const projects = await getAllProjectsInOrganization({
    organizationId,
    ...filters,
  });
  const projectWithTeamNames = await Promise.all(projects.map(async (project) => {
    if (project.team_id) {
      const team = await getSlimTeamById(project.team_id);
      const projectWithTeamName = { ...project, teamName: team.name };
      return projectWithTeamName;
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

  return (
    <DashboardClientWrapper>
      <Card >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight">Dashboard</CardTitle>
          <div className="flex space-x-4">
            <Link href={`/org/${organizationId}/projects/create`}>
              <Button variant="default" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">Recent Projects</h2>
            <div className="flex items-center space-x-4">
              <Search className="w-[200px]" placeholder="Search projects" />
              <Button variant="secondary" size="sm" asChild>
                <Link href={`/org/${organizationId}/projects`}>
                  <Layers className="mr-2 h-4 w-4" />
                  View all projects
                </Link>
              </Button>
            </div>
          </div>
          <Suspense fallback={<ProjectsLoadingFallback quantity={3} />}>
            <Projects
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
  console.log('Organization title', title);

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
