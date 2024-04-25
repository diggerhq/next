import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { PageHeading } from "@/components/PageHeading";
import { Pagination } from "@/components/Pagination";
import { Search } from "@/components/Search";
import { T } from "@/components/ui/Typography";
import { getProjects, getProjectsTotalCount } from "@/data/user/projects";
import { organizationParamSchema, projectsfilterSchema } from "@/utils/zod-schemas/params";
import { OrganizationProjectsTable } from "./OrganizationProjectsTable";


export default async function Page({ params, searchParams }: { params: unknown; searchParams: unknown }) {
  const { organizationId } = organizationParamSchema.parse(params);
  const filters = projectsfilterSchema.parse(searchParams);
  const projects = await getProjects({ ...filters, organizationId })
  const totalPages = await getProjectsTotalCount({ ...filters, organizationId });

  return (
    <div className="flex flex-col gap-4 w-full">
      <PageHeading title="Projects" subTitle='View and manage all your projects' />
      <div className="flex justify-between gap-2">
        <div className="md:w-1/3">
          <Search placeholder="Search projects" />
          {filters.query && <p className="text-sm ml-2 ">Searching for <span className="font-bold">{filters.query}</span></p>}
        </div>

        <CreateProjectDialog organizationId={organizationId} />
      </div>
      {projects.length === 0 ? <T.P className="text-muted-foreground my-6">
        🔍 No matching projects found.
      </T.P> : <>
        <OrganizationProjectsTable projects={projects} />
        <Pagination totalPages={totalPages} />
      </>}

    </div>

  )
}
