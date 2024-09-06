import { PageHeading } from "@/components/PageHeading";
import { TabsNavigationV2 } from "@/components/TabsNavigation/TabsNavigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getProjectById, getProjectTitleById, getSlimProjectBySlug } from "@/data/user/projects";
import { projectSlugParamSchema } from "@/utils/zod-schemas/params";
import { AlertCircleIcon, ExternalLink, GitBranch } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { TriggerApplyButton } from "./TriggerApplyButton";


async function ProjectPageHeading({ projectId, branch }: { projectId: string, branch: string | null }) {
  const projectTitle = await getProjectTitleById(projectId);
  return (
    <PageHeading
      title={projectTitle}
      subTitle={<span className="flex items-center"><GitBranch /> {branch || 'main'}</span>}
    />
  );
}

export default async function ProjectPagesLayout({ params, children }: { params: unknown, children: React.ReactNode }) {
  const { projectSlug } = projectSlugParamSchema.parse(params);

  //TODO figure out a better way to access drift, without fetching twice
  const projectId = (await getSlimProjectBySlug(projectSlug)).id;
  const project = await getProjectById(projectId);

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
    {
      label: 'Drift',
      href: `/project/${projectSlug}/drift`,
    },
  ];
  return <>
    <div className="flex flex-col">
      {project.latest_drift_output && (
        <Alert variant="default" className="mb-6 max-w-5xl border-orange-500/50 text-orange-700 dark:border-orange-300/50 dark:text-orange-300 [&>svg]:text-orange-600 dark:[&>svg]:text-orange-400 bg-orange-50 dark:bg-orange-900/10">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>
            Drift Detected
          </AlertTitle>
          <AlertDescription>
            Changes have been detected in your infrastructure that differ from your Terraform configuration. <Link href={`/project/${projectSlug}/drift`} className="inline-flex items-center underline underline-offset-2">Review the differences<ExternalLink size={14} className="ml-1 inline-block align-text-bottom" /></Link>
          </AlertDescription>
        </Alert>
      )}

      <Suspense>
        <div className="flex justify-between items-center space-y-4 max-w-5xl">
          <ProjectPageHeading projectId={project.id} branch={project.branch} />
          <TriggerApplyButton projectId={project.id} />
        </div>
      </Suspense>


      <Suspense>
        <TabsNavigationV2 tabs={tabs} />
      </Suspense>
    </div>
    {children}
  </>

}