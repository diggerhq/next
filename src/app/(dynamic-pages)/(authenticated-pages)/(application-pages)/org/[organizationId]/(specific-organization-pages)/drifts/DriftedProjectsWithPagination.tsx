import { Pagination } from "@/components/Pagination";
import { getLoggedInUserOrganizationRole } from "@/data/user/organizations";
import { getAllProjectsListInOrganization, getProjectIdsInOrganization, getProjectsCountForUser, getProjectsList, getProjectsTotalCount, getSlimProjectsForUser } from "@/data/user/projects";
import { serverGetLoggedInUser } from "@/utils/server/serverGetLoggedInUser";
import { projectsfilterSchema } from "@/utils/zod-schemas/params";
import { OrganizationProjectsTable } from "../projects/OrganizationProjectsTable";
import { DriftAlert, generateDummyDriftAlerts } from "./drift-alerts";



export async function UserDriftedProjectsWithPagination({
    organizationId,
    searchParams,
}: { organizationId: string; searchParams: unknown }) {
    const filters = projectsfilterSchema.parse(searchParams);

    const projectIdsForDriftAlerts = await getProjectIdsInOrganization(organizationId, 2);

    // Once drift_alerts table is created, we will use that to fetch the alerts and check the count to be greater than 0
    // For now, we are adding dummy alerts from dummyData.ts 

    // using dummy data to get drifted project ids
    // TODO: once drift_alerts table is created, we will use that to fetch the alerts and check the count to be greater than 0

    const driftAlerts: DriftAlert[] = generateDummyDriftAlerts(projectIdsForDriftAlerts);

    // get unique project ids from the drift alerts
    const driftedProjectIds = Array.from(new Set(driftAlerts.map(alert => alert.project_id)));

    const [{ id: userId }, userRole] = await Promise.all([
        serverGetLoggedInUser(),
        getLoggedInUserOrganizationRole(organizationId),
    ]);

    // const [projects, totalPages] = await Promise.all([
    //     getProjectsListForUser({ ...filters, organizationId, userRole, userId }),
    //     getProjectsCountForUser({ ...filters, organizationId, userId }),
    // ]);

    const [projects, totalPages] = await Promise.all([
        getSlimProjectsForUser({ projectIds: driftedProjectIds, userRole, userId }),
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