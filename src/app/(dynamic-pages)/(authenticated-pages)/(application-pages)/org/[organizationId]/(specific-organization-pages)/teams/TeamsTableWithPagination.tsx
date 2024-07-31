import { Pagination } from "@/components/Pagination";
import { getTeams, getTeamsTotalCount } from "@/data/user/teams";
import { projectsfilterSchema } from "@/utils/zod-schemas/params";
import { OrganizationTeamsTable } from "./OrganizationTeamsTable";

export async function TeamsTableWithPagination({
    organizationId,
    searchParams,
}: { organizationId: string; searchParams: unknown }) {
    const filters = projectsfilterSchema.parse(searchParams);
    const [teams, totalPages] = await Promise.all([
        getTeams({ ...filters, organizationId }),
        getTeamsTotalCount({ ...filters, organizationId }),
    ]);

    return (
        <>
            <OrganizationTeamsTable teams={teams} />
            <Pagination totalPages={totalPages} />
        </>
    );
}