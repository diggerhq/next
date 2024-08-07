
import { cn } from '@/utils/cn';
import { Lock, LogOut, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function UserSidebarMenu({
  userEmail,
  userFullName,
  userAvatarUrl,
  appAdminSidebarLink,
}: {
  userEmail: string;
  userFullName: string;
  userAvatarUrl: string;
  appAdminSidebarLink: ReactNode;
}) {
  return (
    <div className="dark:bg-black ">
      <div
        className="grid items-start mt-1 gap-2 mb-2 overflow-hidden"
        style={{
          gridTemplateColumns: 'min-content 1fr',
        }}
      >
        <div className="h-[28px] mt-1 w-[28px] rounded-full border">
          <Image
            src={userAvatarUrl}
            width={28}
            height={28}
            placeholder="blur"
            blurDataURL={userAvatarUrl}
            quality={100}
            sizes="100vw"
            alt="User avatar"
            className="h-full w-full"
            objectFit="cover"
            style={{
              borderRadius: '50%',
            }}
          />
        </div>
        <div className="mb-1 overflow-hidden">
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate w-full text-ellipsis">
            {userFullName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-ellipsis">
            {userEmail}
          </div>
        </div>
      </div>
      <div className="h-px bg-gray-200 dark:bg-gray-700  my-2" />
      <Link
        href="/settings"
        className={cn(
          'hover:bg-gray-100 hover:text-gray-900 text-gray-700 rounded-sm dark:text-gray-400 dark:hover:bg-gray-700/50',
          'flex gap-2 items-center py-2 text-sm',
        )}
      >
        <User className="text-lg" /> Account settings
      </Link>
      {/* <Link
        href="/settings/developer"
        className={cn(
          'hover:bg-gray-100 hover:text-gray-900 text-gray-700 rounded-sm dark:text-gray-400 dark:hover:bg-gray-700/50',
          'flex gap-2 items-center py-2 text-sm',
        )}
      >
        <Computer className="text-lg" /> Developer Settings
      </Link> */}
      <Link
        href="/settings/security"
        className={cn(
          'hover:bg-gray-100 hover:text-gray-900 text-gray-700 rounded-sm dark:text-gray-400 dark:hover:bg-gray-700/50',
          'flex gap-2 items-center py-2 text-sm',
        )}
      >
        <Lock className="text-lg" /> Security Settings
      </Link>

      {/* {appAdminSidebarLink} */}
      <div className="h-px bg-gray-200 dark:bg-gray-700  my-2" />
      {/* <FeatureViewModal />
      <GiveFeedbackDialog>
        <div
          data-testid="feedback-link"
          className={cn(
            'hover:bg-gray-100 hover:text-gray-900 text-gray-700 rounded-sm dark:text-gray-400 dark:hover:bg-gray-700/50 w-full',
            'flex gap-2 items-center py-2 text-sm cursor-pointer',
          )}
        >
          <Mail className="text-lg" />
          Feedback
        </div>
      </GiveFeedbackDialog> */}

      {/* <div className="h-px bg-gray-200 dark:bg-gray-700  my-2" /> */}
      <Link
        href="/logout"
        prefetch={false}
        className={cn(
          'hover:bg-gray-100 hover:text-gray-900 text-gray-700 rounded-sm dark:text-gray-400 dark:hover:bg-gray-700/50',
          'flex gap-2 items-center py-2 text-sm',
        )}
      >
        <LogOut className="text-lg" />
        Log out
      </Link>
    </div>
  );
}
