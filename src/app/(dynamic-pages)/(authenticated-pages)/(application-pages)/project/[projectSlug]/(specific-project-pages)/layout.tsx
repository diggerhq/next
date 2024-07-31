import { PageHeading } from "@/components/PageHeading";
import { TabsNavigationV2 } from "@/components/TabsNavigation/TabsNavigation";
import { getProjectTitleById, getSlimProjectBySlug } from "@/data/user/projects";
import { projectSlugParamSchema } from "@/utils/zod-schemas/params";
import { Suspense } from "react";


async function ProjectPageHeading({ projectId }: { projectId: string }) {
  const projectTitle = await getProjectTitleById(projectId);
  return (
    <PageHeading
      title={projectTitle}
      subTitle="Manage your project here"
    />
  );
}
export default async function ProjectPagesLayout({ params, children }: { params: unknown, children: React.ReactNode }) {
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
  return <>
    <div className="flex flex-col">
      <Suspense>
        <ProjectPageHeading projectId={project.id} />
      </Suspense>
      <Suspense>
        <TabsNavigationV2 tabs={tabs} />
      </Suspense>
    </div>
    {children}
  </>

}