// https://supabase.com/docs/guides/auth/auth-helpers/nextjs-server-components#creating-a-supabase-client
import { Database } from '@/lib/database.types';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const isDevelopment = process.env.NODE_ENV === 'development';

type createClientComponentClientParams = NonNullable<
  Parameters<typeof createClientComponentClient>[0]
>;
type CookieOptions = createClientComponentClientParams['cookieOptions'];

const optionalCookieOptions: CookieOptions = isDevelopment
  ? undefined
  : {
      domain: '.digger.dev',
      secure: false,
      path: '/',
      sameSite: 'lax',
    };

// apologies for the name, but it's the best I could come up with as
// the util exported from @supabase/auth-helpers-nextjs is called
// createClientComponentClient
export const supabaseUserClientComponentClient =
  createClientComponentClient<Database>({
    options: {
      global: {
        fetch,
      },
    },
    cookieOptions: optionalCookieOptions,
  });
