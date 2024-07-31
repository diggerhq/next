import { PageHeading } from "@/components/PageHeading";
import { Pagination } from "@/components/Pagination";
import { Search } from "@/components/Search";
import { T } from "@/components/ui/Typography";
import { Button } from "@/components/ui/button";
import { getProjects, getProjectsTotalCount } from "@/data/user/projects";
import {
  projectsfilterSchema,
  teamParamSchema
} from "@/utils/zod-schemas/params";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import type { DashboardProps } from "../page";
import { OrganizationProjectsTable } from "./OrganizationProjectsTable";

export async function ProjectsTableWithPagination({
  organizationId,
  teamId,
  searchParams,
}: { organizationId: string; teamId: number | null; searchParams: unknown }) {
  const filters = projectsfilterSchema.parse(searchParams);
  const [projects, totalPages] = await Promise.all([
    getProjects({ ...filters, organizationId, teamId }),
    getProjectsTotalCount({ ...filters, organizationId }),
  ]);

  return (
    <>
      <OrganizationProjectsTable projects={projects} />
      <Pagination totalPages={totalPages} />
    </>
  );
}

export const metadata: Metadata = {
  title: "Projects",
  description: "You can create projects within teams, or within your organization.",
};

export default async function Page({
  params,
  searchParams,
}: DashboardProps) {
  const { organizationId, teamId } = teamParamSchema.parse(params);
  const filters = projectsfilterSchema.parse(searchParams);

  return (
    <div className="flex flex-col space-y-4 max-w-5xl mt-8">
      <PageHeading
        title="Projects"
        subTitle="You can create projects within teams, or within your organization."
      />
      <div className="flex justify-between gap-2">
        <div className="md:w-1/3">
          <Search placeholder="Search projects" />
          {filters.query && (
            <p className="text-sm ml-2 mt-4">
              Searching for <span className="font-bold">{filters.query}</span>
            </p>
          )}
        </div>

        <Link href={`/org/${organizationId}/projects/create`}>
          <Button variant="default" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </Link>
      </div>
      {
        <Suspense
          fallback={
            <T.P className="text-muted-foreground my-6">
              Loading projects...
            </T.P>
          }
        >
          <ProjectsTableWithPagination
            organizationId={organizationId}
            teamId={teamId ?? null}
            searchParams={searchParams}
          />
        </Suspense>
      }
    </div>
  );
}
