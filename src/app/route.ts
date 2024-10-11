//import { createSupabaseUserRouteHandlerClient } from '@/supabase-clients/user/createSupabaseUserRouteHandlerClient';

import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function GET() {
  redirect('/dashboard');
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
