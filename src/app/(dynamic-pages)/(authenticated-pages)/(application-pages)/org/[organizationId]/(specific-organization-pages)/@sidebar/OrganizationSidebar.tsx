import { SidebarLink } from '@/components/SidebarLink';
import { fetchSlimOrganizations, getNormalizedOrganizationSubscription, getOrganizationSlugByOrganizationId } from '@/data/user/organizations';
import { cn } from '@/utils/cn';
import { organizationParamSchema } from '@/utils/zod-schemas/params';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { DesktopSidebarFallback } from '@/components/SidebarComponents/SidebarFallback';
import { SwitcherAndToggle } from '@/components/SidebarComponents/SidebarLogo';
import { FreeTrialComponent } from '@/components/SubscriptionCards';
import { Skeleton } from '@/components/ui/skeleton';
import { differenceInDays } from 'date-fns';
import { Activity, FileText, GitCompare, Home, Layers, MessageCircle, Settings, Shield, Users } from 'lucide-react';

async function OrganizationSubscription({
  organizationId,
}: {
  organizationId: string;
}) {
  const normalizedSubscription =
    await getNormalizedOrganizationSubscription(organizationId);


  switch (normalizedSubscription.type) {
    case 'trialing':
      return <FreeTrialComponent
        organizationId={organizationId}
        planName={normalizedSubscription.product.name ?? 'Digger Plan'}
        daysRemaining={differenceInDays(new Date(normalizedSubscription.trialEnd), new Date())}
      />
    default:
      return null;
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
            label="Policies"
            href={`/org/${organizationId}/policies`}
            icon={<Shield className="size-4 text-foreground" />}
          />
          <SidebarLink
            label="Drift"
            href={`/org/${organizationId}/drift`}
            icon={<GitCompare className="size-4 text-foreground" />}
          />
          <SidebarLink
            label="Docs"
            href={`/org/${organizationId}/docs`}
            icon={<FileText className="size-4 text-foreground" />}
          />
          <SidebarLink
            label="Admin"
            href={`/org/${organizationId}/admin`}
            icon={<Settings className="size-4 text-foreground" />}
          />
          <SidebarLink
            label="Ask in Slack"
            href="#"
            icon={<MessageCircle className="size-4 text-foreground" />}
          />
        </div>
      </div>
      <div>
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <OrganizationSubscription organizationId={organizationId} />
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
