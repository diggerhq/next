import { getInitialOrganizationToRedirectTo } from '@/data/user/organizations';
import { refreshSessionAction } from '@/data/user/session';
import { toSiteURL } from '@/utils/helpers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    await refreshSessionAction();
    try {
        const initialOrgId = req.cookies.get('organization')?.value;
        if (initialOrgId) {
            console.log('Initial org id from cookies:', initialOrgId);
            return NextResponse.redirect(new URL(`/org/${initialOrgId}`, req.url));
        }
        const initialOrganization = await getInitialOrganizationToRedirectTo();
        if (initialOrganization.status === 'error') {
            return NextResponse.redirect(toSiteURL('/500'));
        }
        return NextResponse.redirect(new URL(`/org/${initialOrganization.data}`, req.url));
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        // Redirect to an error page or show an error message
        return NextResponse.redirect(toSiteURL('/500'));
    }
}
