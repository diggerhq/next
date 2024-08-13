import { DesktopSidebarFallback } from '@/components/SidebarComponents/SidebarFallback';
import { SwitcherAndToggle } from '@/components/SidebarComponents/SidebarLogo';
import { SidebarLink } from '@/components/SidebarLink';
import { fetchSlimOrganizations } from '@/data/user/organizations';
import { getSlimProjectById, getSlimProjectBySlug } from '@/data/user/projects';
import { cn } from '@/utils/cn';
import { projectSlugParamSchema } from '@/utils/zod-schemas/params';
import { Activity, ArrowLeft, FileText, Layers, MessageCircle, Users } from 'lucide-react';
import { Suspense } from 'react';

async function ProjectSidebarInternal({ projectId, projectSlug }: { projectId: string; projectSlug: string }) {
  const [slimOrganizations, project] = await Promise.all([
    fetchSlimOrganizations(),
    getSlimProjectById(projectId),
  ]);
  const organizationId = project.organization_id;

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
          label="Back to organization"
          href={`/org/${organizationId}`}
          icon={<ArrowLeft className="size-4 text-foreground" />}
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

export async function ProjectSidebar({ params }: { params: unknown }) {
  const { projectSlug } = projectSlugParamSchema.parse(params);
  const project = await getSlimProjectBySlug(projectSlug);
  return (
    <Suspense fallback={<DesktopSidebarFallback />}>
      <ProjectSidebarInternal projectId={project.id} projectSlug={project.slug} />
    </Suspense>
  );
}