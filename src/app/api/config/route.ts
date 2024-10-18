import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface Config {
  SB_SSO_DOMAIN?: string;
}
export async function GET() {
  return NextResponse.json({
    SB_SSO_DOMAIN: process.env.SP_SSO_DOMAIN,
  });
}
