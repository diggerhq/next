import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const isDevelopment = process.env.NODE_ENV === 'development';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const provider = requestUrl.searchParams.get('provider');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    try {
      // Exchange the code for a session
      await supabase.auth.exchangeCodeForSession(code);
    } catch (error) {
      // Handle error
      console.error('Failed to exchange code for session: ', error);
      // Potentially return an error response here
    }
  }

  // HACK_ALERT!!!
  // cookie is probably set on 'next.digger.dev' we have to change it to `.digger.dev`
  const cookieKey = `sb-${process.env.SUPABASE_PROJECT_REF}-auth-token`;
  const cookieStore = cookies();
  const currentCookieValue = cookieStore.get(cookieKey)?.value;
  // get domain of current reques
  const domain = new URL(request.url).hostname;
  if (
    domain.includes('next.digger.dev') &&
    currentCookieValue &&
    !isDevelopment
  ) {
    // set cookie to .digger.dev
    cookieStore.set(cookieKey, currentCookieValue, {
      domain: '.digger.dev',
      secure: true,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
    });
  }

  let redirectTo = new URL('/dashboard', requestUrl.origin);

  if (next) {
    // decode next param
    const decodedNext = decodeURIComponent(next);
    // validate next param
    redirectTo = new URL(decodedNext, requestUrl.origin);
  }
  return NextResponse.redirect(redirectTo);
}
