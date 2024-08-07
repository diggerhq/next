'use client';
import { PageHeading } from '@/components/PageHeading';
import { TabsNavigationV2 } from '@/components/TabsNavigation/TabsNavigation';
import { Lock, User } from 'lucide-react';
import { useMemo } from 'react';

export default function UserSettingsClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tabs = useMemo(() => {
    return [
      {
        label: 'Account Settings',
        href: `/settings`,
        icon: <User />,
      },
      // {
      //   label: 'Developer Settings',
      //   href: `/settings/developer`,
      //   icon: <Computer />,
      // },
      {
        label: 'Security',
        href: `/settings/security`,
        icon: <Lock />,
      },
    ];
  }, []);

  return (
    <div className="space-y-6 mt-2">
      <PageHeading
        title="User Settings"
        subTitle="Manage your account and security settings here."
      />
      <TabsNavigationV2 tabs={tabs} />
      {children}
    </div>
  );
}
