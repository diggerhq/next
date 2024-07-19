import { Database } from '@/lib/database.types';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

type createRouteHandlerClientParams = NonNullable<
  Parameters<typeof createRouteHandlerClient>[1]
>;
type CookieOptions = createRouteHandlerClientParams['cookieOptions'];

const isDevelopment = process.env.NODE_ENV === 'development';

const optionalCookieOptions: CookieOptions = isDevelopment
  ? undefined
  : {
      domain: '.digger.dev',
      secure: false,
      path: '/',
      sameSite: 'lax',
    };

// Outstanding bug
//https://github.com/vercel/next.js/issues/45371
export const createSupabaseUserRouteHandlerClient = () =>
  createRouteHandlerClient<Database>(
    {
      cookies,
    },
    {
      cookieOptions: optionalCookieOptions,
    },
  );
