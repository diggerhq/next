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

      if (error) throw error;

      console.log('Session set successfully:', data.session);
    } catch (error) {
      console.error('Error setting session:', error);
    }
  }

  let redirectTo = new URL('/dashboard', requestUrl.origin);

  if (next) {
    // decode next param
    const decodedNext = decodeURIComponent(next);
    // validate next param
    redirectTo = new URL(decodedNext, requestUrl.origin);
  }
  console.log('redirecting to:', redirectTo);
  return NextResponse.redirect(redirectTo);
}
