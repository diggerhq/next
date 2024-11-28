import { DesktopSidebarFallback } from '@/components/SidebarComponents/SidebarFallback';
import { SwitcherAndToggle } from '@/components/SidebarComponents/SidebarLogo';
import { SidebarLink } from '@/components/SidebarLink';
import { fetchSlimOrganizations } from '@/data/user/organizations';
import { getOrganizationOfTeam } from '@/data/user/teams';
import { cn } from '@/utils/cn';
import { FileText, FlagIcon, Home, Layers, MessageCircle, Users } from 'lucide-react';
import { Suspense } from 'react';

async function TeamSidebarInternal({ organizationId }: { organizationId: string }) {
    const slimOrganizations = await fetchSlimOrganizations();

    return (
        <div
            className={cn(
                'flex flex-col h-full',
                'lg:px-3 lg:py-2',
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
                    label="Drift"
                    href={`/org/${organizationId}/drift`}
                    icon={<FlagIcon className="size-4 text-foreground" />}
                />
                <SidebarLink
                    label="Teams"
                    href={`/org/${organizationId}/teams`}
                    icon={<Users className="size-4 text-foreground" />}
                />
                {/* <SidebarLink
                    label="Activity"
                    href={`/org/${organizationId}/activity`}
                    icon={<Activity className="size-4 text-foreground" />}
                /> */}
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
    );
}

export async function TeamSidebar({ teamId }: { teamId: number }) {
    const organizationId = await getOrganizationOfTeam(teamId);
    return (
        <Suspense fallback={<DesktopSidebarFallback />}>
            <TeamSidebarInternal organizationId={organizationId} />
        </Suspense>
    );
}