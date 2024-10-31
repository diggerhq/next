import { getDefaultOrganization } from '@/data/user/organizations';
import { toSiteURL } from '@/utils/helpers';
import { NextRequest, NextResponse } from 'next/server';

// Use the environment variable for the callback URL
const GITHUB_CALLBACK_URL = process.env.GITHUB_PROXY_CALLBACK_URL;
const DIGGER_WEBHOOK_SECRET = process.env.DIGGER_WEBHOOK_SECRET;

if (!GITHUB_CALLBACK_URL) {
  throw new Error('GITHUB_PROXY_CALLBACK_URL environment variable is not set');
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
    // always installing github app in the default organisation
    // TODO install into user's current organisation
    const organizationId = await getDefaultOrganization();
    if (!organizationId) {
      console.error('User has no org id');
      throw new Error(`User has no org id. Installation: ${installationId}`);
    }
    const response = await fetch(
      `${GITHUB_CALLBACK_URL}?${searchParams.toString()}`,
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
