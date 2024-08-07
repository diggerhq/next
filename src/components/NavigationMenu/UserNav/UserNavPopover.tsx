'use client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Image from 'next/image';
import { UserSidebarMenu } from './UserSidebarMenu';

export const UserNavPopover = ({
  avatarUrl,
  userFullname,
  userEmail,
  userId,
  appAdminSidebarLink,
}: {
  avatarUrl: string;
  userFullname: string;
  userEmail: string;
  userId: string;
  appAdminSidebarLink: React.ReactNode;
}) => {
  return (
    <>
      <Popover>
        <PopoverTrigger>
          <div
            data-testid="user-nav-avatar"
            data-user-id={userId}
            className="h-[24px] w-[24px] border rounded-full"
          >
            <Image
              src={avatarUrl}
              width={24}
              height={24}
              placeholder="blur"
              blurDataURL={avatarUrl}
              quality={100}
              sizes="100vw"
              alt="User avatar"
              objectFit="cover"
              className="h-full w-full"
              style={{
                borderRadius: '50%',
              }}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent sideOffset={8} align="end" className="w-[240px] p-0 rounded-md overflow-hidden">
          <UserSidebarMenu
            userEmail={userEmail}
            userFullName={userFullname}
            userAvatarUrl={avatarUrl}
            appAdminSidebarLink={appAdminSidebarLink}
          />
        </PopoverContent>
      </Popover>
    </>
  );
};
