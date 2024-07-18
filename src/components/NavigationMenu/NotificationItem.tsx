import { cn } from '@/utils/cn';

import { T } from '@/components/ui/Typography';
import { UserNotification } from '@/utils/zod-schemas/notifications';
import { useMutation } from '@tanstack/react-query';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { readNotification } from './fetchClientNotifications';

type NotificationItemProps = {
  title: string;
  description: string;
  href?: string;
  image: string;
  isRead: boolean;
  isNew: boolean;
  createdAt: string;
  notificationId: string;
  onHover: () => void;
  type: UserNotification['type'] | 'unknown';
};

export function NotificationItem({
  title,
  description,
  href,
  image,
  isRead,
  isNew,
  createdAt,
  notificationId,
  onHover,
  type,
}: NotificationItemProps) {
  const router = useRouter();
  const { mutate: mutateReadMutation } = useMutation(
    async () => {
      return await readNotification(notificationId);
    },
    {
      onSuccess: () => {
        router.refresh();
      },
    },
  );

  const IconComponent = (LucideIcons[image as keyof typeof LucideIcons] as React.ComponentType<LucideIcons.LucideProps>) || LucideIcons.Layers;

  const getBackgroundColor = (type: UserNotification['type'] | 'unknown') => {
    switch (type) {
      case 'applyFailure':
      case 'policyViolation':
        return 'bg-red-100/50 dark:bg-red-900/20';
      case 'planNeedsApproval':
        return 'bg-purple-100/50 dark:bg-purple-900/20';
      case 'projectDrifted':
        return 'bg-yellow-100/50 dark:bg-yellow-900/20';
      case 'planApproved':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'planRejected':
        return 'bg-orange-100/50 dark:bg-orange-900/20';
      default:
        return 'bg-muted';
    }
  };

  const getIconColor = (type: UserNotification['type'] | 'unknown') => {
    switch (type) {
      case 'applyFailure':
      case 'policyViolation':
        return 'text-red-600 dark:text-red-400';
      case 'planNeedsApproval':
        return 'text-purple-700 dark:text-purple-400';
      case 'projectDrifted':
        return 'text-yellow-700 dark:text-yellow-400';
      case 'planApproved':
        return 'text-green-700 dark:text-green-400';
      case 'planRejected':
        return 'text-orange-700 dark:text-orange-400';
      default:
        return 'text-blue-700 dark:text-blue-400';
    }
  };

  return (
    <div
      onMouseOver={onHover}
      className={cn(
        'grid grid-cols-[auto,1fr,auto] gap-4 w-full text-gray-900 dark:text-white px-4 py-4 border-b border-gray-300/75 dark:border-gray-700/75',
        isRead ? 'bg-muted' : 'bg-background'
      )}
    >
      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", getBackgroundColor(type))}>
        <IconComponent className={cn("h-6 w-6", getIconColor(type))} />
      </div>
      <div className="flex flex-col pt-1 gap-0">
        <T.P className="font-semibold text-foreground mb-0.5 leading-none">
          {title}
        </T.P>
        <T.Small className="font-normal leading-4 text-muted-foreground">
          {description}
        </T.Small>
        {href && (
          <Link href={href} className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 w-fit text-sm underline mt-1" onClick={() => mutateReadMutation()}>
            See details
          </Link>
        )}
        <T.Subtle className="text-xs mt-0.5 text-gray-400 dark:text-gray-600 font-medium tracking-wide">
          {createdAt}
        </T.Subtle>
      </div>
      {isNew && (
        <div className="flex items-center justify-center h-3 w-3 rounded-full bg-destructive"></div>
      )}
    </div>
  );
}