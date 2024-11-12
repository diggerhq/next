// middleware/withApiAuth.ts
import { auth } from '@/auth'; // Your auth configuration file

import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { validateM2MToken } from './m2m';

export function withApiAuth(
  handler: (req: NextRequest) => Promise<NextResponse>,
) {
  return async function (req: Request) {
    // Check for M2M Bearer token
    const headersList = headers();
    const authHeader = headersList.get('authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = await validateM2MToken(token);
      if (payload) {
        // Valid M2M token
        return handler(req);
      }
    }

    // Check for session
    const session = await auth();

    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    return handler(req);
  };
}
