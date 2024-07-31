'use client';

import { updateTeamRole } from '@/data/user/teams';
import { useSAToastMutation } from '@/hooks/useSAToastMutation';
import { Enum } from '@/types';
import { ProjectTeamMemberRoleSelect } from './ProjectTeamMemberRoleSelect';

export function ChangeRole({
    role,
    userId,
    teamId,
}: {
    role: Enum<'project_team_member_role'>;
    userId: string;
    teamId: number;
}) {
    const changeRole = useSAToastMutation(updateTeamRole, {
        loadingMessage: 'Changing role...',
        successMessage: 'Role changed!',
        errorMessage: 'Failed to change role',
    });

    return (
        <ProjectTeamMemberRoleSelect
            value={role}
            isLoading={changeRole.isLoading}
            onChange={(newRole) => {
                changeRole.mutate({
                    userId,
                    role: newRole,
                    teamId,
                });
            }}
        />
    );
}