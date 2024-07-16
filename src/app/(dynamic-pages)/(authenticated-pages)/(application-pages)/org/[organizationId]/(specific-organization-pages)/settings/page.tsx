import {
  getLoggedInUserOrganizationRole,
  getOrganizationSlugByOrganizationId,
  getOrganizationTitle
} from "@/data/user/organizations";
import { organizationParamSchema } from "@/utils/zod-schemas/params";
import type { Metadata } from "next";
import { Suspense } from "react";
import { DeleteOrganization } from "./DeleteOrganization";
import { EditOrganizationForm } from "./EditOrganizationForm";
import { SetDefaultOrganizationPreference } from "./SetDefaultOrganizationPreference";
import { SettingsFormSkeleton } from "./SettingsSkeletons";

async function EditOrganization({
  organizationId,
}: {
  organizationId: string;
}) {
  const organizationTitle = await getOrganizationTitle(organizationId);
  const organizationSlug =
    await getOrganizationSlugByOrganizationId(organizationId);
  return (
    <EditOrganizationForm
      organizationId={organizationId}
      initialTitle={organizationTitle}
      initialSlug={organizationSlug}
    />
  );
}

async function DeleteOrganizationIfAdmin({
  organizationId,
}: {
  organizationId: string;
}) {
  const [organizationTitle, organizationRole] = await Promise.all([
    getOrganizationTitle(organizationId),
    getLoggedInUserOrganizationRole(organizationId),
  ]);
  const isOrganizationAdmin =
    organizationRole === "admin" || organizationRole === "owner";
  if (!isOrganizationAdmin) {
    return null;
  }
  return (
    <DeleteOrganization
      organizationId={organizationId}
      organizationTitle={organizationTitle}
    />
  );
}

export const metadata: Metadata = {
  title: "Settings",
  description: "You can edit your organization's settings here.",
};

export default async function EditOrganizationPage({
  params,
}: {
  params: {
    organizationId: string;
  };
}) {
  const { organizationId } = organizationParamSchema.parse(params);

  return (
    <div className="space-y-4">
      <Suspense fallback={<SettingsFormSkeleton />}>
        <EditOrganization organizationId={organizationId} />
      </Suspense>
      <Suspense fallback={<SettingsFormSkeleton />}>
        <SetDefaultOrganizationPreference organizationId={organizationId} />
      </Suspense>
      <Suspense fallback={<SettingsFormSkeleton />}>
        <DeleteOrganizationIfAdmin organizationId={organizationId} />
      </Suspense>
    </div>
  );
}
