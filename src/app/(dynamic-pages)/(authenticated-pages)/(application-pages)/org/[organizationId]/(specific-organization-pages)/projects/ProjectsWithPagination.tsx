import { Pagination } from "@/components/Pagination";
import { getLoggedInUserOrganizationRole } from "@/data/user/organizations";
import { getAllProjectsListInOrganization, getProjectsCountForUser, getProjectsList, getProjectsListForUser, getProjectsTotalCount } from "@/data/user/projects";
import { serverGetLoggedInUser } from "@/utils/server/serverGetLoggedInUser";
import { projectsfilterSchema } from "@/utils/zod-schemas/params";
import { OrganizationProjectsTable } from "./OrganizationProjectsTable";

export type ProjectListType = {
    id: string;
    name: string;
    latest_action_on: string | null;
    created_at: string;
    repo_full_name: string | null;
    slug: string;
}

export async function UserProjectsWithPagination({
    organizationId,
    searchParams,
}: {
    organizationId: string;
    searchParams: unknown;
}) {
    const filters = projectsfilterSchema.parse(searchParams);
    const [{ id: userId }, userRole] = await Promise.all([
        serverGetLoggedInUser(),
        getLoggedInUserOrganizationRole(organizationId)
    ]);
    const [projects, totalPages] = await Promise.all([
        getProjectsListForUser({ ...filters, organizationId, userRole, userId }),
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
        getAllProjectsListInOrganization({ ...filters, organizationId }),
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
        getProjectsList({ ...filters, organizationId, teamId }),
        getProjectsTotalCount({ ...filters, organizationId }),
    ]);

    return (
        <>
            <OrganizationProjectsTable projects={projects} />
            <Pagination totalPages={totalPages} />
        </>
    );
}