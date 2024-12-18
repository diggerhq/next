'use server';
import { RESTRICTED_SLUG_NAMES, SLUG_PATTERN } from '@/constants';
import { supabaseAdminClient } from '@/supabase-clients/admin/supabaseAdminClient';
import { createSupabaseUserServerActionClient } from '@/supabase-clients/user/createSupabaseUserServerActionClient';
import { createSupabaseUserServerComponentClient } from '@/supabase-clients/user/createSupabaseUserServerComponentClient';
import type {
  Enum,
  NormalizedSubscription,
  SAPayload,
  Table,
  UnwrapPromise,
} from '@/types';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { refreshSessionAction } from './session';
import { updateUserProfileMetadata } from './user';

export const getOrganizationIdBySlug = async (slug: string) => {
  const supabaseClient = createSupabaseUserServerComponentClient();

  const { data, error } = await supabaseClient
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    throw error;
  }

  return data.id;
};

export const getOrganizationSlugByOrganizationId = async (
  organizationId: string,
) => {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from('organizations')
    .select('slug')
    .eq('id', organizationId)
    .single();

  if (error) {
    throw error;
  }

  return data.slug;
};

export const createOrganization = async (
  name: string,
  slug: string,
  {
    isOnboardingFlow = false,
    ignoreIfOrgExists = false,
  }: {
    isOnboardingFlow?: boolean;
    ignoreIfOrgExists?: boolean;
  } = {},
): Promise<SAPayload<string>> => {
  try {
    const supabaseClient = createSupabaseUserServerActionClient();
    const user = await serverGetLoggedInUser();

    let organizationId = uuidv4();

    if (RESTRICTED_SLUG_NAMES.includes(slug)) {
      return { status: 'error', message: 'Slug is restricted' };
    }

    if (!SLUG_PATTERN.test(slug)) {
      return {
        status: 'error',
        message: 'Slug does not match the required pattern',
      };
    }

    const { error: insertError } = await supabaseClient
      .from('organizations')
      .insert({
        title: name,
        id: organizationId,
        slug: slug,
      });

    if (insertError) {
      console.error('Error inserting organization:', insertError);
      // if set we simply get the org if it already exists
      if (ignoreIfOrgExists) {
        try {
          organizationId = await getOrganizationIdBySlug(slug);
        } catch (fetchError) {
          return { status: 'error', message: fetchError.message };
        }
      } else {
        return { status: 'error', message: insertError.message };
      }
    }

    const { error: orgMemberErrors } = await supabaseAdminClient
      .from('organization_members')
      .insert([
        {
          member_id: user.id,
          organization_id: organizationId,
          member_role: 'owner',
        },
      ]);

    if (orgMemberErrors) {
      console.error('Error inserting organization member:', orgMemberErrors);
      return { status: 'error', message: orgMemberErrors.message };
    }

    // Why are we checking for onboarding deep in the data layer? Bad code.
    if (isOnboardingFlow) {
      const { error: updateError } = await supabaseClient
        .from('user_profiles')
        .update({ default_organization: organizationId })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user private info:', updateError);
        return { status: 'error', message: updateError.message };
      }

      try {
        await updateUserProfileMetadata(user.id, {
          has_created_organization: true,
        });
      } catch (e) {
        console.error('Error updating user metadata:', e.message);
        return {
          status: 'error',
          message: e.message,
        };
      }

      const refreshSessionResponse = await refreshSessionAction();
      if (refreshSessionResponse.status === 'error') {
        console.error('Error refreshing session:', refreshSessionResponse);
        return refreshSessionResponse;
      }
    }

    revalidatePath('/org/[organizationId]', 'layout');
    return { status: 'success', data: organizationId };
  } catch (error) {
    console.error('Unexpected error in createOrganization:', error);
    return { status: 'error', message: 'An unexpected error occurred' };
  }
};

export async function fetchSlimOrganizations() {
  const currentUser = await serverGetLoggedInUser();
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data: organizations, error: organizationsError } =
    await supabaseClient
      .from('organization_members')
      .select('organization_id')
      .eq('member_id', currentUser.id);

  if (organizationsError) {
    throw organizationsError;
  }

  const { data, error } = await supabaseClient
    .from('organizations')
    .select('id,title,slug')
    .in(
      'id',
      organizations.map((org) => org.organization_id),
    )
    .order('created_at', {
      ascending: false,
    });
  if (error) {
    throw error;
  }
  return data || [];
}

