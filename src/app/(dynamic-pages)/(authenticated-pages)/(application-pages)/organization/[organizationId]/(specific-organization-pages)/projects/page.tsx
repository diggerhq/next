import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { PageHeading } from "@/components/PageHeading";
import { Pagination } from "@/components/Pagination";
import { Search } from "@/components/Search";
import { T } from "@/components/ui/Typography";
import { getProjects, getProjectsTotalCount } from "@/data/user/projects";
import { organizationParamSchema, projectsfilterSchema } from "@/utils/zod-schemas/params";
import { Suspense } from "react";
import { OrganizationProjectsTable } from "./OrganizationProjectsTable";


export default async function Page({ params, searchParams }: { params: unknown; searchParams: unknown }) {
  const { organizationId } = organizationParamSchema.parse(params);
  const filters = projectsfilterSchema.parse(searchParams);
  const [projects, totalPages] = await Promise.all([
    getProjects({ ...filters, organizationId }),
    getProjectsTotalCount({ ...filters, organizationId })
  ]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <PageHeading title="Projects" subTitle='You can create projects within teams, or within your organization.' />
      <div className="flex justify-between gap-2">
        <div className="md:w-1/3">
          <Search placeholder="Search projects" />
          {filters.query && <p className="text-sm ml-2 mt-4">Searching for <span className="font-bold">{filters.query}</span></p>}
        </div>

        <CreateProjectDialog organizationId={organizationId} />
      </div>
      {
        <Suspense fallback={<T.P className="text-muted-foreground my-6">
          Loading projects...
        </T.P>}>
          <OrganizationProjectsTable projects={projects} />
          <Pagination totalPages={totalPages} />
        </Suspense>
      }
    </div>

  )
}
