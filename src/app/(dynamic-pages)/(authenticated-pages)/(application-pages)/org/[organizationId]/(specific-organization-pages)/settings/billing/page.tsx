import { T } from "@/components/ui/Typography";
import {
  getLoggedInUserOrganizationRole,
  getNormalizedOrganizationSubscription
} from "@/data/user/organizations";
import { Suspense } from "react";

import { organizationParamSchema } from "@/utils/zod-schemas/params";
import type { Metadata } from "next";
import { OrganizationSubscripionDetails } from "./OrganizationSubscripionDetails";

async function Subscription({ organizationId }: { organizationId: string }) {
  const normalizedSubscription =
    await getNormalizedOrganizationSubscription(organizationId);
  const organizationRole =
    await getLoggedInUserOrganizationRole(organizationId);
  return (
    <OrganizationSubscripionDetails
      organizationId={organizationId}
      organizationRole={organizationRole}
      normalizedSubscription={normalizedSubscription}
    />
  );
}

export const metadata: Metadata = {
  title: "Billing",
  description: "You can edit your organization's billing details here.",
};

export default async function OrganizationSettingsPage({
  params,
}: {
  params: unknown;
}) {
  const { organizationId } = organizationParamSchema.parse(params);

  return (
    <Suspense fallback={<T.Subtle>Loading billing details...</T.Subtle>}>
      <Subscription organizationId={organizationId} />
    </Suspense>
  );
}
