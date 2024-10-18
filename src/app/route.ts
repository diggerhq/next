import { createSupabaseUserRouteHandlerClient } from '@/supabase-clients/user/createSupabaseUserRouteHandlerClient';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.SB_SSO_DOMAIN !== undefined) {
    return NextResponse.redirect(
      new URL('/auth/sso-verify', process.env.SITE_URL),
    );
  }

  const supabase = createSupabaseUserRouteHandlerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error('Error checking user authentication:', error);
    // In case of an error, redirect to login as a fallback
    return NextResponse.redirect(new URL('/login', process.env.SITE_URL));
  }

  if (user) {
    // User is logged in, redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', process.env.SITE_URL));
  } else {
    // User is not logged in, redirect to login
    return NextResponse.redirect(new URL('/login', process.env.SITE_URL));
  }
}
