import { Pagination } from "@/components/Pagination";
import { getLoggedInUserOrganizationRole } from "@/data/user/organizations";
import { getProjectsCountForUser, getProjectsListForUser } from "@/data/user/projects";
import { serverGetLoggedInUser } from "@/utils/server/serverGetLoggedInUser";
import { projectsfilterSchema } from "@/utils/zod-schemas/params";
import { OrganizationProjectsTable } from "../projects/OrganizationProjectsTable";

export async function UserDriftedProjectsWithPagination({
    organizationId,
    searchParams,
}: { organizationId: string; searchParams: unknown }) {
    const filters = projectsfilterSchema.parse(searchParams);
    const [{ id: userId }, userRole] = await Promise.all([
        serverGetLoggedInUser(),
        getLoggedInUserOrganizationRole(organizationId)
    ]);
    const [projects, totalPages] = await Promise.all([
        getProjectsListForUser({ ...filters, organizationId, userRole, userId, driftedOnly: true }),
        getProjectsCountForUser({ ...filters, organizationId, userId }),
    ]);

    return (
        <>
            <OrganizationProjectsTable projects={projects} />
            <Pagination totalPages={totalPages} />
        </>
    );
}