import { PageHeading } from "@/components/PageHeading";
import { Search } from "@/components/Search";
import { T } from "@/components/ui/Typography";
import { getLoggedInUserOrganizationRole } from "@/data/user/organizations";
import { getProjectsCountForUser, getProjectsListForUser } from "@/data/user/projects";
import { getRunsByProjectId } from "@/data/user/runs";
import { serverGetLoggedInUser } from "@/utils/server/serverGetLoggedInUser";
import {
  commitParamSchema,
  projectsfilterSchema
} from "@/utils/zod-schemas/params";
import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardProps } from "../../../page";
import { ImpactedProjectsDisplay } from "./ImpactedProjectsDisplay";

export const metadata: Metadata = {
  title: "Impacted Projects",
  description: "View projects impacted by this commit.",
};

export default async function ImpactedProjectsPage({
  params,
  searchParams,
}: DashboardProps) {
  const { organizationId, commitId } = commitParamSchema.parse(params);
  const filters = projectsfilterSchema.parse(searchParams);

  const [{ id: userId }, userRole] = await Promise.all([
    serverGetLoggedInUser(),
    getLoggedInUserOrganizationRole(organizationId)
  ]);

  const [projects, totalPages] = await Promise.all([
    getProjectsListForUser({ ...filters, organizationId, userRole, userId }),
    getProjectsCountForUser({ ...filters, organizationId, userId }),
  ]);

  const projectsWithRunIds = await Promise.all(
    projects.map(async (project) => {
      const runs = await getRunsByProjectId(project.id);
      return {
        projectId: project.id,
        runIds: runs.map(run => run.id)
      };
    })
  );

  return (
    <div className="flex flex-col space-y-4 max-w-5xl mt-8">
      <PageHeading
        title={`Impacted Projects `}
        subTitle={`Commit ID : ${commitId}`}
      />
      <div className="md:w-1/3">
        <Search placeholder="Search projects" />
        {filters.query && (
          <p className="text-sm ml-2 mt-4">
            Searching for <span className="font-bold">{filters.query}</span>
          </p>
        )}
      </div>
      <Suspense
        fallback={
          <T.P className="text-muted-foreground my-6">
            Loading impacted projects...
          </T.P>
        }
      >
        <ImpactedProjectsDisplay
          projects={projects}
          projectsWithRunIds={projectsWithRunIds}
        />
      </Suspense>
    </div>
  );
}