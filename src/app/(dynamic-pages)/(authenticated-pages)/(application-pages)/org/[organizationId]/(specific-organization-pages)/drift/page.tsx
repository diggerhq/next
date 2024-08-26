import { PageHeading } from "@/components/PageHeading";
import { Search } from "@/components/Search";
import { T } from "@/components/ui/Typography";
import {
  projectsfilterSchema,
  teamParamSchema
} from "@/utils/zod-schemas/params";
import type { Metadata } from "next";
import { Suspense } from "react";
import type { DashboardProps } from "../page";
import { UserDriftedProjectsWithPagination } from "./DriftedProjectsWithPagination";

export const metadata: Metadata = {
  title: "Projects",
  description: "You can create projects within teams, or within your organization.",
};

export default async function DriftsPage({
  params,
  searchParams,
}: DashboardProps) {
  const { organizationId, teamId } = teamParamSchema.parse(params);
  const filters = projectsfilterSchema.parse(searchParams);

  return (
    <div className="flex flex-col space-y-4 max-w-5xl mt-8">
      <PageHeading
        title="Drifted projects (alpha)"
      />
      <div className="md:w-1/3">
        <Search placeholder="Search projects" />
        {filters.query && (
          <p className="text-sm ml-2 mt-4">
            Searching for <span className="font-bold">{filters.query}</span>
          </p>
        )}
      </div>;
      {
        <Suspense
          fallback={
            <T.P className="text-muted-foreground my-6">
              Loading drifts...
            </T.P>
          }
        >
          <UserDriftedProjectsWithPagination
            organizationId={organizationId}
            searchParams={searchParams}
          />
        </Suspense>
      }
    </div>
  );
}
