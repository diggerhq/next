import { Database } from '@/lib/database.types';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

type createServerActionClientParams = NonNullable<
  Parameters<typeof createServerActionClient>[1]
>;
type CookieOptions = createServerActionClientParams['cookieOptions'];

const isDevelopment = process.env.NODE_ENV === 'development';

const optionalCookieOptions: CookieOptions = isDevelopment
  ? undefined
  : {
      domain: '.digger.dev',
      secure: false,
      path: '/',
      sameSite: 'lax',
    };

export const createSupabaseUserServerActionClient = () =>
  createServerActionClient<Database>(
    {
      cookies,
    },
    {
      cookieOptions: optionalCookieOptions,
    },
  );
