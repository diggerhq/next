import { Json } from '@/lib/database.types';
import { createSupabaseUserServerActionClient } from '@/supabase-clients/user/createSupabaseUserServerActionClient';
import { UserNotification } from '@/utils/zod-schemas/notifications';
import { getFeedbackStakeholdersExceptMentionedUser } from '../feedback';
import { createAdminNotification } from './elevatedQueries';

export const createNotification = async (userId: string, payload: Json) => {
  const supabaseClient = createSupabaseUserServerActionClient();
  const { data: notification, error } = await supabaseClient
    .from('user_notifications')
    .insert({
      user_id: userId,
      payload,
    });
  if (error) throw error;
  return notification;
};

export async function createMultipleNotifications(notifications: Array<{ userId: string; payload: Json }>) {
  const supabaseClient = createSupabaseUserServerActionClient();
  const { data: notificationsData, error } = await supabaseClient
    .from('user_notifications')
    .insert(notifications.map(({ userId, payload }) => ({
      user_id: userId,
      payload,
    })));

  if (error) throw error;
  return notificationsData;
};

export const createAcceptedOrgInvitationNotification = async (
  userId: string,
  {
    organizationId,
    inviteeFullName,
  }: {
    organizationId: string;
    inviteeFullName: string;
  },
) => {
  const payload: Extract<
    UserNotification,
    {
      type: 'acceptedOrganizationInvitation';
    }
  > = {
    organizationId,
    type: 'acceptedOrganizationInvitation',
    userFullName: inviteeFullName,
  };

  return await createNotification(userId, payload);
};

export const createInvitedToOrganizationNotification = async (
  userId: string,
  {
    organizationId,
    organizationName,
    inviterFullName,
    invitationId,
  }: {
    organizationId: string;
    organizationName: string;
    inviterFullName: string;
    invitationId: string;
  },
) => {
  const payload: Extract<
    UserNotification,
    {
      type: 'invitedToOrganization';
    }
  > = {
    organizationId,
    organizationName,
    inviterFullName,
    invitationId,
    type: 'invitedToOrganization',
  };

  return await createNotification(userId, payload);
};

export const createReceivedFeedbackNotification = async ({
  feedbackId,
  feedbackTitle,
  feedbackCreatorFullName,
  feedbackCreatorId
}: {
  feedbackId: string;
  feedbackTitle: string;
  feedbackCreatorFullName: string;
  feedbackCreatorId: string;
}) => {
  const payload: Extract<
    UserNotification,
    {
      type: 'receivedFeedback';
    }
  > = {
    type: 'receivedFeedback',
    feedbackId,
    feedbackTitle,
    feedbackCreatorFullName,
  };

  return await createAdminNotification({ payload, excludedAdminUserId: feedbackCreatorId });
};


export const createFeedbackReceivedCommentNotification = async ({
  feedbackId,
  feedbackTitle,
  commenterId,
  commenterName,
  comment,
}: {
  feedbackId: string;
  feedbackTitle: string;
  comment: string;
  commenterId: string;
  commenterName: string;
}) => {
  const payload: Extract<
    UserNotification,
    {
      type: 'feedbackReceivedComment';
    }
  > = {
    type: 'feedbackReceivedComment',
    feedbackId,
    feedbackTitle,
    comment,
    commenterName
  };
  const feedbackStakeholders = await getFeedbackStakeholdersExceptMentionedUser({ feedbackId, excludedUserId: commenterId });

  const [adminNotificaitonData, stakeholdersNotificationData] = await Promise.all([
    createMultipleNotifications(feedbackStakeholders?.map((userId) => ({ userId, payload }))),
    createAdminNotification({ payload, excludedAdminUserId: commenterId })
  ])

  return {
    adminNotificaitonData,
    stakeholdersNotificationData
  }
};

export const createFeedbackStatusChangedNotification = async ({
  feedbackId,
  newStatus,
  oldStatus,
  feedbackOwnerId,
  statusUpdaterId, //is always admin
}: {
  feedbackId: string;
  newStatus: string;
  oldStatus: string;
  feedbackOwnerId: string;
  statusUpdaterId: string;
}) => {
  const payload: Extract<
    UserNotification,
    {
      type: 'feedbackStatusChanged';
    }
  > = {
    type: 'feedbackStatusChanged',
    feedbackId,
    newStatus,
    oldStatus
  };

  if (feedbackOwnerId === statusUpdaterId) {
    //owner == admin, in which case notify all other admins
    return await createAdminNotification({ payload, excludedAdminUserId: feedbackOwnerId })
  } else {
    // if owner is not admin then notify all the other admins and the owner
    const [adminNotificaitonData, stakeholdersNotificationData] = await Promise.all([
      createNotification(feedbackOwnerId, payload),
      createAdminNotification({ payload, excludedAdminUserId: statusUpdaterId })
    ])

    return {
      adminNotificaitonData,
      stakeholdersNotificationData
    }
  }
};


