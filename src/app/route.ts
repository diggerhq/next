import { createSupabaseUserRouteHandlerClient } from '@/supabase-clients/user/createSupabaseUserRouteHandlerClient';
// import { AuthChangeEvent, Session } from '@supabase/supabase-js';
// import { useEffect, useState } from 'react';

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = createSupabaseUserRouteHandlerClient();
  const url = new URL(request.url);
  const hash = url.hash;

  console.log(url);

  // Remove the '#' character if present
  const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;

  // You can now use the hash value as needed
  if (cleanHash) {
    console.log({ message: `Hash found: ${cleanHash}` });
  } else {
    console.log({ message: 'No hash found in the URL' });
  }

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
