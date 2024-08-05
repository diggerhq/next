'use client'

import {
    Table as ShadcnTable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Table } from "@/types";

import { DeleteTeamDialog } from "@/components/DeleteTeamDialog";
import { EditTeamDialog } from "@/components/EditTeamDialog";
import { deleteTeamFromOrganization } from "@/data/admin/teams";
import { useSAToastMutation } from "@/hooks/useSAToastMutation";
import moment from "moment";
import { useRouter } from "next/navigation";


export function TeamsSettingsTable(
    {
        teams,
        isOrganizationAdmin,
        organizationId
    }: {
        teams: Table<'teams'>[];
        isOrganizationAdmin: boolean;
        organizationId: string;
    }
) {

    const router = useRouter();

    const { mutate: deleteTeam, isLoading: isDeletingTeam } = useSAToastMutation(
        async (teamId: number) => {
            return await deleteTeamFromOrganization(teamId, organizationId);
        },
        {
            loadingMessage: "Deleting team...",
            successMessage: "Team deleted successfully!",
            errorMessage: "Failed to delete team",
            onSuccess: () => {
                router.refresh();
            },
        }
    );
    return (<ShadcnTable data-testid="teams-table">
        <TableHeader>
            <TableRow>
                <TableHead> # </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Created On</TableHead>
                <TableHead>Actions</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {teams.map((team, index) => {
                return (
                    <TableRow data-user-id={team.id} key={team.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell data-testid={"member-name"}>
                            {team.name}
                        </TableCell>
                        <TableCell>{moment(team.created_at).format('MMMM D, YYYY')}</TableCell>
                        <TableCell className="flex flex-row gap-4">
                            <EditTeamDialog organizationId={organizationId} teamId={team.id} initialTeamName={team.name} isOrganizationAdmin={isOrganizationAdmin} />
                            <DeleteTeamDialog teamId={team.id} organizationId={organizationId} isOrganizationAdmin={isOrganizationAdmin} teamName={team.name} />
                        </TableCell>
                    </TableRow>
                );
            })}
        </TableBody>
    </ShadcnTable>)
}