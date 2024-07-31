import { Pagination } from "@/components/Pagination";
import { getProjects, getProjectsTotalCount } from "@/data/user/projects";
import { projectsfilterSchema } from "@/utils/zod-schemas/params";
import { OrganizationProjectsTable } from "../../../(specific-organization-pages)/projects/OrganizationProjectsTable";

export async function TeamProjectsWithPagination({
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