export const createFeedbackPriorityChangedNotification = async ({
  feedbackId,
  oldPriority,
  newPriority,
  feedbackOwnerId,
  priorityUpdaterId, //is always admin
}: {
  feedbackId: string;
  oldPriority: string;
  newPriority: string;
  feedbackOwnerId: string;
  priorityUpdaterId: string;
}) => {
  const payload: Extract<
    UserNotification,
    {
      type: 'feedbackPriorityChanged';
    }
  > = {
    type: 'feedbackPriorityChanged',
    feedbackId,
    oldPriority,
    newPriority
  };

  if (feedbackOwnerId === priorityUpdaterId) {
    //owner == admin, in which case notify all other admins
    return await createAdminNotification({ payload, excludedAdminUserId: feedbackOwnerId })
  } else {
    // if owner is not admin then notify all the other admins and the owner
    const [adminNotificaitonData, stakeholdersNotificationData] = await Promise.all([
      createNotification(feedbackOwnerId, payload),
      createAdminNotification({ payload, excludedAdminUserId: priorityUpdaterId })
    ])

    return {
      adminNotificaitonData,
      stakeholdersNotificationData
    }
  }
};

export const createFeedbackTypeUpdatedNotification = async ({
  feedbackId,
  oldType,
  newType,
  feedbackOwnerId,
  typeUpdaterId, //is always admin
}: {
  feedbackId: string;
  oldType: string;
  newType: string;
  feedbackOwnerId: string;
  typeUpdaterId: string;
}) => {
  const payload: Extract<
    UserNotification,
    {
      type: 'feedbackTypeUpdated';
    }
  > = {
    type: 'feedbackTypeUpdated',
    feedbackId,
    oldType,
    newType
  };

  if (feedbackOwnerId === typeUpdaterId) {
    //owner == admin, in which case notify all other admins
    return await createAdminNotification({ payload, excludedAdminUserId: feedbackOwnerId })
  } else {
    // if owner is not admin then notify all the other admins and the owner
    const [adminNotificaitonData, stakeholdersNotificationData] = await Promise.all([
      createNotification(feedbackOwnerId, payload),
      createAdminNotification({ payload, excludedAdminUserId: typeUpdaterId })
    ])

    return {
      adminNotificaitonData,
      stakeholdersNotificationData
    }
  }
};


export const createFeedbackAddedToRoadmapUpdatedNotification = async ({ feedbackId, isInRoadmap, updaterId }: { feedbackId: string; isInRoadmap: boolean; updaterId: string; }) => {
  const payload: Extract<
    UserNotification,
    {
      type: 'feedbackIsInRoadmapUpdated';
    }
  > = {
    type: 'feedbackIsInRoadmapUpdated',
    feedbackId,
    isInRoadmap
  };

  // notify all the app admins except the updater
  return await createAdminNotification({ payload, excludedAdminUserId: updaterId })
}

export const createUpdateFeedbackOpenForCommentsNotification = async ({ feedbackId, isOpenForComments, updaterId }: { feedbackId: string; isOpenForComments: boolean; updaterId: string }) => {
  const payload: Extract<
    UserNotification,
    {
      type: 'feedbackFeedbackOpenForCommentUpdated';
    }
  > = {
    type: 'feedbackFeedbackOpenForCommentUpdated',
    feedbackId,
    isOpenForComments
  };

  // notify all the app admins except the updater
  return await createAdminNotification({ payload, excludedAdminUserId: updaterId })
}

export const createFeedbackVisibilityUpdatedNotification = async ({ feedbackId, isPubliclyVisible, updaterId }: { feedbackId: string; isPubliclyVisible: boolean; updaterId: string }) => {
  const payload: Extract<
    UserNotification,
    {
      type: 'feedbackVisibilityUpdated';
    }
  > = {
    type: 'feedbackVisibilityUpdated',
    feedbackId,
    isPubliclyVisible
  };

  // notify all the app admins except the updater
  return await createAdminNotification({ payload, excludedAdminUserId: updaterId })
}
