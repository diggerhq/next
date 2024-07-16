import { PageHeading } from '@/components/PageHeading';
import { getOrganizationTitle } from '@/data/user/organizations';

export async function OrganizationPageHeading({
  organizationId,
  organizationSlug,
}: {
  organizationId: string;
  organizationSlug: string;
}) {
  const organizationTitle = await getOrganizationTitle(organizationId);
  return (
    <PageHeading
      title={organizationTitle}
      titleHref={`/${organizationSlug}`}
    />
  );
}
