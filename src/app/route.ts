import { getUserProfileByEmail } from '@/data/user/user';
import { toSiteURL } from '@/utils/helpers';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';
import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

async function isUserOnboarded(email: string) {
  const userProfile = await getUserProfileByEmail(email);
  return (
    userProfile.has_completed_profile && userProfile.has_created_organization
  );
}

export async function GET(request: NextRequest) {
  const user = await serverGetLoggedInUser();
  const isOnboarded = await isUserOnboarded(user.email);
  const pathname = request.nextUrl.pathname;
  if (!isOnboarded && pathname !== '/onboarding') {
    redirect(toSiteURL('/onboarding'));
  } else if (isOnboarded) {
    redirect(toSiteURL('/dashboard'));
  }
}

// No need to check for login - it is done in the middleware
// Preserving commented out from Nextbase as-is for future reference, just in case

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
