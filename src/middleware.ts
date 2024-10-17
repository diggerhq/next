// const matchAppAdmin = match('/app_admin_preview/(.*)?');
import { NextRequest, NextResponse } from 'next/server';
import { match } from 'path-to-regexp';

const onboardingPaths = `/onboarding/(.*)?`;
// Using a middleware to protect pages from unauthorized access
// may seem repetitive however it massively increases the security
// and performance of your application. This is because the middleware
// runs first on the server and can bail out early before the
// server component is even rendered. This means no database queries
// or other expensive operations are run if the user is not authorized.

const unprotectedPagePrefixes = [
  `/`,
  `/changelog`,
  `/feedback(/.*)?`,
  `/roadmap`,
  `/auth(/.*)?`,
  `/confirm-delete-user(/.*)?`,
  `/forgot-password(/.*)?`,
  `/login(/.*)?`,
  `/sign-up(/.*)?`,
  `/update-password(/.*)?`,
  `/roadmap/`,
  `/version2`,
  `/blog(/.*)?`,
  `/docs(/.*)?`,
  `/terms`,
  `/waitlist(/.*)?`,
];

export function middleware(request: NextRequest) {
  return NextResponse.next();
}

function isLandingPage(pathname: string) {
  return pathname === '/';
}

function isUnprotectedPage(pathname: string) {
  return unprotectedPagePrefixes.some((prefix) => {
    const matchPath = match(prefix);
    return matchPath(pathname);
  });
}

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

// this middleware refreshes the user's session and must be run
// for any Server Component route that uses `createServerComponentSupabaseClient`
// renamed while moving to auth.js

/*
export async function middleware_NEXTBASE_LEGACY(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });
  const sessionResponse = await supabase.auth.getSession();
  const maybeUser = sessionResponse?.data.session?.user;
  if (isLandingPage(req.nextUrl.pathname)) {
    if (maybeUser) {
      //user is logged in, lets validate session and redirect on success
      const user = await supabase.auth.getUser();
      if (user.error) {
        return NextResponse.redirect(toSiteURL('/login'));
      }
      return NextResponse.redirect(toSiteURL('/dashboard'));
    } else {
      //user is not logged in, lets redirect to login
      return NextResponse.redirect(toSiteURL('/login'));
    }
  }
  if (!isUnprotectedPage(req.nextUrl.pathname) && maybeUser) {
    // user is possibly logged in, but lets validate session
    const user = await supabase.auth.getUser();
    if (user.error) {
      return NextResponse.redirect(toSiteURL('/login'));
    }
    if (shouldOnboardUser(req.nextUrl.pathname, user.data.user)) {
      return NextResponse.redirect(toSiteURL('/onboarding'));
    }
  }
  if (!isUnprotectedPage(req.nextUrl.pathname) && !maybeUser) {
    return NextResponse.redirect(toSiteURL('/login'));
  }
  if (
    !req.nextUrl.pathname.startsWith(`/app_admin_preview`) &&
    req.nextUrl.pathname.startsWith('/app_admin')
  ) {
    if (
      !(
        maybeUser &&
        'user_role' in maybeUser &&
        maybeUser.user_role === 'admin'
      )
    ) {
      return NextResponse.redirect(toSiteURL('/dashboard'));
    }
  }
  return res;
}

*/

/*
Middleware for Auth.js - but it doesn't work, edge runtime error. Back to route level
export default auth(async (req) => {
  if (!req.auth) {
    //not authenticated - redirect to login URL defined by Auth.js
    return NextResponse.redirect(toSiteURL('/api/auth/signin'));
  } else {
    const user = await serverGetLoggedInUser();
    if (
      shouldOnboardUser(req.nextUrl.pathname, user.id) &&
      req.nextUrl.pathname !== '/onboarding'
    ) {
      // authenticated but not onboarded
      return NextResponse.redirect(toSiteURL('/onboarding'));
    } else {
      // authenticated and onboarded - no changes to URL
      return NextResponse.next();
    }
  }
});
*/

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|images|assets|logos|mockups|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
