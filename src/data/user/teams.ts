'use server';
import { supabaseAdminClient } from '@/supabase-clients/admin/supabaseAdminClient';
import { createSupabaseUserServerActionClient } from '@/supabase-clients/user/createSupabaseUserServerActionClient';
import { createSupabaseUserServerComponentClient } from '@/supabase-clients/user/createSupabaseUserServerComponentClient';
import { Enum, SAPayload, Table } from '@/types';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';
import { revalidatePath } from 'next/cache';
import {
  getLoggedInUserOrganizationRole,
  getOrganizationAdmins,
  getTeamMembersInOrganization,
} from './organizations';

export async function getSlimTeamById(teamId: number) {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from('teams')
    .select('id,name,organization_id')
    .eq('id', teamId)
    .single();

  if (error) {
    console.error(`Error fetching team with id ${teamId}:`, error);
    return null;
  }
  return data;
}
export const getTeamsInOrganization = async (
  organizationId: string,
): Promise<Table<'teams'>[]> => {
  const supabaseClient = createSupabaseUserServerComponentClient();

  const { data, error } = await supabaseClient
    .from('teams')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('No teams found for organization');
  }
  return data;
};

export const getTeams = async ({
  organizationId,
  query = '',
  page = 1,
  limit = 5,
}: {
  query?: string;
  page?: number;
  organizationId: string;
  limit?: number;
}) => {
  const zeroIndexedPage = page - 1;
  const supabase = createSupabaseUserServerComponentClient();
  let supabaseQuery = supabase
    .from('teams')
    .select('*')
    .eq('organization_id', organizationId)
    .range(zeroIndexedPage * limit, (zeroIndexedPage + 1) * limit - 1);

  if (query) {
    supabaseQuery = supabaseQuery.ilike('name', `%${query}%`);
  }

  const { data, error } = await supabaseQuery.order('created_at', {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const getTeamsTotalCount = async ({
  organizationId,
  query = '',
  page = 1,
  limit = 5,
}: {
  organizationId: string;
  query?: string;
  page?: number;
  limit?: number;
}) => {
  const zeroIndexedPage = page - 1;
  let supabaseQuery = supabaseAdminClient
    .from('teams')
    .select('id', {
      count: 'exact',
      head: true,
    })
    .eq('organization_id', organizationId)
    .range(zeroIndexedPage * limit, (zeroIndexedPage + 1) * limit - 1);

  if (query) {
    supabaseQuery = supabaseQuery.ilike('name', `%${query}%`);
  }

  const { count, error } = await supabaseQuery.order('created_at', {
    ascending: false,
  });

  if (error) {
    throw error;
  }

  if (!count) {
    return 0;
  }

  return Math.ceil(count / limit) ?? 0;
};

export const createTeamAction = async (
  organizationId: string,
  name: string,
): Promise<
  SAPayload<{
    created_at: string | null;
    id: number;
    name: string;
    organization_id: string;
  }>
> => {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const user = await serverGetLoggedInUser();

  const { data, error } = await supabaseClient
    .from('teams')
    .insert({
      name,
      organization_id: organizationId,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  await addUserToTeamAction({
    userId: user.id,
    teamId: data.id,
    role: 'admin',
    organizationId,
  });

  revalidatePath(`/org/${organizationId}`);

  return {
    status: 'success',
    data,
  };
};

export async function getOrganizationOfTeam(teamId: number) {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from('teams')
    .select('organization_id')
    .eq('id', teamId)
    .single();
  if (error) {
    throw error;
  }
  return data.organization_id;
}

export const getUserTeamRole = async (
  userId: string,
  teamId: number,
): Promise<Enum<'project_team_member_role'> | null> => {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('user_id', userId)
    .eq('team_id', teamId);

  const row = data?.[0];

  if (error) {
    throw error;
  }

  return row?.role ?? null;
};

export const getLoggedInUserTeamRole = async (teamId: number) => {
  const user = await serverGetLoggedInUser();
  return getUserTeamRole(user.id, teamId);
};

export const getTeamById = async (teamId: number) => {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getTeamNameById = async (teamId: number) => {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('teams')
    .select('name')
    .eq('id', teamId)
    .single();

  if (error) {
    throw error;
  }

  return data.name;
};

export const getTeamMembersByTeamId = async (teamId: number) => {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('team_members')
    .select('*, user_profiles(*)')
    .eq('team_id', teamId);

  if (error) {
    throw error;
  }

  return data.map((member) => {
    const { user_profiles, ...rest } = member;
    if (!user_profiles) {
      throw new Error('No user profile found for member');
    }
    return {
      ...rest,
      user_profiles: user_profiles,
    };
  });
};

export const getTeamAdminUserNameByTeamId = async (teamId: number) => {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('team_members')
    .select(
      `
      user_profiles (
        full_name
      )
    `,
    )
    .eq('team_id', teamId)
    .eq('role', 'admin')
    .single();

  if (error) {
    throw error;
  }

  return data?.user_profiles?.full_name ?? null;
};

export const getCanLoggedInUserManageTeam = async (
  organizationId: string,
  teamId: number,
) => {
  const [teamRole, orgRole] = await Promise.all([
    getLoggedInUserTeamRole(teamId),
    getLoggedInUserOrganizationRole(organizationId),
  ]);

  let canUserManageTeam = false;

  if (teamRole === 'admin' || orgRole === 'owner' || orgRole === 'admin') {
    canUserManageTeam = true;
  }
  return {
    canUserManageTeam,
    teamRole,
    orgRole,
  };
};

export const updateTeamRole = async ({
  userId,
  teamId,
  role,
}: {
  userId: string;
  teamId: number;
  role: Enum<'project_team_member_role'>;
}): Promise<SAPayload> => {
  const supabase = createSupabaseUserServerActionClient();
  const organizationId = await getOrganizationOfTeam(teamId);
  const { data, error } = await supabase
    .from('team_members')
    .update({ role: role })
    .eq('user_id', userId)
    .eq('team_id', teamId);

  if (error) {
    throw error;
  }

  revalidatePath(`/org/${organizationId}/team/${teamId}`);

  return {
    status: 'success',
  };
};

export const removeUserFromTeam = async ({
  userId,
  teamId,
}: {
  userId: string;
  teamId: number;
}): Promise<SAPayload> => {
  const supabase = createSupabaseUserServerActionClient();
  const organizationId = await getOrganizationOfTeam(teamId);

  const { data, error } = await supabase
    .from('team_members')
    .delete()
    .eq('user_id', userId)
    .eq('team_id', teamId);

  if (error) {
    throw error;
  }
  revalidatePath(`/org/${organizationId}/team/${teamId}`);
  return {
    status: 'success',
  };
};

export const getAddableMembers = async ({
  organizationId,
  teamId,
}: {
  organizationId: string;
  teamId: number;
}) => {
  const [orgMembers, teamMembers, admins] = await Promise.all([
    getTeamMembersInOrganization(organizationId),
    getTeamMembersByTeamId(teamId),
    getOrganizationAdmins(organizationId),
  ]);

  return orgMembers.filter((member) => {
    const isMember = teamMembers.find(
      (teamMember) => teamMember.user_profiles.id === member.user_profiles.id,
    );
    const isAdmin = admins.find(
      (admin) => admin.user_profiles.id === member.user_profiles.id,
    );
    return !isMember && !isAdmin;
  });
};

export const addUserToTeamAction = async ({
  userId,
  teamId,
  role,
  organizationId,
}: {
  userId: string;
  organizationId: string;
  teamId: number;
  role: Enum<'project_team_member_role'>;
}): Promise<
  SAPayload<{
    id: number;
    user_id: string;
    role: Enum<'project_team_member_role'>;
    team_id: number;
  }>
> => {
  const supabase = createSupabaseUserServerComponentClient();
  const rowCount = await supabase
    .from('team_members')
    .select('id')
    .eq('user_id', userId)
    .eq('team_id', teamId);

  if (rowCount.error || rowCount.data?.length > 0) {
    throw new Error('User already in team');
  }

  const { data, error } = await supabase
    .from('team_members')
    .insert({
      user_id: userId,
      role: role,
      team_id: teamId,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }
  revalidatePath(`/organorgization/${organizationId}/team/${teamId}`);
  return {
    status: 'success',
    data,
  };
};
