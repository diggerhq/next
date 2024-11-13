import { withApiAuth } from '@/middleware/api';
import { NextResponse } from 'next/server';

export const GET = withApiAuth(async function (
  req: Request,
  userEmail: string,
) {
  // Your API logic here

  // user, default org, ...
  return NextResponse.json({ data: 'your project' });
});
