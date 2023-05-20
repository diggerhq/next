import { AppSupabaseClient, AuthProvider, Table } from '@/types';
import { User } from '@supabase/supabase-js';
import { errors } from './errors';
import { toSiteURL } from './helpers';

export const getActiveProductsWithPrices = async (
  supabase: AppSupabaseClient
) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('unit_amount', { foreignTable: 'prices' });

  if (error) {
    errors.add(error.message);
    throw error;
  }

  return data || [];
};

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
    });
  if (error) {
    errors.add(error.message);
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
    errors.add(error.message);
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
    errors.add(error.message);
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
    errors.add(error.message);
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
    errors.add(error.message);
    throw error;
  }

  return data || [];
};

export const getPendingTeamInvitationsInOrganization = async (
  supabase: AppSupabaseClient,
  organizationId: string
) => {
  const { data, error } = await supabase
    .from('organization_join_invitations')
    .select(
      '*, inviter:user_profiles!inviter_user_id(*), invitee:user_profiles!invitee_user_id(*)'
    )
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  if (error) {
    errors.add(error.message);
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
    errors.add(error.message);
    throw error;
  }

  return data;
};

export const getUserProfile = async (
  supabase: AppSupabaseClient,
  userId: string
): Promise<Table<'user_profiles'>> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    errors.add(error.message);
    throw error;
  }

  return data;
};

export async function getIsAppAdmin(
  supabaseClient: AppSupabaseClient,
  authUser: User
): Promise<boolean> {
  const { data: isUserAppAdmin, error } = await supabaseClient
    .rpc('check_if_user_is_app_admin', {
      user_id: authUser.id,
    })
    .single();
  if (error) {
    throw error;
  }

  return isUserAppAdmin;
}

export const updateUserProfileNameAndAvatar = async (
  supabase: AppSupabaseClient,
  userId: string,
  {
    fullName,
    avatarUrl,
  }: {
    fullName?: string;
    avatarUrl?: string;
  }
) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      full_name: fullName,
      avatar_url: avatarUrl,
    })
    .eq('id', userId)
    .single();

  if (error) {
    errors.add(error.message);
    throw error;
  }

  return data;
};

export const getUserOrganizationRole = async (
  supabase: AppSupabaseClient,
  userId: string,
  organizationId: string
) => {
  const { data, error } = await supabase
    .from('organization_members')
    .select('member_id, member_role')
    .eq('member_id', userId)
    .eq('organization_id', organizationId)
    .single();

  if (error) {
    errors.add(error.message);
    throw error;
  }

  return data;
};

/* ==================== */
/* Maintenance mode */
/* ==================== */

export const getIsAppInMaintenanceMode = async (
  supabaseClient: AppSupabaseClient
): Promise<boolean> => {
  const { data, error } = await supabaseClient.rpc(
    'is_app_in_maintenance_mode'
  );

  if (error) {
    errors.add(error.message);
    throw error;
  }

  return data;
};

/* ==================== */
/* AUTH */
/* ==================== */

export const signInWithMagicLink = async (
  supabase: AppSupabaseClient,
  email: string
) => {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: toSiteURL('/check-auth'),
    },
  });

  if (error) {
    errors.add(error.message);
    throw error;
  }
};

export const signInWithPassword = async (
  supabase: AppSupabaseClient,
  email: string,
  password: string
) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    errors.add(error.message);
    throw error;
  }
};

export const resetPassword = async (
  supabase: AppSupabaseClient,
  email: string
) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: toSiteURL('/update-password'),
  });

  if (error) {
    errors.add(error.message);
    throw error;
  }
};

export const updatePassword = async (
  supabase: AppSupabaseClient,
  password: string
) => {
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    errors.add(error.message);
    throw error;
  }
};

export const signInWithProvider = async (
  supabase: AppSupabaseClient,
  provider: AuthProvider
) => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: toSiteURL('/check-auth'),
    },
  });

  if (error) {
    errors.add(error.message);
    throw error;
  }
};

export const signUp = async (
  supabase: AppSupabaseClient,
  email: string,
  password: string
) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: toSiteURL('/'),
    },
  });

  if (error) {
    errors.add(error.message);
    throw error;
  }
};

/* ==================== */
/* Teams */
/* ==================== */

export const createTeam = async (
  supabase: AppSupabaseClient,
  organizationId: string,
  name: string
) => {
  const { data, error } = await supabase
    .from('teams')
    .insert({
      name,
      organization_id: organizationId,
    })
    .select('*')
    .single();

  if (error) {
    errors.add(error.message);
    throw error;
  }

  return data;
};
