import { CreateTeamDialog } from "@/components/CreateTeamDialog";
import { PageHeading } from "@/components/PageHeading";
import { Search } from "@/components/Search";
import { T } from "@/components/ui/Typography";
import {
    organizationParamSchema,
    projectsfilterSchema
} from "@/utils/zod-schemas/params";
import type { Metadata } from "next";
import { Suspense } from "react";
import type { DashboardProps } from "../page";
import { TeamsTableWithPagination } from "./TeamsTableWithPagination";

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
                title="Teams"
                subTitle="You can create teams within your organization."
            />
            <div className="flex justify-between gap-2">
                <div className="md:w-1/3">
                    <Search placeholder="Search teams" />
                    {filters.query && (
                        <p className="text-sm ml-2 mt-4">
                            Searching for <span className="font-bold">{filters.query}</span>
                        </p>
                    )}
                </div>

                <CreateTeamDialog organizationId={organizationId} />
            </div>
            {
                <Suspense
                    fallback={
                        <T.P className="text-muted-foreground my-6">
                            Loading teams...
                        </T.P>
                    }
                >
                    <TeamsTableWithPagination
                        organizationId={organizationId}
                        searchParams={searchParams}
                    />
                </Suspense>
            }
        </div>
    );
}
