import { SidebarLink } from '@/components/SidebarLink';
import { cn } from '@/utils/cn';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { DesktopSidebarFallback } from '@/components/SidebarComponents/SidebarFallback';
import { SwitcherAndToggle } from '@/components/SidebarComponents/SidebarLogo';
import { fetchSlimOrganizations, getOrganizationSlugByOrganizationId } from '@/data/user/organizations';
import { organizationParamSchema } from '@/utils/zod-schemas/params';
import { Activity, FileText, GitCompare, Home, Layers, MessageCircle, Settings, Shield } from 'lucide-react';

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
        'flex flex-col h-full',
        'lg:px-3 lg:py-4',
      )}
    >

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
  );
}

export default async function OrganizationSidebar({
  params,
}: {
  params: unknown;
}) {
  try {
    const { organizationId } = organizationParamSchema.parse(params);
    const organizationSlug = await getOrganizationSlugByOrganizationId(organizationId);
    return (
      <Suspense fallback={<DesktopSidebarFallback />}>
        <OrganizationSidebarInternal organizationId={organizationId} organizationSlug={organizationSlug} />
      </Suspense>
    );
  } catch (e) {
    return notFound();
  }
}