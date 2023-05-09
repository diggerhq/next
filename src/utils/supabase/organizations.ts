import { AppSupabaseClient, Enum, Table } from "@/types";
import { User } from "@supabase/supabase-js";

export const updateUserName = async (
  supabase: AppSupabaseClient,
  user: User,
  name: string
) => {
  await supabase
    .from('user_profiles')
    .update({
      full_name: name,
    })
    .eq('id', user.id);
};

export const getAllOrganizationsForUser = async (
  supabase: AppSupabaseClient,
  userId: string
) => {
  const { data: organizations, error: organizationsError } = await supabase.rpc(
    'get_organizations_for_user',
    {
      user_id: userId,
    }
  );
  if (!organizations) {
    throw new Error(organizationsError.message);
  }

  const { data, error } = await supabase
    .from('organizations')
    .select(
      '*, organization_members(id,member_id,member_role, user_profiles(*)), subscriptions(id, prices(id,products(id,name)))'
    )
    .in(
      'id',
      organizations.map((org) => org.organization_id)
    )
    .order('created_at', {
      ascending: false,
    });;
  if (error) {
    throw error;
  }

  return data || [];
};

export const getOrganizationById = async (
  supabase: AppSupabaseClient,
  organizationId: string
) => {
  const { data, error } = await supabase
    .from('organizations')
    // query team_members and team_invitations in one go
    .select('*')
    .eq('id', organizationId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const createOrganization = async (
  supabase: AppSupabaseClient,
  user: User,
  name: string
) => {
  const { data, error } = await supabase
    .from('organizations')
    .insert({
      title: name,
      created_by: user.id,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateOrganizationTitle = async (
  supabase: AppSupabaseClient,
  organizationId: string,
  title: string
): Promise<Table<'organizations'>> => {
  const { data, error } = await supabase
    .from('organizations')
    .update({
      title,
    })
    .eq('id', organizationId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getTeamMembersInOrganization = async (
  supabase: AppSupabaseClient,
  organizationId: string
) => {
  const { data, error } = await supabase
    .from('organization_members')
    .select('*, user_profiles(*)')
    .eq('organization_id', organizationId);

  if (error) {
    throw error;
  }

  return data || [];
};

export const getPendingTeamInvitationsInOrganization = async (
  supabase: AppSupabaseClient,
  organizationId: string
) => {
  const { data, error } = await supabase
    .from('organization_team_invitations')
    .select(
      '*, inviter:user_profiles!inviter_user_id(*), invitee:user_profiles!invitee_user_id(*)'
    )
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  if (error) {
    throw error;
  }

  return data || [];
};


export const getOrganizationSubscription = async (
  supabase: AppSupabaseClient,
  organizationId: string
) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .eq('organization_id', organizationId)
    .in('status', ['trialing', 'active'])
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getUserOrganizationRole = async (
  supabase: AppSupabaseClient,
  userId: string,
  organizationId: string
): Promise<Enum<'organization_member_role'> | null> => {
  const { data, error } = await supabase
    .from('organization_members')
    .select('*')
    .eq('member_id', userId)
    .eq('organization_id', organizationId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.member_role ?? null;
};
