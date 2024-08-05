import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getLoggedInUserOrganizationRole
} from "@/data/user/organizations";
import { getTeamsInOrganization } from "@/data/user/teams";
import { organizationParamSchema } from "@/utils/zod-schemas/params";
import type { Metadata } from "next";
import { Suspense } from "react";
import ProjectsTableLoadingFallback from "../../projects/loading";
import { TeamsSettingsTable } from "./TeamsSettingsTable";

export const metadata: Metadata = {
  title: "Teams",
  description: "You can edit your organization's teams here.",
};

async function Teams({ organizationId }: { organizationId: string }) {
  const teams = await getTeamsInOrganization(organizationId);
  const organizationRole =
    await getLoggedInUserOrganizationRole(organizationId);
  const isOrganizationAdmin =
    organizationRole === "admin" || organizationRole === "owner";

  return (
    <Card className="max-w-5xl">
      <div className="flex flex-row justify-between items-center pr-6 w-full">
        <CardHeader>
          <CardTitle>Teams</CardTitle>
          <CardDescription>
            Manage your organization teams here.
          </CardDescription>
        </CardHeader> </div>
      <CardContent className="px-6">
        <TeamsSettingsTable teams={teams} isOrganizationAdmin={isOrganizationAdmin} organizationId={organizationId} />
      </CardContent>
    </Card>
  );
}
export default async function OrganizationPage({
  params,
}: {
  params: unknown;
}) {
  const { organizationId } = organizationParamSchema.parse(params);
  return (
    <div className="space-y-8">
      <Suspense fallback={<ProjectsTableLoadingFallback />}>
        <Teams organizationId={organizationId} />
      </Suspense>
    </div>
  );
}
