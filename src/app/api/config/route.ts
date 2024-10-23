import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface Config {
  SITE_URL?: string;
}
export async function GET() {
  return NextResponse.json({
    SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
}
