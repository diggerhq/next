import { Pagination } from "@/components/Pagination";
import { getTeamAdminUserNameByTeamId, getTeams, getTeamsTotalCount } from "@/data/user/teams";
import { projectsfilterSchema } from "@/utils/zod-schemas/params";
import { OrganizationTeamsTable } from "./OrganizationTeamsTable";

export async function TeamsTableWithPagination({
    organizationId,
    searchParams,
}: { organizationId: string; searchParams: unknown }) {
    const filters = projectsfilterSchema.parse(searchParams);
    const [teams, totalPages, adminNames] = await Promise.all([
        getTeams({ ...filters, organizationId }),
        getTeamsTotalCount({ ...filters, organizationId }),
        Promise.all(
            (await getTeams({ ...filters, organizationId })).map(team =>
                getTeamAdminUserNameByTeamId(team.id)
            )
        )
    ]);

    const teamsWithAdminNames = teams.map((team, index) => ({
        ...team,
        adminName: adminNames[index]
    }));

    return (
        <>
            <OrganizationTeamsTable teams={teamsWithAdminNames} />
            <Pagination totalPages={totalPages} />
        </>
    );
}