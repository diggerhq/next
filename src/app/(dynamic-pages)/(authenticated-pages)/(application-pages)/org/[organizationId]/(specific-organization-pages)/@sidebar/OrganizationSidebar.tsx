import { SidebarLink } from '@/components/SidebarLink';
import { fetchSlimOrganizations, getActiveProductsWithPrices, getLoggedInUserOrganizationRole, getNormalizedOrganizationSubscription, getOrganizationSlugByOrganizationId } from '@/data/user/organizations';
import { cn } from '@/utils/cn';
import { organizationParamSchema } from '@/utils/zod-schemas/params';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { FreeTrialDialog } from '@/components/FreeTrialDialog';
import { DesktopSidebarFallback } from '@/components/SidebarComponents/SidebarFallback';
import { SwitcherAndToggle } from '@/components/SidebarComponents/SidebarLogo';
import { FreeTrialComponent } from '@/components/SubscriptionCards';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInDays } from 'date-fns';
import { Activity, FileText, FlagIcon, Home, Layers, MessageCircle, Users } from 'lucide-react';

async function OrganizationSubscriptionSidebarCard({
  organizationId,
}: {
  organizationId: string;
}) {
  const [normalizedSubscription, activeProducts, userRole] = await Promise.all([
    getNormalizedOrganizationSubscription(organizationId),
    getActiveProductsWithPrices(),
    getLoggedInUserOrganizationRole(organizationId)
  ]);

  const isOrganizationAdmin = userRole === 'admin' || userRole === 'owner'

  switch (normalizedSubscription.type) {
    case 'trialing':
      return <FreeTrialComponent
        organizationId={organizationId}
        planName={normalizedSubscription.product.name ?? 'Digger Plan'}
        daysRemaining={differenceInDays(new Date(normalizedSubscription.trialEnd), new Date())}
      />
    case 'active':
      return null;
    default:
      return <>
        <FreeTrialDialog
          isOrganizationAdmin={isOrganizationAdmin}
          organizationId={organizationId}
          activeProducts={activeProducts}
          defaultOpen={true}
        />
      </>
  }

}

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
        'flex flex-col h-full justify-between',
        'lg:px-3 lg:py-2',
      )}
    >

      <div className="flex flex-col">

        <div className="flex justify-between items-center mb-4">
          <SwitcherAndToggle organizationId={organizationId} slimOrganizations={slimOrganizations} />
        </div>

        <div className="flex flex-col gap-0">
          <SidebarLink
            label="Home"
            href={`/org/${organizationId}`}
            icon={<Home className="size-4 text-foreground" />}
          />
          <SidebarLink
            label="Projects"
            href={`/org/${organizationId}/projects`}
            icon={<Layers className="size-4 text-foreground" />}
          />
          <SidebarLink
            label="Drift"
            href={`/org/${organizationId}/drift`}
            icon={<FlagIcon className="size-4 text-foreground" />}
          />
          <SidebarLink
            label="Teams"
            href={`/org/${organizationId}/teams`}
            icon={<Users className="size-4 text-foreground" />}
          />
          <SidebarLink
            label="Activity"
            href={`/org/${organizationId}/activity`}
            icon={<Activity className="size-4 text-foreground" />}
          />
          <SidebarLink
            label="Docs"
            href={`https://docs.digger.dev/team/getting-started/gha-aws`}
            icon={<FileText className="size-4 text-foreground" />}
          />
          <SidebarLink
            label="Ask in Slack"
            href="https://bit.ly/diggercommunity"
            icon={<MessageCircle className="size-4 text-foreground" />}
          />
        </div>
      </div>
      <div>
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <OrganizationSubscriptionSidebarCard organizationId={organizationId} />
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
