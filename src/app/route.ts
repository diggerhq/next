//import { createSupabaseUserRouteHandlerClient } from '@/supabase-clients/user/createSupabaseUserRouteHandlerClient';

import { getUserProfileByEmail } from '@/data/user/user';
import { toSiteURL } from '@/utils/helpers';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function shouldOnboardUser(pathname: string, email: string) {
  const userProfile = await getUserProfileByEmail(email);
  return (
    !userProfile.has_completed_profile || !userProfile.has_created_organization
  );
}

export async function GET(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_SSO_DOMAIN !== undefined) {
    return NextResponse.redirect(
      new URL('/auth/sso-verify', process.env.NEXT_PUBLIC_SITE_URL),
    );
  }
  try {
    const user = await serverGetLoggedInUser();
    if (
      (await shouldOnboardUser(request.nextUrl.pathname, user.email)) &&
      request.nextUrl.pathname !== '/onboarding'
    ) {
      // Authenticated but not onboarded
      return NextResponse.redirect(toSiteURL('/onboarding'));
    } else {
      return NextResponse.next();
    }
  } catch (error) {
    console.log('User not signed in, redirecting to login', error);
    return NextResponse.redirect(toSiteURL('/api/auth/signin'));
  }
}

function getOnboardingConditions(
  email: string,
): { userProfile: any } | PromiseLike<{ userProfile: any }> {
  throw new Error('Function not implemented.');
}
// TODO remove when move to authjs is complete
/*
export async function GET() {
  const supabase = createSupabaseUserRouteHandlerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error checking user authentication:', error);
    // In case of an error, redirect to login as a fallback
    return NextResponse.redirect(
      new URL('/login', process.env.NEXT_PUBLIC_SITE_URL),
    );
  }

  if (user) {
    // User is logged in, redirect to dashboard
    return NextResponse.redirect(
      new URL('/dashboard', process.env.NEXT_PUBLIC_SITE_URL),
    );
  } else {
    // User is not logged in, redirect to login
    return NextResponse.redirect(
      new URL('/login', process.env.NEXT_PUBLIC_SITE_URL),
    );
  }
}
*/
