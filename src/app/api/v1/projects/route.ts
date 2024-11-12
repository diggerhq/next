import { withApiAuth } from '@/middleware/api';
import { NextResponse } from 'next/server';

export const GET = withApiAuth(async function (req: Request) {
  // Your API logic here
  return NextResponse.json({ data: 'your project' });
});
