import { toSiteURL } from '@/utils/helpers';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';
import { redirect } from 'next/navigation';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const paramsSchema = z.object({
  invitationId: z.coerce.string(),
});

export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: undefined;
  },
) {
  const { success } = paramsSchema.safeParse(params);
  if (!success) {
    return NextResponse.json({
      error: 'Invalid invitation ID',
    });
  }
  const { invitationId } = paramsSchema.parse(params);

  const user = await serverGetLoggedInUser();

  // the below still won't work but at least we got rid of supabase user client on the server
  // login form no longer exists so need to redirect to actual login but later

  if (!user) {
    const url = new URL(toSiteURL('/login'));
    url.searchParams.append(
      'next',
      `/invitations/${encodeURIComponent(invitationId)}`,
    );
    url.searchParams.append('nextActionType', 'invitationPending');
    return redirect(url.toString());
  }

  if (typeof invitationId === 'string') {
    redirect(`/invitations/${invitationId}`);
  } else {
    return NextResponse.json({
      error: 'Invalid invitation ID',
    });
  }
}
