'use server';
import { supabaseAdminClient } from '@/supabase-clients/admin/supabaseAdminClient';
import type { SupabaseFileUploadOptions, Table } from '@/types';
import { sendEmail } from '@/utils/api-routes/utils';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';
import { renderAsync } from '@react-email/render';
import SignInEmail from 'emails/SignInEmail';
import slugify from 'slugify';
import urlJoin from 'url-join';
import { ensureAppAdmin } from './security';

export const appAdminGetUserProfile = async (
  userId: string,
): Promise<Table<'user_profiles'>> => {
  ensureAppAdmin();
  const { data, error } = await supabaseAdminClient
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const uploadImage = async (
  formData: FormData,
  fileName: string,
  fileOptions?: SupabaseFileUploadOptions | undefined,
): Promise<string> => {
  'use server';
  const file = formData.get('file');
  if (!file) {
    throw new Error('File is empty');
  }
  const slugifiedFilename = slugify(fileName, {
    lower: true,
    strict: true,
    replacement: '-',
  });

  const user = await serverGetLoggedInUser();
  const userId = user.id;
  const userImagesPath = `${userId}/images/${slugifiedFilename}`;

  const { data, error } = await supabaseAdminClient.storage
    .from('changelog-assets')
    .upload(userImagesPath, file, fileOptions);

  if (error) {
    throw new Error(error.message);
  }

  const { path } = data;

  const filePath = path.split(',')[0];
  const supabaseFileUrl = urlJoin(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    '/storage/v1/object/public/changelog-assets',
    filePath,
  );

  return supabaseFileUrl;
};

export async function appAdminGetUserImpersonationUrl(userId: string) {
  ensureAppAdmin();
  const response = await supabaseAdminClient.auth.admin.getUserById(userId);

  const { data: user, error: userError } = response;

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user?.user) {
    throw new Error('user does not exist');
  }

  if (!user.user.email) {
    throw new Error('user does not have an email');
  }

  const generateLinkResponse =
    await supabaseAdminClient.auth.admin.generateLink({
      email: user.user.email,
      type: 'magiclink',
    });

  const { data: generateLinkData, error: generateLinkError } =
    generateLinkResponse;

  if (generateLinkError) {
    throw new Error(generateLinkError.message);
  }

  if (process.env.NEXT_PUBLIC_SITE_URL !== undefined) {
    // change the origin of the link to the site url
    const {
      properties: { hashed_token },
    } = generateLinkData;

    const tokenHash = hashed_token;
    const searchParams = new URLSearchParams({
      token_hash: tokenHash,
      next: '/dashboard',
    });

    const checkAuthUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL);
    checkAuthUrl.pathname = `/auth/confirm`;
    checkAuthUrl.search = searchParams.toString();

    return checkAuthUrl;
  }

  throw new Error('site url is undefined');
}

export async function createUserAction(email: string) {
  const response = await supabaseAdminClient.auth.admin.createUser({
    email,
  });

  if (response.error) {
    throw response.error;
  }

  const { user } = response.data;

  if (user) {
    // revalidatePath('/app_admin');
    return user;
  } else {
    throw new Error('User not created');
  }
}

export async function sendLoginLinkAction(email: string) {
  const response = await supabaseAdminClient.auth.admin.generateLink({
    email,
    type: 'magiclink',
  });

  if (response.error) {
    throw response.error;
  }

  const generateLinkData = response.data;

  if (generateLinkData) {
    const {
      properties: { hashed_token },
    } = generateLinkData;

    if (process.env.NEXT_PUBLIC_SITE_URL !== undefined) {
      // change the origin of the link to the site url

      const tokenHash = hashed_token;
      const searchParams = new URLSearchParams({
        token_hash: tokenHash,
        next: '/dashboard',
      });

      const url = new URL(process.env.NEXT_PUBLIC_SITE_URL);
      url.pathname = `/auth/confirm`;
      url.search = searchParams.toString();

      // send email
      const signInEmailHTML = await renderAsync(
        <SignInEmail signInUrl={url.toString()} />,
      );

      if (process.env.NODE_ENV === 'development') {
        // In development, we log the email to the console instead of sending it.
        console.log({
          link: url.toString(),
        });
      } else {
        await sendEmail({
          to: email,
          subject: `Here is your login link `,
          html: signInEmailHTML,
          //TODO: Modify this to your app's admin email
          // Make sure you have verified this email in your Sendgrid (mail provider) account
          from: process.env.ADMIN_EMAIL,
        });
      }
    }
    return;
  }
}

export const getPaginatedUserList = async ({
  query = '',
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
  query?: string;
}) => {
  ensureAppAdmin();
  const { data, error } = await supabaseAdminClient.rpc(
    'app_admin_get_all_users',
    {
      page: page,
      search_query: query,
      page_size: limit,
    },
  );

  if (error) {
    throw error;
  }

  return data;
};

export const getUsersTotalPages = async ({
  query = '',
  limit = 10,
}: {
  limit?: number;
  query?: string;
}) => {
  ensureAppAdmin();
  const { data, error } = await supabaseAdminClient.rpc(
    'app_admin_get_all_users_count',
    {
      search_query: query,
    },
  );

  if (error) {
    throw error;
  }

  return Math.ceil(data / limit);
};
