import { AppAdminSidebarLink } from '@/components/AppAdminSidebarLink';
import { Notifications } from '@/components/NavigationMenu/Notifications';
import { ThemeToggle } from '@/components/ThemeToggle';
import { getUserProfile } from '@/data/user/user';
import { getUserAvatarUrl } from '@/utils/helpers';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';
import { Suspense } from 'react';
import { UserNavPopover } from './UserNavPopover';

export async function UserNav() {
  const user = await serverGetLoggedInUser();
  const { email } = user;
  if (!email) {
    // unreachable
    throw new Error('User email not found');
  }

  const userProfile = await getUserProfile(user.id);
  return (
    <>
      <ThemeToggle />
      <Notifications userId={user.id} />

      <UserNavPopover
        avatarUrl={getUserAvatarUrl({
          email,
          profileAvatarUrl: userProfile.avatar_url,
        })}
        userFullname={userProfile.full_name ?? `User ${email}`}
        userEmail={email}
        userId={user.id}
        appAdminSidebarLink={
          <Suspense>
            <div className="h-px bg-gray-200 dark:bg-gray-700  my-2" />
            <AppAdminSidebarLink />
          </Suspense>
        }
      />
    </>
  );
}
