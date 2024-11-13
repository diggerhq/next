// middleware/withApiAuth.ts

import { auth } from '@/auth';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { validateM2MToken } from './m2m';

export function withApiAuth(
  handler: (req: NextRequest, userEmail: string) => Promise<NextResponse>,
) {
  return async function (req: NextRequest) {
    // Check for M2M Bearer token
    try {
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

      // this part is to check if there is a cookie session available
      // example if request is made from browser api
      const session = await auth();
      if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
      }

      if (!session?.user?.email) {
        throw new Error('could not retrieve email from session');
      }

      return handler(req, session.user?.email);
    } catch (error) {
      console.error('Auth error:', error);
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  };
}
