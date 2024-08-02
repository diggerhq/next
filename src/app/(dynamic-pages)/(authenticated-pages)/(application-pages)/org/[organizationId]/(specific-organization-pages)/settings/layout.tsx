import { PageHeading } from '@/components/PageHeading';
import { TabsNavigationV2 } from '@/components/TabsNavigation/TabsNavigation';
import { organizationParamSchema } from '@/utils/zod-schemas/params';
import { DollarSign, SquarePen, UsersRound } from 'lucide-react';

export default async function OrganizationSettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: unknown;
}) {
  const { organizationId } = organizationParamSchema.parse(params);
  const tabs = [
    {
      label: 'General',
      href: `/org/${organizationId}/settings`,
      icon: <SquarePen />,
    },
    {
      label: 'Organization Members',
      href: `/org/${organizationId}/settings/members`,
      icon: <UsersRound />,
    },
    {
      label: 'Billing',
      href: `/org/${organizationId}/settings/billing`,
      icon: <DollarSign />,
    },
  ];

  return (
    <div className="space-y-6 mt-8">
      <PageHeading title="Organization Settings" subTitle="Manage your organization settings here" />
      <TabsNavigationV2 tabs={tabs} />
      {children}
    </div>
  );
}
