'use client';
import { T } from '@/components/ui/Typography';
import { Enum, UnwrapPromise } from '@/types';
import { getTeamMembersByTeamId } from '@/utils/supabase/teams';
import { AddUserToTeamDialog } from './AddUserToTeamDialog';
import { ConfirmRemoveUserFromTeamDialog } from './ConfirmRemoveUserFromTeamDialog';
import { ProjectTeamMemberRoleSelect } from './ProjectTeamMemberRoleSelect';
import { useTeamContext } from '@/contexts/TeamContext';
import { useMutation } from '@tanstack/react-query';
import { ComponentPropsWithoutRef, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  ShadcnTable,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table/ShadcnTable';

export function ProjectTeamMembersTable({
  teamMembers,
  teamId,
  updateUserRoleInTeamAction,
  removeUserFromTeamAction,
  addUserToTeamAction,
}: {
  teamMembers: UnwrapPromise<ReturnType<typeof getTeamMembersByTeamId>>;
  teamId: number;
  updateUserRoleInTeamAction: ({
    userId,
    role,
    teamId,
  }: {
    userId: string;
    role: Enum<'project_team_member_role'>;
    teamId: number;
  }) => Promise<void>;
  removeUserFromTeamAction: ({
    userId,
    teamId,
  }: {
    userId: string;
    teamId: number;
  }) => Promise<void>;
} & ComponentPropsWithoutRef<typeof AddUserToTeamDialog>) {
  const { canUserManageTeam } = useTeamContext();
  const updateRoleToastRef = useRef<string | null>(null);
  const removeUserToastRef = useRef<string | null>(null);
  const router = useRouter();
  const { mutate: updateRole } = useMutation(
    async ({
      userId,
      teamId,
      role,
    }: {
      userId: string;
      teamId: number;
      role: Enum<'project_team_member_role'>;
    }) => {
      return updateUserRoleInTeamAction({
        userId,
        teamId,
        role,
      });
    },
    {
      onMutate: () => {
        updateRoleToastRef.current = toast.loading('Updating user role...');
      },
      onSuccess: () => {
        toast.success('User role updated!', {
          id: updateRoleToastRef.current ?? undefined,
        });
        router.refresh();
      },
      onError: (error: Error) => {
        toast.error(String(error), {
          id: updateRoleToastRef.current ?? undefined,
        });
      },
    }
  );
  const { mutate: removeUser } = useMutation(
    async ({ userId, teamId }: { userId: string; teamId: number }) => {
      return removeUserFromTeamAction({
        userId,
        teamId,
      });
    },
    {
      onMutate: () => {
        removeUserToastRef.current = toast.loading(
          'Removing user from team...'
        );
      },
      onSuccess: (_data, { teamId }) => {
        toast.success('User removed from team!', {
          id: removeUserToastRef.current ?? undefined,
        });
        router.refresh();
      },
      onError: (error: Error) => {
        toast.error(String(error), {
          id: removeUserToastRef.current ?? undefined,
        });
      },
    }
  );
  return (
    <div className="border border-neutral-200 bg-white rounded-xl ">
      <div className="py-8 pb-6 sm:px-8 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <div className="flex gap-2 justify-between">
              <h3 className="font-semibold border-0 leading-0 tracking-tight text-2xl text-gray-700">
                Team Members
              </h3>
              {canUserManageTeam ? (
                <AddUserToTeamDialog
                  addUserToTeamAction={addUserToTeamAction}
                />
              ) : null}
            </div>
            <p className="text-base -mt-1 text-gray-700">
              A list of all users in the team and their roles.
            </p>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <ShadcnTable>
                  <TableHeader>
                    <TableRow>
                      <TableHead scope="col">User</TableHead>{' '}
                      <TableHead scope="col">Name</TableHead>
                      <TableHead scope="col">Role</TableHead>
                      <TableHead scope="col">
                        <span className="sr-only">Change Role</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member, index) => {
                      const userProfile = Array.isArray(member.user_profiles)
                        ? member.user_profiles[0]
                        : member.user_profiles;
                      if (!userProfile) {
                        throw new Error('userProfile is undefined');
                      }
                      return (
                        <TableRow key={member.id}>
                          <TableCell>{index + 1}</TableCell>{' '}
                          <TableCell>{userProfile.full_name}</TableCell>
                          <TableCell>{member.role}</TableCell>
                          <TableCell>
                            {canUserManageTeam ? (
                              <div className="flex gap-1 items-center">
                                <ProjectTeamMemberRoleSelect
                                  value={member.role}
                                  onChange={(role) => {
                                    updateRole({
                                      role,
                                      teamId,
                                      userId: member.user_id,
                                    });
                                    // Handle role change here
                                  }}
                                />
                                <ConfirmRemoveUserFromTeamDialog
                                  onConfirm={() => {
                                    removeUser({
                                      teamId,
                                      userId: member.user_id,
                                    });
                                  }}
                                />
                              </div>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </ShadcnTable>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}