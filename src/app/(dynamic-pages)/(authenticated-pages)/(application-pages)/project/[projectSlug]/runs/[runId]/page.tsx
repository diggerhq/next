
import { PageHeading } from "@/components/PageHeading";
import { T } from "@/components/ui/Typography";
import { getLoggedInUserOrganizationRole } from "@/data/user/organizations";
import { getProjectsIdsListForUser, getSlimProjectById } from "@/data/user/projects";
import { getRepoDetails } from "@/data/user/repos";
import { getBatchIdFromApplyStageId, getBatchIdFromPlanStageId, getOutputLogsAndWorkflowURLFromBatchId, getRunById, getTFOutputAndWorkflowURLFromBatchId } from "@/data/user/runs";
import { getUserProfile } from "@/data/user/user";
import { Table } from "@/types";
import { serverGetLoggedInUser } from "@/utils/server/serverGetLoggedInUser";
import {
    runIdParamSchema
} from "@/utils/zod-schemas/params";
import type { Metadata } from "next";
import dynamic from 'next/dynamic';
import { ComponentType, Suspense } from "react";

export const metadata: Metadata = {
    title: "Projects",
    description: "You can create projects within teams, or within your organization.",
};

type RunDetailPageProps = {
    params: {
        runId: string;
    };
};

type ProjectRunDetailsProps = {
    run: Table<'digger_runs'>,
    loggedInUser: Table<'user_profiles'>,
    isUserOrgAdmin: boolean
    tfOutput: string | null
    workflowRunUrl: string | null
    applyTerraformOutput: string | null
    applyWorkflowRunUrl: string | null
    fullRepoName: string | null
    planBatchId: string | null
    applyBatchId: string | null
    approverUser: Table<'user_profiles'> | null
}



const DynamicProjectRunDetails = dynamic<ProjectRunDetailsProps>(() =>
    import('./ProjectRunDetails').then((mod) => mod.ProjectRunDetails as ComponentType<ProjectRunDetailsProps>),
    { ssr: false }
)


export default async function RunDetailPage({
    params,

}: RunDetailPageProps) {
    const { runId } = runIdParamSchema.parse(params);



    // Fetch run and user data in parallel
    const [run, user] = await Promise.all([
        getRunById(runId),
        serverGetLoggedInUser(),
    ]);

    const project_id = run.project_id;

    // Fetch project, user profile, and repo details in parallel
    const [project, userProfile, repoDetails] = await Promise.all([
        getSlimProjectById(project_id),
        getUserProfile(user.id),
        getRepoDetails(run.repo_id),
    ]);

    let approverUserProfile
    if (run.approver_user_id) {
        approverUserProfile = await getUserProfile(run.approver_user_id);
    }

    // Fetch organization role and batch IDs in parallel
    const [organizationRole, planBatchId, applyBatchId] = await Promise.all([
        getLoggedInUserOrganizationRole(project.organization_id),
        getBatchIdFromPlanStageId(run.plan_stage_id),
        getBatchIdFromApplyStageId(run.apply_stage_id),

    ]);

    // Fetch terraform outputs and workflow URLs in parallel
    const [planData, applyData, projectsIdsForUser] = await Promise.all([
        getTFOutputAndWorkflowURLFromBatchId(planBatchId),
        getOutputLogsAndWorkflowURLFromBatchId(applyBatchId),
        getProjectsIdsListForUser({ userId: user.id, userRole: organizationRole, organizationId: project.organization_id })
    ]);

    const isOrganizationAdmin =
        organizationRole === "admin" || organizationRole === "owner";
    return (
        <div className="flex flex-col space-y-4 w-full mt-8">
            <PageHeading
                title="Run Details"
                subTitle="Details about the specific project run will be displayed here."
            />
            <div className="flex justify-between gap-2">
            </div>
            {
                <Suspense
                    fallback={
                        <T.P className="text-muted-foreground my-6">
                            Loading run details...
                        </T.P>
                    }
                >
                    <DynamicProjectRunDetails run={run}
                        loggedInUser={userProfile}
                        approverUser={approverUserProfile}
                        isUserOrgAdmin={isOrganizationAdmin}
                        tfOutput={planData.terraform_output}
                        workflowRunUrl={planData.workflow_run_url}
                        applyTerraformOutput={applyData.terraform_output}
                        applyWorkflowRunUrl={applyData.workflow_run_url}
                        fullRepoName={repoDetails.repo_full_name}
                        planBatchId={planBatchId}
                        applyBatchId={applyBatchId}
                    />
                </Suspense>
            }
        </div>
    );
}
