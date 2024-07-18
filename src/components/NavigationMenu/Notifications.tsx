'use client';

import { NotificationItem } from '@/components/NavigationMenu/NotificationItem';
import { T } from '@/components/ui/Typography';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSAToastMutation } from '@/hooks/useSAToastMutation';
import { supabaseUserClientComponentClient } from '@/supabase-clients/user/supabaseUserClientComponentClient';
import type { Table } from '@/types';
import { parseNotification } from '@/utils/parseNotification';
import { UserNotification } from '@/utils/zod-schemas/notifications';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { Bell, Check } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDidMount } from 'rooks';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import {
  getPaginatedNotifications,
  getUnseenNotificationIds,
  readAllNotifications,
  seeNotification
} from './fetchClientNotifications';

const testNotifications: (UserNotification & Pick<Table<'user_notifications'>, 'id' | 'created_at' | 'is_read' | 'is_seen'>)[] = [
  {
    id: 'test-apply-failure',
    type: 'applyFailure',
    projectName: 'Test Project',
    projectId: 'test-project-id',
    commitId: 'a34fe',
    userId: 'motatoes',
    reason: 'terraform init failed',
    dashboardUrl: 'https://nextjs-dashboard.com/run/123',
    created_at: '2024-07-17T13:39:26.231Z',
    is_read: false,
    is_seen: false,
  },
  {
    id: 'test-plan-needs-approval',
    type: 'planNeedsApproval',
    projectName: 'Test Project',
    projectId: 'test-project-id',
    commitId: 'a3456',
    dashboardUrl: 'https://nextjs-dashboard.com/run/456',
    created_at: '2024-07-17T12:39:26.231Z',
    is_read: false,
    is_seen: false,
  },
  {
    id: 'test-project-drifted',
    type: 'projectDrifted',
    projectName: 'Test Project',
    projectId: 'test-project-id',
    dashboardUrl: 'https://nextjs-dashboard.com/drift/789',
    created_at: '2024-07-16T14:39:26.231Z',
    is_read: false,
    is_seen: false,
  },
  {
    id: 'test-policy-violation',
    type: 'policyViolation',
    projectName: 'Test Project',
    projectId: 'test-project-id',
    dashboardUrl: 'https://nextjs-dashboard.com/policy-violation/101',
    created_at: '2024-07-16T06:58:22.621Z',
    is_read: false,
    is_seen: false,
  },
  {
    id: 'test-plan-approved',
    type: 'planApproved',
    planName: 'Test Plan',
    planId: 'test-plan-id',
    projectName: 'Test Project',
    projectId: 'test-project-id',
    approverName: 'John Doe',
    approverId: 'test-approver-id',
    created_at: '2024-07-16T06:58:22.621Z',
    is_read: false,
    is_seen: false,
  },
  {
    id: 'test-plan-rejected',
    type: 'planRejected',
    planName: 'Test Plan',
    planId: 'test-plan-id',
    projectName: 'Test Project',
    projectId: 'test-project-id',
    rejectorName: 'Jane Doe',
    rejectorId: 'test-rejector-id',
    created_at: '2024-07-16T06:58:22.621Z',
    is_read: false,
    is_seen: false,
  },
];


export const TestNotifications: React.FC = () => {
  return (
    <>
      {testNotifications.map((notification) => {
        const parsedNotification = parseNotification(notification);
        return (
          <NotificationItem
            key={notification.id}
            title={parsedNotification.title}
            description={parsedNotification.description}
            href={parsedNotification.actionType === 'link' ? parsedNotification.href : undefined}
            image={parsedNotification.image}
            isRead={notification.is_read}
            isNew={!notification.is_seen}
            createdAt={moment(notification.created_at).fromNow()}
            notificationId={notification.id}
            onHover={() => {/* Handle hover */ }}
            type={parsedNotification.type}
          />
        );
      })}
    </>
  );
};

const NOTIFICATIONS_PAGE_SIZE = 10;
const useUnseenNotificationIds = (userId: string) => {
  const { data, refetch } = useQuery(
    ['unseen-notification-ids', userId],
    async () => {
      return getUnseenNotificationIds(userId);
    },
    {
      initialData: [],
      refetchOnWindowFocus: false,
    },
  );
  useEffect(() => {
    const channelId = `user-notifications:${userId}`;
    const channel = supabaseUserClientComponentClient
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_notifications',
          filter: 'user_id=eq.' + userId,
        },
        () => {
          refetch();
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_notifications',
          filter: 'user_id=eq.' + userId,
        },
        (payload) => {
          refetch();
        },
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [refetch, userId]);

  return data ?? 0;
};

export const useNotifications = (userId: string) => {
  const { data, isFetchingNextPage, isLoading, fetchNextPage, hasNextPage, refetch } =
    useInfiniteQuery(
      ['paginatedNotifications', userId],
      async ({ pageParam }) => {
        return getPaginatedNotifications(
          userId,
          pageParam ?? 0,
          NOTIFICATIONS_PAGE_SIZE,
        );
      },
      {
        getNextPageParam: (lastPage, _pages) => {
          const pageNumber = lastPage[0];
          const rows = lastPage[1];

          if (rows.length < NOTIFICATIONS_PAGE_SIZE) return undefined;
          return pageNumber + 1;
        },
        initialData: {
          pageParams: [0],
          pages: [[0, []]],
        },
        // You can disable it here
        refetchOnWindowFocus: false,
      },
    );

  const notifications = data?.pages.flatMap((page) => page[1]) ?? [];
  return {
    notifications,
    isFetchingNextPage,
    isLoading,
    fetchNextPage,
    hasNextPage,
    refetch,
  };
};

