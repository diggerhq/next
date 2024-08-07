
import { Separator } from '@/components/ui/separator';
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
    <div className="bg-background">
      <div
        className="grid items-start gap-3 py-3 px-3 overflow-hidden"
        style={{
          gridTemplateColumns: 'min-content 1fr',
        }}
      >
        <div className="size-[32px] rounded-full border">
          <Image
            src={userAvatarUrl}
            width={32}
            height={32}
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
        <div className="mb-1 -mt-0.5 overflow-hidden">
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate w-full text-ellipsis">
            {userFullName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-ellipsis">
            {userEmail}
          </div>
        </div>
      </div>
      <Separator />
      <div className='space-y-1 px-2 py-2'>

        <Link
          href="/settings"
          className={cn(
            'hover:bg-muted rounded-sm',
            'flex gap-2 px-2 items-center py-1.5 text-sm',
          )}
        >
          <User className="size-4 text-foreground" /> Account settings
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
            'hover:bg-muted rounded-sm',
            'flex gap-2 px-2 items-center py-1.5 text-sm',
          )}
        >
          <Lock className="size-4 text-foreground" /> Security Settings
        </Link>

        {/* {appAdminSidebarLink} */}
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

      </div>
      <Separator />
      <div className='px-2 py-2 pb-2'>
        <Link
          href="/logout"
          prefetch={false}
          className={cn(
            'hover:bg-muted rounded-sm',
            'flex gap-2 px-2 items-center py-1.5 text-sm',
          )}
        >
          <LogOut className="size-4 text-foreground" />
          Log out
        </Link>
      </div>

    </div>
  );
}
