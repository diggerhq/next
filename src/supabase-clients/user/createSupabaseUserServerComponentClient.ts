import { Database } from '@/lib/database.types';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const isDevelopment = process.env.NODE_ENV === 'development';

type createServerComponentClientParams = NonNullable<
  Parameters<typeof createServerComponentClient>[1]
>;
type CookieOptions = createServerComponentClientParams['cookieOptions'];

const optionalCookieOptions: CookieOptions = {
  domain: isDevelopment ? undefined : '.digger.dev',
  secure: !isDevelopment,
  path: '/',
  sameSite: 'lax',
};

export const createSupabaseUserServerComponentClient = () =>
  createServerComponentClient<Database>(
    {
      cookies,
    },
    {
      options: {
        global: {
          fetch,
        },
      },
      cookieOptions: optionalCookieOptions,
    },
  );
