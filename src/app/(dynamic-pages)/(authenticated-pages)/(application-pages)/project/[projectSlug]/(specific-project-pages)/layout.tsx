import { ApplicationLayoutShell } from '@/components/ApplicationLayoutShell';
import { InternalNavbar } from '@/components/NavigationMenu/InternalNavbar';
import { PageHeading } from '@/components/PageHeading';
import { TabsNavigationV2 } from '@/components/TabsNavigation/TabsNavigation';
import { getProjectTitleById, getSlimProjectBySlug } from '@/data/user/projects';
import { projectSlugParamSchema } from '@/utils/zod-schemas/params';
import { Suspense, type ReactNode } from 'react';


async function ProjectPageHeading({ projectId }: { projectId: string }) {
  const projectTitle = await getProjectTitleById(projectId);
  return (
    <PageHeading
      title={projectTitle}
      subTitle={`Project ID : ${projectId} `}
    />
  );
}

export default async function ProjectLayout({
  params,
  children,
  navbar,
  sidebar,
}: {
  children: ReactNode;
  params: unknown;
  navbar: ReactNode;
  sidebar: ReactNode;
}) {
  const { projectSlug } = projectSlugParamSchema.parse(params);
  const project = await getSlimProjectBySlug(projectSlug);

  const tabs = [
    {
      label: 'Runs',
      href: `/project/${projectSlug}`,
    },
    {
      label: 'TFVars',
      href: `/project/${projectSlug}/tfvars`,
    },
    {
      label: 'Settings',
      href: `/project/${projectSlug}/settings`,
    },
  ];

  return (

    <ApplicationLayoutShell sidebar={sidebar}>
      <div className="">
        <InternalNavbar>
          <div className="flex w-full justify-between items-center">
            <Suspense>{navbar}</Suspense>
          </div>
        </InternalNavbar>
        <div className="m-6">
          <div className="flex flex-col">
            <Suspense>
              <ProjectPageHeading projectId={project.id} />
            </Suspense>
            <Suspense>
              <TabsNavigationV2 tabs={tabs} />
            </Suspense>
          </div>
          {children}
        </div>
      </div>
    </ApplicationLayoutShell>
  );
}
