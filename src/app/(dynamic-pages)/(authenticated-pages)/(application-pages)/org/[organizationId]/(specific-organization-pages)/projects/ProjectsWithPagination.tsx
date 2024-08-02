import { Pagination } from "@/components/Pagination";
import { getLoggedInUserOrganizationRole } from "@/data/user/organizations";
import { getAllProjectsInOrganization, getProjects, getProjectsCountForUser, getProjectsForUser, getProjectsTotalCount } from "@/data/user/projects";
import { serverGetLoggedInUser } from "@/utils/server/serverGetLoggedInUser";
import { projectsfilterSchema } from "@/utils/zod-schemas/params";
import { OrganizationProjectsTable } from "./OrganizationProjectsTable";

export async function UserProjectsWithPagination({
    organizationId,
    searchParams,
}: { organizationId: string; searchParams: unknown }) {
    const filters = projectsfilterSchema.parse(searchParams);
    const [{ id: userId }, userRole] = await Promise.all([
        serverGetLoggedInUser(),
        getLoggedInUserOrganizationRole(organizationId)
    ]);
    const [projects, totalPages] = await Promise.all([
        getProjectsForUser({ ...filters, organizationId, userRole, userId }),
        getProjectsCountForUser({ ...filters, organizationId, userId }),
    ]);

    return (
        <>
            <OrganizationProjectsTable projects={projects} />
            <Pagination totalPages={totalPages} />
        </>
    );
}

export async function AllProjectsTableWithPagination({
    organizationId,
    searchParams,
}: { organizationId: string; searchParams: unknown }) {
    const filters = projectsfilterSchema.parse(searchParams);
    const [projects, totalPages] = await Promise.all([
        getAllProjectsInOrganization({ ...filters, organizationId }),
        getProjectsTotalCount({ ...filters, organizationId }),
    ]);

    return (
        <>
            <OrganizationProjectsTable projects={projects} />
            <Pagination totalPages={totalPages} />
        </>
    );
}


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