export const getSlimOrganizationById = async (organizationId: string) => {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const { data, error } = await supabaseClient
    .from('organizations')
    .select('id,title')
    .eq('id', organizationId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getAllOrganizationsForUser = async (userId: string) => {
  const supabase = createSupabaseUserServerComponentClient();
  const { data: organizations, error: organizationsError } = await supabase.rpc(
    'get_organizations_for_user',
    {
      user_id: userId,
    },
  );
  if (!organizations) {
    throw new Error(organizationsError.message);
  }

  const { data, error } = await supabase
    .from('organizations')
    .select(
      '*, organization_members(id,member_id,member_role, user_profiles(*)), subscriptions(id, prices(id,products(id,name)))',
    )
    .in(
      'id',
      organizations.map((org) => org.organization_id),
    )
    .order('created_at', {
      ascending: false,
    });
  if (error) {
    throw error;
  }

  return data || [];
};

export type InitialOrganizationListType = UnwrapPromise<
  ReturnType<typeof getAllOrganizationsForUser>
>;

export const getOrganizationById = async (organizationId: string) => {
  const supabaseClient = createSupabaseUserServerComponentClient();

  const { data, error } = await supabaseClient
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

export const getOrganizationTitle = async (organizationId: string) => {
  const supabaseClient = createSupabaseUserServerComponentClient();

  const { data, error } = await supabaseClient
    .from('organizations')
    // query team_members and team_invitations in one go
    .select('id,title')
    .eq('id', organizationId)
    .single();

  if (error) {
    throw error;
  }

  return data.title;
};

export const getLoggedInUserOrganizationRole = async (
  organizationId: string,
): Promise<Enum<'organization_member_role'>> => {
  const { id: userId } = await serverGetLoggedInUser();
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('organization_members')
    .select('*')
    .eq('member_id', userId)
    .eq('organization_id', organizationId)
    .single();

  if (error) {
    console.log(
      'error in getloggedinUserOrganizationRole:',
      userId,
      organizationId,
      error,
    );
    throw error;
  } else if (!data) {
    throw new Error('User is not a member of this organization');
  }

  return data.member_role;
};

export const updateOrganizationInfo = async (
  organizationId: string,
  title: string,
  slug: string,
): Promise<SAPayload<Table<'organizations'>>> => {
  'use server';
  const supabase = createSupabaseUserServerActionClient();
  const { data, error } = await supabase
    .from('organizations')
    .update({
      title,
      slug,
    })
    .eq('id', organizationId)
    .select('*')
    .single();

  if (error) {
    return { status: 'error', message: error.message };
  }

  revalidatePath('/org/[organizationId]', 'layout');

  return { status: 'success', data };
};

export const getNormalizedOrganizationSubscription = async (
  organizationId: string,
): Promise<NormalizedSubscription> => {
  const supabase = createSupabaseUserServerComponentClient();
  const [organizationSubscriptionsResponse, byOrganizationsResponse] =
    await Promise.all([
      supabase
        .from('subscriptions')
        .select('*, prices(*, products(*))')
        .eq('organization_id', organizationId)
        .in('status', ['trialing', 'active']),
      supabase
        .from('billing_bypass_organizations')
        .select('*')
        .eq('id', organizationId)
        .single(),
    ]);

  const { data: bypassOrganizations, error: bypassOrganizationsError } =
    byOrganizationsResponse;

  if (bypassOrganizationsError) {
    // ignore this is the likely case.
  }

  if (bypassOrganizations) {
    return {
      type: 'bypassed_enterprise_organization',
    };
  }

  const { data: subscriptions, error } = organizationSubscriptionsResponse;

  if (error) {
    throw error;
  }

  if (!subscriptions || subscriptions.length === 0) {
    return {
      type: 'no-subscription',
    };
  }

  try {
    const subscription = subscriptions[0];
    console.log(subscription);

    const price = Array.isArray(subscription.prices)
      ? subscription.prices[0]
      : subscription.prices;
    if (!price) {
      throw new Error('No price found');
    }

    const product = Array.isArray(price.products)
      ? price.products[0]
      : price.products;
    if (!product) {
      throw new Error('No product found');
    }

    if (subscription.status === 'trialing') {
      if (!subscription.trial_start || !subscription.trial_end) {
        throw new Error('No trial start or end found');
      }
      return {
        type: 'trialing',
        trialStart: subscription.trial_start,
        trialEnd: subscription.trial_end,
        product: product,
        price: price,
        subscription,
      };
    } else if (subscription.status) {
      return {
        type: subscription.status,
        product: product,
        price: price,
        subscription,
      };
    } else {
      return {
        type: 'no-subscription',
      };
    }
  } catch (err) {
    return {
      type: 'no-subscription',
    };
  }
};

export const getActiveProductsWithPrices = async () => {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .eq('is_visible_in_ui', true)
    .order('unit_amount', { foreignTable: 'prices' });

  if (error) {
    throw error;
  }

  return data || [];
};

export const getPendingInvitationsInOrganization = async (
  organizationId: string,
) => {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('organization_join_invitations')
    .select(
      '*, inviter:user_profiles!inviter_user_id(*), invitee:user_profiles!invitee_user_id(*)',
    )
    .eq('organization_id', organizationId)
    .eq('status', 'active');

  if (error) {
    throw error;
  }

  return data || [];
};
export const getTeamMembersInOrganization = async (organizationId: string) => {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('organization_members')
    .select('*, user_profiles(*)')
    .eq('organization_id', organizationId);

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

export const getOrganizationAdmins = async (organizationId: string) => {
  const supabase = createSupabaseUserServerComponentClient();
  const { data, error } = await supabase
    .from('organization_members')
    .select('*, user_profiles(*)')
    .eq('organization_id', organizationId)
    .or('member_role.eq.admin,member_role.eq.owner');

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

export const getDefaultOrganization = async () => {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const user = await serverGetLoggedInUser();
  const { data, error } = await supabaseClient
    .from('user_profiles')
    .select('id, default_organization')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error(`Failed to get default organisation for user ${user.id}`);
    throw error;
  }

  return data.default_organization;
};

export async function setDefaultOrganization(
  organizationId: string,
): Promise<SAPayload> {
  const supabaseClient = createSupabaseUserServerComponentClient();
  const user = await serverGetLoggedInUser();

  const { error: updateError } = await supabaseClient
    .from('user_profiles')
    .update({ default_organization: organizationId })
    .eq('id', user.id);

  if (updateError) {
    return { status: 'error', message: updateError.message };
  }

  revalidatePath('/org/[organizationId]', 'layout');
  return { status: 'success' };
}

export async function deleteOrganization(
  organizationId: string,
): Promise<SAPayload<string>> {
  const supabaseClient = createSupabaseUserServerActionClient();
  const { error } = await supabaseClient
    .from('organizations')
    .delete()
    .eq('id', organizationId);

  if (error) {
    return { status: 'error', message: error.message };
  }

  revalidatePath('/org/[organizationId]', 'layout');
  return {
    status: 'success',
    data: `Organization ${organizationId} deleted successfully`,
  };
}

export const updateOrganizationSlug = async (
  organizationId: string,
  newSlug: string,
): Promise<SAPayload<string>> => {
  if (RESTRICTED_SLUG_NAMES.includes(newSlug)) {
    return { status: 'error', message: 'Slug is restricted' };
  }

  if (!SLUG_PATTERN.test(newSlug)) {
    return {
      status: 'error',
      message: 'Slug does not match the required pattern',
    };
  }

  const supabaseClient = createSupabaseUserServerActionClient();
  const { error } = await supabaseClient
    .from('organizations')
    .update({ slug: newSlug })
    .eq('id', organizationId);

  if (error) {
    return { status: 'error', message: error.message };
  }

  revalidatePath('/org/[organizationId]', 'layout');
  return { status: 'success', data: `Slug updated to ${newSlug}` };
};

/**
 * This is the organization that the user will be redirected to once they login
 * or when they go to the /dashboard page
 */
export async function getInitialOrganizationToRedirectTo(): Promise<
  SAPayload<string>
> {
  const [slimOrganizations, defaultOrganizationId] = await Promise.all([
    fetchSlimOrganizations(),
    getDefaultOrganization(),
  ]);

  const firstOrganization = slimOrganizations[0];

  if (defaultOrganizationId) {
    return {
      data: defaultOrganizationId,
      status: 'success',
    };
  }

  // this condition is unreachable as the parent ../layout component ensures at least
  // one organization exists
  if (!firstOrganization) {
    return {
      message: 'No organizations found',
      status: 'error',
    };
  }

  return {
    data: firstOrganization.id,
    status: 'success',
  };
}

export async function getMaybeInitialOrganizationToRedirectTo(): Promise<
  SAPayload<string | null>
> {
  const initialOrganization = await getInitialOrganizationToRedirectTo();
  if (initialOrganization.status === 'error') {
    return {
      data: null,
      status: 'success',
    };
  }
  return initialOrganization;
}
