import { createOrganization } from '@/data/user/organizations';
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
      // await createDefaultUserProfile(userId!);
      // await createDefaultUserPrivateInfo(userId!);
      const defaultOrgTitle = process.env.DEFAULT_ORG_TITLE || 'digger';
      const defaultOrgSlug = process.env.DEFAULT_ORG_SLUG || 'digger';

      // creating the default org and membership
      try {
        console.log('finding org: by slug', defaultOrgSlug);

        const { data, error } = await supabaseAdminClient
          .from('organizations')
          .select('*')
          .eq('slug', defaultOrgSlug)
          .single();

        if (error) {
          throw error;
        }

        const orgId = data.id;
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
        console.log('could not get orgid or create org membership:', error);
        createOrganization(defaultOrgTitle, defaultOrgSlug, {
          isOnboardingFlow: false,
        });
      }
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
