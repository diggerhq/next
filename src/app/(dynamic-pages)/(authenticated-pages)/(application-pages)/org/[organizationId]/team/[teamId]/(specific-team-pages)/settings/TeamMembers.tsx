import { T } from '@/components/ui/Typography';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    getOrganizationAdmins,
    getOrganizationTitle,
} from '@/data/user/organizations';
import {
    getAddableMembers,
    getCanLoggedInUserManageTeam,
    getTeamMembersByTeamId,
} from '@/data/user/teams';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { AddUserToTeamDialog } from './AddUserToTeamDialog';
import { ChangeRole } from './ChangeRole';
import { RemoveUserDialog } from './RemoveUserDialog';

async function AddUserToTeam({
    organizationId,
    teamId,
}: {
    organizationId: string;
    teamId: number;
}) {
    const addableMembers = await getAddableMembers({
        organizationId,
        teamId,
    });

    if (addableMembers.length === 0) {
        return (
            <Card className='bg-muted/50 w-full px-0'>
                <CardContent className='flex flex-row justify-between gap-4 px-0 pb-0'>
                    <CardHeader>
                        <CardTitle>Invite Members</CardTitle>
                        <CardDescription>Add new members to your team</CardDescription>
                    </CardHeader>
                    <CardFooter className='pt-4 py-0'>
                        <Button asChild>
                            <Link href={`/org/${organizationId}/settings/members`}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Invite to Organization
                            </Link>
                        </Button>
                    </CardFooter>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className='bg-muted/50 w-full px-0'>
            <CardContent className='flex flex-row justify-between gap-4 px-0 pb-0'>
                <CardHeader>
                    <CardTitle>Invite Members</CardTitle>
                    <CardDescription>Add new members to your team</CardDescription>
                </CardHeader>
                <CardFooter className='pt-4 py-0'>
                    <AddUserToTeamDialog
                        organizationId={organizationId}
                        teamId={teamId}
                        addableMembers={addableMembers}
                    />
                </CardFooter>
            </CardContent>
        </Card>
    );
}

export async function AutomaticTeamAdmins({
    organizationId,
}: {
    organizationId: string;
}) {
    const teamAdmins = await getOrganizationAdmins(organizationId);
    const organizationTitle = await getOrganizationTitle(organizationId);
    const autoTeamAdminList = teamAdmins.map((admin, index) => {
        const userProfile = Array.isArray(admin.user_profiles)
            ? admin.user_profiles[0]
            : admin.user_profiles;
        if (!userProfile) {
            throw new Error('userProfile is undefined');
        }
        return {
            rowNo: index + 1,
            name: userProfile.full_name,
            role: admin.member_role,
            id: admin.id,
        };
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Admins</CardTitle>
                <CardDescription>
                    Organization admins of {organizationTitle} who are automatically team admins
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {autoTeamAdminList.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>{member.rowNo}</TableCell>
                                <TableCell>{member.name}</TableCell>
                                <TableCell className="uppercase">{member.role}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export async function TeamMembers({
    teamId,
    organizationId,
}: {
    teamId: number;
    organizationId: string;
}) {
    const teamMembers = await getTeamMembersByTeamId(teamId);
    const loggedInUser = await serverGetLoggedInUser();
    const { canUserManageTeam } = await getCanLoggedInUserManageTeam(
        organizationId,
        teamId,
    );
    const teamMemberList = teamMembers.map((member, index) => {
        const userProfile = Array.isArray(member.user_profiles)
            ? member.user_profiles[0]
            : member.user_profiles;
        if (!userProfile) {
            throw new Error('userProfile is undefined');
        }
        return {
            rowNo: index + 1,
            name: userProfile.full_name,
            role: member.role,
            id: member.id,
            userId: userProfile.id,
        };
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                    {teamMemberList.length
                        ? 'Members who have been manually added to the team'
                        : 'There are no team members in this team'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {teamMemberList.length > 0 && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Name</TableHead>
                                {canUserManageTeam ? (
                                    <>
                                        <TableHead>Change Role</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </>
                                ) : (
                                    <TableHead>Role</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {teamMemberList.map((member) => (
                                <TableRow key={member.id}>
                                    <TableCell>{member.rowNo}</TableCell>
                                    <TableCell>{member.name}</TableCell>
                                    {canUserManageTeam ? (
                                        <>
                                            <TableCell className='w-1/3'>
                                                <ChangeRole
                                                    userId={member.userId}
                                                    teamId={teamId}
                                                    role={member.role}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <RemoveUserDialog
                                                    isSameUser={member.userId === loggedInUser.id}
                                                    teamId={teamId}
                                                    userId={member.userId}
                                                />
                                            </TableCell>
                                        </>
                                    ) : (
                                        <TableCell>{member.role}</TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
            {canUserManageTeam && (
                <CardFooter>
                    <Suspense fallback={<T.P>Loading...</T.P>}>
                        <AddUserToTeam organizationId={organizationId} teamId={teamId} />
                    </Suspense>
                </CardFooter>
            )}
        </Card>
    );
}