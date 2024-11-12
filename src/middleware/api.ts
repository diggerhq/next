// middleware/withApiAuth.ts

import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { validateM2MToken } from './m2m';

export function withApiAuth(
  handler: (req: NextRequest, userEmail: string) => Promise<NextResponse>,
) {
  return async function (req: NextRequest) {
    // Check for M2M Bearer token
    const headersList = headers();
    const authHeader = headersList.get('authorization');

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = await validateM2MToken(token);
      if (payload) {
        // Valid M2M token
        return handler(req, payload.email);
      }
    }
    return new Response('Unauthorized', { status: 401 });
  };
}
