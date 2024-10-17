//import { createSupabaseUserRouteHandlerClient } from '@/supabase-clients/user/createSupabaseUserRouteHandlerClient';

import { toSiteURL } from '@/utils/helpers';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function shouldOnboardUser(pathname: string, userId: string) {
  /*
  const matchOnboarding = match(onboardingPaths);
  const isOnboardingRoute = matchOnboarding(pathname);
  if (!isUnprotectedPage(pathname) && user && !isOnboardingRoute) {
    const userMetadata = authUserMetadataSchema.parse(user.user_metadata);
    console.log('user metadata:', userMetadata);
    const {
      onboardingHasAcceptedTerms,
      onboardingHasCompletedProfile,
      onboardingHasCreatedOrganization,
    } = userMetadata;
    if (
      !onboardingHasAcceptedTerms ||
      !onboardingHasCompletedProfile ||
      !onboardingHasCreatedOrganization
    ) {
      return true;
    }
  }
  console.log('user is onboarded');
  return false;
  */
  return true;
  //TODO figure way to store user metadata (extend user_profile table?)
}

export async function GET(request: NextRequest) {
  try {
    const user = await serverGetLoggedInUser();
    if (
      shouldOnboardUser(request.nextUrl.pathname, user.id) &&
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
