import {
  createOrganization,
  getOrganizationIdBySlug,
} from '@/data/user/organizations';
import {
  createDefaultUserPrivateInfo,
  createDefaultUserProfile,
} from '@/data/user/user';
import { supabaseAdminClient } from '@/supabase-clients/admin/supabaseAdminClient';
import { toSiteURL } from '@/utils/helpers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const isDevelopment = process.env.NODE_ENV === 'development';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const access_token = requestUrl.searchParams.get('access_token');
  const refresh_token = requestUrl.searchParams.get('refresh_token');
  const next = requestUrl.searchParams.get('next');
  const provider = requestUrl.searchParams.get('provider');
  const supabase = createRouteHandlerClient({ cookies });

  if (access_token && refresh_token) {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      // TODO: find out how user profile and private info are created automatically
      const userId = data.user?.id;
      await createDefaultUserProfile(userId!);
      await createDefaultUserPrivateInfo(userId!);
      const defaultOrgTitle = process.env.DEFAULT_ORG_TITLE || 'digger';
      const defaultOrgSlug = process.env.DEFAULT_ORG_SLUG || 'digger';

      // creating the default org and membership
      try {
        const orgId = await getOrganizationIdBySlug(defaultOrgSlug);
        const { error: orgMemberErrors } = await supabaseAdminClient
          .from('organization_members')
          .insert([
            {
              member_id: userId!,
              organization_id: orgId,
              member_role: 'owner',
            },
          ]);
      } catch (error) {
        createOrganization(defaultOrgTitle, defaultOrgSlug);
      }

      // set meta_data to state that the user has created organisation already so it skips in onboarding screen
      await supabaseAdminClient.auth.admin.updateUserById(userId!, {
        user_metadata: { onboardingHasCreatedOrganization: true },
      });
    } catch (error) {
      console.error('Error setting session:', error);
    }
  }

  let redirectTo = toSiteURL('/dashboard');

  if (next) {
    // decode next param
    const decodedNext = decodeURIComponent(next);
    // validate next param
    redirectTo = toSiteURL(decodedNext);
  }

  return NextResponse.redirect(redirectTo);
}
