import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface Config {
  SB_SSO_DOMAIN?: string;
  SITE_URL?: string;
}
export async function GET() {
  return NextResponse.json({
    SB_SSO_DOMAIN: process.env.SB_SSO_DOMAIN,
    SITE_URL: process.env.SITE_URL,
  });
}
