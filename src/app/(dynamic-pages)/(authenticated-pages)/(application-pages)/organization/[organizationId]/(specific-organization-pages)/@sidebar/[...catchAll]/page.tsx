import { ProFeatureGateDialog } from '@/components/ProFeatureGateDialog';
import { SidebarLink } from '@/components/SidebarLink';
import { fetchSlimOrganizations } from '@/data/user/organizations';
import { cn } from '@/utils/cn';
import { organizationParamSchema } from '@/utils/zod-schemas/params';
import DollarIcon from 'lucide-react/dist/esm/icons/dollar-sign';
import FileBoxIcon from 'lucide-react/dist/esm/icons/file-box';
import HomeIcon from 'lucide-react/dist/esm/icons/home';
import SettingsIcon from 'lucide-react/dist/esm/icons/settings';
import UserIcon from 'lucide-react/dist/esm/icons/user-2';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { OrganizationSwitcher } from '@/app/(dynamic-pages)/(authenticated-pages)/(application-pages)/_sidebar/_components/OrganizationSwitcher';
import { DesktopSidebarFallback } from '@/app/(dynamic-pages)/(authenticated-pages)/(application-pages)/_sidebar/_components/SidebarFallback';
import { SidebarLogoAndToggle } from '@/app/(dynamic-pages)/(authenticated-pages)/(application-pages)/_sidebar/_components/SidebarLogo';
import { SubscriptionCardSmall } from '@/components/SubscriptionCardSmall';
import { T } from '@/components/ui/Typography';

async function OrganizationSidebarInternal({
  organizationId,
}: {
  organizationId: string;
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
          <SidebarLogoAndToggle />
        </div>
        <div className="flex flex-col gap-6 h-full overflow-y-auto">
          <div>
            <SidebarLink
              label="Home"
              href={`/organization/${organizationId}`}
              icon={<HomeIcon className="h-5 w-5" />}
            />
            <SidebarLink
              label="Settings"
              href={`/organization/${organizationId}/settings`}
              icon={<SettingsIcon className="h-5 w-5" />}
            />
            <SidebarLink
              label="Members"
              href={`/organization/${organizationId}/settings/members`}
              icon={<UserIcon className="h-5 w-5" />}
            />
            <SidebarLink
              label="Billing"
              href={`/organization/${organizationId}/settings/billing`}
              icon={<DollarIcon className="h-5 w-5" />}
            />
            <Suspense>
              <ProFeatureGateDialog
                organizationId={organizationId}
                label="Feature Pro"
                icon={<FileBoxIcon className="h-5 w-5" />}
              />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <Suspense fallback={<T.P>Loading subscription details...</T.P>}>
          <SubscriptionCardSmall organizationId={organizationId} />
        </Suspense>

        <div className="flex flex-col gap-1">
          <p className="text-sm font-normal text-gray-500 dark:text-slate-400">
            Select organization
          </p>
          <OrganizationSwitcher
            currentOrganizationId={organizationId}
            slimOrganizations={slimOrganizations}
          />
        </div>
      </div>
    </div>
  );
}

export default async function OrganizationSidebar({
  params,
}: {
  params: unknown;
}) {
  try {
    console.log('params', params);
    const { organizationId } = organizationParamSchema.parse(params);
    console.log(organizationId);
    return (
      <Suspense fallback={<DesktopSidebarFallback />}>
        <OrganizationSidebarInternal organizationId={organizationId} />
      </Suspense>
    );
  } catch (e) {
    return notFound();
  }
}
