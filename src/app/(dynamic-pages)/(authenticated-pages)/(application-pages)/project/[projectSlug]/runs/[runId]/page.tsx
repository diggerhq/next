
import { PageHeading } from "@/components/PageHeading";
import { T } from "@/components/ui/Typography";
import { getRunById } from "@/data/user/runs";
import {
    runIdParamSchema
} from "@/utils/zod-schemas/params";
import type { Metadata } from "next";
import { Suspense } from "react";
import { RunDetails } from "./RunDetails";

export const metadata: Metadata = {
    title: "Projects",
    description: "You can create projects within teams, or within your organization.",
};

type RunDetailPageProps = {
    params: {
        runId: string;
    };
};


export default async function RunDetailPage({
    params,

}: RunDetailPageProps) {
    const { runId } = runIdParamSchema.parse(params);
    const run = await getRunById(runId);

    return (
        <div className="flex flex-col space-y-4 max-w-5xl mt-8">
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
                    <RunDetails run={run} />
                </Suspense>
            }
        </div>
    );
}
