import { Pagination } from "@/components/Pagination";
import { T } from "@/components/ui/Typography";
import { getTeamOwnerNameByTeamId, getTeams, getTeamsTotalCount } from "@/data/user/teams";
import { projectsfilterSchema } from "@/utils/zod-schemas/params";
import { OrganizationTeamsTable } from "./OrganizationTeamsTable";

export async function TeamsTableWithPagination({
    organizationId,
    searchParams,
}: { organizationId: string; searchParams: unknown }) {
    const filters = projectsfilterSchema.parse(searchParams);

    try {
        const [teams, totalPages] = await Promise.all([
            getTeams({ ...filters, organizationId }),
            getTeamsTotalCount({ ...filters, organizationId }),
        ]);

        console.log('teams', teams);

        const adminNames = await Promise.all(
            teams.map(team => getTeamOwnerNameByTeamId(team.id))
        );

        const teamsWithAdminNames = teams.map((team, index) => ({
            ...team,
            adminName: adminNames[index] || 'Unknown'
        }));

        if (teamsWithAdminNames.length === 0) {
            return <T.P className="text-muted-foreground my-6">No teams found.</T.P>;
        }

        return (
            <>
                <OrganizationTeamsTable teams={teamsWithAdminNames} />
                <Pagination totalPages={totalPages} />
            </>
        );
    } catch (error) {
        console.error('Error fetching teams data:', error);
        return <T.P className="text-muted-foreground my-6">Error loading teams. Please try again later.</T.P>;
    }
}