function NextPageLoader({ onMount }: { onMount: () => void }) {
  useDidMount(() => {
    onMount();
  });
  return <div className="h-4"></div>;
}

function Notification({
  notification,
}: {
  notification: Table<'user_notifications'>;
}) {
  const router = useRouter();
  const notificationPayload = parseNotification(notification.payload);
  const { mutate: mutateSeeMutation } = useMutation(
    async () => {
      return await seeNotification(notification.id);
    },
    {
      onSuccess: () => {
        router.refresh();
      },
    },
  );

  return (
    <NotificationItem
      key={notification.id}
      title={notificationPayload.title}
      description={notificationPayload.description}
      createdAt={moment(notification.created_at).fromNow()}
      href={
        notificationPayload.actionType === 'link'
          ? notificationPayload.href
          : undefined
      }
      image={notificationPayload.image}
      isRead={notification.is_read}
      isNew={!notification.is_seen}
      notificationId={notification.id}
      onHover={() => {
        if (!notification.is_seen) {
          mutateSeeMutation();
        }
      }}
      type={notificationPayload.type}
    />
  );
}

export const useReadAllNotifications = (userId: string) => {
  const router = useRouter();
  return useSAToastMutation(
    async () => {
      return readAllNotifications(userId);
    },
    {
      loadingMessage: 'Marking all notifications as read...',
      successMessage: 'All notifications marked as read',
      errorMessage(error) {
        try {
          if (error instanceof Error) {
            return String(error.message);
          }
          return `Failed to mark all notifications as read ${String(error)}`;
        } catch (_err) {
          console.warn(_err);
          return 'Failed to mark all notifications as read';
        }
      },
      onSuccess: () => {
        router.refresh();
      },
    },
  );
};

export const Notifications = ({ userId }: { userId: string }) => {
  const unseenNotificationIds = useUnseenNotificationIds(userId);
  const {
    notifications,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useNotifications(userId);
  const { mutate } = useSAToastMutation(
    async () => {
      return readAllNotifications(userId);
    },
    {
      loadingMessage: 'Marking all notifications as read...',
      successMessage: 'All notifications marked as read',
      errorMessage(error) {
        try {
          if (error instanceof Error) {
            return String(error.message);
          }
          return `Failed to mark all notifications as read ${String(error)}`;
        } catch (_err) {
          console.warn(_err);
          return 'Failed to mark all notifications as read';
        }
      },
      onSuccess: () => {
        refetch()
      },
    },
  );

  useEffect(() => {
    refetch()
  }, [unseenNotificationIds])

  return (
    <Popover>
      <PopoverTrigger className="relative focus:ring-none">
        <Bell className="px-0 w-5 h-5 text-muted-foreground hover:text-black dark:hover:text-white" />
        {unseenNotificationIds?.length > 0 && (
          <span className="-top-1.5 -right-2 absolute bg-red-500 px-1.5 rounded-full font-bold text-white text-xs">
            {unseenNotificationIds?.length}
          </span>
        )}
      </PopoverTrigger>

      {notifications.length > 0 || unseenNotificationIds?.length > 0 ? (
        <PopoverContent className="bg-background dark:bg-dark-background mr-12 p-0 rounded-xl w-[480px] overflow-hidden">
          <div className="shadow-lg px-4 py-2 border-b">
            <div className="flex justify-between items-center">
              <T.H3 className="text-lg font-semibold mt-3 dark:text-white">
                Notifications
              </T.H3>
              <div className="flex items-center space-x-1 text-sm cursor-pointer group">
                {unseenNotificationIds?.length > 0 ? (
                  <>
                    <Check className="dark:group-hover:text-gray-400 w-4 h-4 text-muted-foreground" />
                    <span
                      onClick={() => {
                        mutate();
                      }}
                      onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                          mutate();
                        }
                      }}
                      className="dark:group-hover:text-gray-400 text-muted-foreground underline underline-offset-2"
                    >
                      Mark all as read
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="flex flex-col mx-auto">
              {/* Add this line to include the test notifications */}
              <TestNotifications />

              {isLoading ? (
                <Skeleton className="py-2 w-16 h-4 m-2" />
              ) : (
                <>
                  {notifications?.map((notification) => (
                    <Notification
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </>
              )}
              {hasNextPage ? (
                isFetchingNextPage ? (
                  <Skeleton className="py-2 w-16 h-4 m-2" />
                ) : (
                  <NextPageLoader onMount={fetchNextPage} />
                )
              ) : (
                <T.Subtle className="py-2 text-sm text-muted-foreground text-center">
                  No more notifications
                </T.Subtle>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      ) : (
        <PopoverContent className="mr-12 p-0 rounded-xl overflow-hidden">
          <div className="shadow-lg px-4 py-3">
            <T.P className="text-sm text-muted-foreground">No notifications yet.</T.P>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
};