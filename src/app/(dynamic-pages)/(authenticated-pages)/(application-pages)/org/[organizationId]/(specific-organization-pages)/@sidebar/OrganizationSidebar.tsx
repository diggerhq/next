import { ProFeatureGateDialog } from '@/components/ProFeatureGateDialog';
import { SidebarLink } from '@/components/SidebarLink';
import { fetchSlimOrganizations, getOrganizationSlugByOrganizationId } from '@/data/user/organizations';
import { cn } from '@/utils/cn';
import { organizationParamSchema } from '@/utils/zod-schemas/params';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { DesktopSidebarFallback } from '@/components/SidebarComponents/SidebarFallback';
import { SwitcherAndToggle } from '@/components/SidebarComponents/SidebarLogo';
import { SubscriptionCardSmall } from '@/components/SubscriptionCardSmall';
import { T } from '@/components/ui/Typography';
import { DollarSign, FileBox, Home, Layers, Settings, UserRound } from 'lucide-react';

async function OrganizationSidebarInternal({
  organizationId,
  organizationSlug,
}: {
  organizationId: string;
  organizationSlug: string;
}) {
  const slimOrganizations = await fetchSlimOrganizations();
  return (
    <div
      className={cn(
        'flex flex-col justify-between h-full',
        'lg:px-3 lg:py-4 lg:pt-2.5 ',
      )}
    >
      <div>

        <div className="flex justify-between items-center">
          <SwitcherAndToggle organizationId={organizationId} slimOrganizations={slimOrganizations} />
        </div>
        <div className="flex flex-col gap-6 h-full overflow-y-auto mt-4">
          <div>
            <SidebarLink
              label="Home"
              href={`/org/${organizationId}`}
              icon={<Home className="h-5 w-5" />}
            />
            <SidebarLink
              label="Settings"
              href={`/org/${organizationId}/settings`}
              icon={<Settings className="h-5 w-5" />}
            />
            <SidebarLink
              label="Projects"
              href={` /org/${organizationId}/projects`}
              icon={<Layers className="h-5 w-5" />}
            />
            <SidebarLink
              label="Members"
              href={`/org/${organizationId}/settings/members`}
              icon={<UserRound className="h-5 w-5" />}
            />
            <SidebarLink
              label="Billing"
              href={`/org/${organizationId}/settings/billing`}
              icon={<DollarSign className="h-5 w-5" />}
            />
            <Suspense>
              <ProFeatureGateDialog
                organizationId={organizationId}
                label="Feature Pro"
                icon={<FileBox className="h-5 w-5" />}
              />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Suspense fallback={<T.P>Loading subscription details...</T.P>}>
          <div>
            <SubscriptionCardSmall organizationSlug={organizationSlug} organizationId={organizationId} />
          </div>
        </Suspense>


      </div>
    </div>
  );
}

export async function OrganizationSidebar({ params }: { params: unknown }) {
  try {
    const { organizationId } = organizationParamSchema.parse(params);
    const organizationSlug = await getOrganizationSlugByOrganizationId(organizationId)
    return (
      <Suspense fallback={<DesktopSidebarFallback />}>
        <OrganizationSidebarInternal organizationId={organizationId} organizationSlug={organizationSlug} />
      </Suspense>
    );
  } catch (e) {
    return notFound();
  }
}
