import { PageHeading } from "@/components/PageHeading";
import { TabsNavigationV2 } from "@/components/TabsNavigation/TabsNavigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getProjectTitleById, getSlimProjectBySlug } from "@/data/user/projects";
import { isLocalEnvironment } from "@/lib/utils";
import { projectSlugParamSchema } from "@/utils/zod-schemas/params";
import { AlertCircleIcon } from "lucide-react";
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



  // fetch the drift alerts
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
      {isLocalEnvironment && (
        <Alert variant="default" className="mb-6 max-w-5xl border-orange-500/50 text-orange-700 dark:border-orange-300/50 dark:text-orange-300 [&>svg]:text-orange-600 dark:[&>svg]:text-orange-400 bg-orange-50 dark:bg-orange-900/10">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>
            Drift Detected
          </AlertTitle>
          <AlertDescription>
            Changes have been detected in your infrastructure that differ from your Terraform configuration. Please review and reconcile these differences.
          </AlertDescription>
        </Alert>
      )}

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