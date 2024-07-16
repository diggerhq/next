import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { ProjectsCardList } from "@/components/Projects/ProjectsCardList";
import { Search } from "@/components/Search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrganizationTitle } from "@/data/user/organizations";
import { getProjects } from "@/data/user/projects";
import {
  organizationParamSchema,
  projectsfilterSchema
} from "@/utils/zod-schemas/params";
import { FileText, Layers } from "lucide-react";
import type { Metadata } from 'next';
import Link from "next/link";
import { Suspense } from "react";
import type { z } from "zod";
import { DashboardClientWrapper } from "./DashboardClientWrapper";
import { DashboardLoadingFallback } from "./DashboardLoadingFallback";
import ProjectsLoadingFallback from "./ProjectsLoadingFallback";
import { OrganizationGraphs } from "./_graphs/OrganizationGraphs";

async function Projects({
  organizationId,
  filters,
}: {
  organizationId: string;
  filters: z.infer<typeof projectsfilterSchema>;
}) {
  const projects = await getProjects({
    organizationId,
    ...filters,
  });
  return <ProjectsCardList projects={projects} />;
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
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <CreateProjectDialog organizationId={organizationId} />
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
      <OrganizationGraphs />
    </DashboardClientWrapper>
  );
}

export async function generateMetadata({ params }: DashboardProps): Promise<Metadata> {
  const { organizationId } = organizationParamSchema.parse(params);
  console.log('------------------------------------')
  console.log('Params', params);
  console.log('Organization id', organizationId);
  console.log('------------------------------------')
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
