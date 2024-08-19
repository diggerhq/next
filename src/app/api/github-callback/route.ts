import { createSupabaseUserRouteHandlerClient } from '@/supabase-clients/user/createSupabaseUserRouteHandlerClient';
import { toSiteURL } from '@/utils/helpers';
import retry from 'async-retry';
import { NextRequest, NextResponse } from 'next/server';

// Use the environment variable for the callback URL
const AUTH_SERVICE_URL = process.env.GITHUB_CALLBACK_URL;
const DIGGER_WEBHOOK_SECRET = process.env.DIGGER_WEBHOOK_SECRET;

if (!AUTH_SERVICE_URL) {
  throw new Error('GITHUB_CALLBACK_URL environment variable is not set');
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const installationId = searchParams.get('installation_id');

  if (!installationId) {
    return NextResponse.json(
      { error: 'Missing installation_id' },
      { status: 400 },
    );
  }

  try {
    console.log(
      'Trying to get org id for the following installation ID:',
      installationId,
    );
    const organizationId = await getOrganizationId(installationId);
    const response = await fetch(
      `${AUTH_SERVICE_URL}?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Digger-Org-ID': organizationId,
          Authorization: `Bearer ${DIGGER_WEBHOOK_SECRET}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Auth service responded with status: ${response.status}`);
    }
    return NextResponse.redirect(toSiteURL('/github_app/success'));
  } catch (error) {
    console.error('Error handling GitHub App installation callback:', error);
    return NextResponse.redirect(toSiteURL('/github_app/error'));
  }
}

async function getOrganizationId(installationId: string): Promise<string> {
  const supabase = createSupabaseUserRouteHandlerClient();
  return retry(
    async (bail) => {
      const { data, error } = await supabase
        .from('github_app_installation_links')
        .select('organization_id')
        .eq('github_installation_id', installationId)
        .single();

      if (error) {
        if (error.code === '404') bail(new Error('Organization not found'));
        throw error;
      }

      if (!data?.organization_id) {
        throw new Error('Organization ID not found');
      }

      return data.organization_id;
    },
    {
      retries: 2,
      onRetry: (error, attempt) => {
        console.log(`Attempt ${attempt} failed. Retrying...`);
      },
    },
  );
}
