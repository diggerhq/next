import { PageHeading } from "@/components/PageHeading";
import { T } from "@/components/ui/Typography";
import {
    organizationParamSchema,
    projectsfilterSchema
} from "@/utils/zod-schemas/params";
import type { Metadata } from "next";
import { Suspense } from "react";
import type { DashboardProps } from "../page";
import AllActivityDetails from "./AllActivityDetails";

export const metadata: Metadata = {
    title: "Teams",
    description: "You can create teams within your organization.",
};

export default async function Page({
    params,
    searchParams,
}: DashboardProps) {
    const { organizationId } = organizationParamSchema.parse(params);
    const filters = projectsfilterSchema.parse(searchParams);

    return (
        <div className="flex flex-col space-y-4 max-w-5xl mt-8">
            <PageHeading
                title="Activity"
                subTitle="Organisational activity for all projects"
            />

            <Suspense
                fallback={
                    <T.P className="text-muted-foreground my-6">
                        Loading teams...
                    </T.P>
                }
            >
                <AllActivityDetails projectId="8c1e07ac-abaa-4258-b7ef-4c0ab1353b9c" projectSlug="testproj01" />
            </Suspense>
        </div>
    );
}