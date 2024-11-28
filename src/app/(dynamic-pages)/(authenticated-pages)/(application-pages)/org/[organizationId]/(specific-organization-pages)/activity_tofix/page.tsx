import { PageHeading } from "@/components/PageHeading";
import { T } from "@/components/ui/Typography";
import { getLoggedInUserOrganizationRole } from "@/data/user/organizations";
import { getProjectsIdsListForUser } from "@/data/user/projects";
import { serverGetLoggedInUser } from "@/utils/server/serverGetLoggedInUser";
import {
    organizationParamSchema
} from "@/utils/zod-schemas/params";
import type { Metadata } from "next";
import { Suspense } from "react";
import type { DashboardProps } from "../page";
import AllActivityDetails from "./AllActivityDetails";

export const metadata: Metadata = {
    title: "Activity",
    description: "Activity in all projects of this organization",
};

export default async function Page({
    params,
    searchParams,
}: DashboardProps) {
    const { organizationId } = organizationParamSchema.parse(params);
    const [{ id }, userRole, allowedProjectIdsForUser] = await Promise.all([
        serverGetLoggedInUser(),
        getLoggedInUserOrganizationRole(organizationId),
        getProjectsIdsListForUser({ userId: (await serverGetLoggedInUser()).id, userRole: await getLoggedInUserOrganizationRole(organizationId), organizationId })
    ]);

    return (
        <div className="flex flex-col space-y-4 max-w-5xl mt-8">
            <PageHeading
                title="Activity"
                subTitle="Activity for all projects in this organization"
            />

            <Suspense
                fallback={
                    <T.P className="text-muted-foreground my-6">
                        Loading activity...
                    </T.P>
                }
            >
                <AllActivityDetails organizationId={organizationId} allowedProjectIdsForUser={allowedProjectIdsForUser} />
            </Suspense>
        </div>
    );
}