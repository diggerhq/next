
import { PageHeading } from "@/components/PageHeading";
import { T } from "@/components/ui/Typography";
import { getLoggedInUserOrganizationRole } from "@/data/user/organizations";
import { getSlimProjectById } from "@/data/user/projects";
import { getRunById } from "@/data/user/runs";
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
}



const DynamicProjectRunDetails = dynamic<ProjectRunDetailsProps>(() =>
    import('./ProjectRunDetails').then((mod) => mod.ProjectRunDetails as ComponentType<ProjectRunDetailsProps>),
    { ssr: false }
)


export default async function RunDetailPage({
    params,

}: RunDetailPageProps) {
    const { runId } = runIdParamSchema.parse(params);
    const run = await getRunById(runId);
    const project_id = run.project_id;
    const [project, user] = await Promise.all([
        getSlimProjectById(project_id),
        serverGetLoggedInUser()
    ]);
    const userProfile = await getUserProfile(user.id);
    const organizationRole = await getLoggedInUserOrganizationRole(project.organization_id);

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
                    <DynamicProjectRunDetails run={run} loggedInUser={userProfile} isUserOrgAdmin={isOrganizationAdmin} />
                </Suspense>
            }
        </div>
    );
}
