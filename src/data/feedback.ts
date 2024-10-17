'use server';

import type { Tables } from '@/lib/database.types';
import { supabaseAdminClient } from '@/supabase-clients/admin/supabaseAdminClient';
import { supabaseClientBasedOnUserRole } from '@/supabase-clients/user-role-client';
import type { Enum, SAPayload } from '@/types';
import { serverGetLoggedInUser } from '@/utils/server/serverGetLoggedInUser';
import { serverGetUserType } from '@/utils/server/serverGetUserType';
import { userRoles } from '@/utils/userTypes';
import { revalidatePath } from 'next/cache';
import {
  createFeedbackAddedToRoadmapUpdatedNotification,
  createFeedbackPriorityChangedNotification,
  createFeedbackReceivedCommentNotification,
  createFeedbackStatusChangedNotification,
  createFeedbackTypeUpdatedNotification,
  createFeedbackVisibilityUpdatedNotification,
  createUpdateFeedbackOpenForCommentsNotification,
} from './user/notifications';
import { getUserFullName } from './user/user';

export async function addCommentToInternalFeedbackThread({
  feedbackId,
  content,
}: {
  feedbackId: string;
  content: string;
}): Promise<SAPayload<Tables<'internal_feedback_comments'>[]>> {
  try {
    const user = await serverGetLoggedInUser();
    const userRoleType = await serverGetUserType();
    const supabaseClient = await supabaseClientBasedOnUserRole();

    const { data: feedbackThread, error: feedbackThreadError } =
      await supabaseAdminClient
        .from('internal_feedback_threads')
        .select('*')
        .eq('id', feedbackId)
        .maybeSingle();

    if (feedbackThreadError) {
      return {
        status: 'error',
        message: feedbackThreadError.message,
      };
    }

    /**
     * App admins can comment on all the feedbacks
     * normal user can comment on their own feedback and the one's with open for public
     */
    if (
      !(
        feedbackThread?.open_for_public_discussion ||
        feedbackThread?.user_id == user.id ||
        userRoleType == userRoles.ADMIN
      )
    ) {
      return {
        status: 'error',
        message: 'This feedback thread is not open for public discussion',
      };
    }

    const { data, error } = await supabaseClient
      .from('internal_feedback_comments')
      .insert({ thread_id: feedbackId, user_id: user.id, content })
      .select('*');

    if (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }

    const userFullName = await getUserFullName(user.id);

    await createFeedbackReceivedCommentNotification({
      feedbackId,
      feedbackTitle: feedbackThread?.title || '',
      comment: content,
      commenterId: user.id,
      commenterName: userFullName ?? 'User',
    });

    revalidatePath('/feedback', 'layout');
    revalidatePath(`/feedback/${feedbackId}`, 'layout');
    return {
      status: 'success',
      data,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
    };
  }
}

export async function ownerUpdateFeedbackComment({
  feedbackId,
  commentId,
  feedbackCommentOwnerId,
  content,
}: {
  feedbackId: string;
  commentId: string;
  feedbackCommentOwnerId: string;
  content: string;
}): Promise<SAPayload> {
  const user = await serverGetLoggedInUser();
  if (feedbackCommentOwnerId !== user.id) {
    return {
      status: 'error',
      message: 'You are unathorized to perform this action',
    };
  }

  const supabaseClient = await supabaseClientBasedOnUserRole();

  const { data, error } = await supabaseClient
    .from('internal_feedback_comments')
    .update({ content })
    .eq('id', commentId)
    .eq('thread_id', feedbackId)
    .eq('user_id', feedbackCommentOwnerId);

  if (error) {
    return {
      status: 'error',
      message: error.message,
    };
  }
  revalidatePath('/feedback', 'page');
  revalidatePath(`/feedback/${feedbackId}`, 'page');
  return {
    status: 'success',
  };
}

export async function muteFeedbackThread({
  feedbackId,
  isMuted,
}: {
  feedbackId: string;
  isMuted: boolean;
}) {
  return null;
  // TODO:
  // for logged in users and admins

  // if (error) {
  //     throw error;
  // }

  // revalidatePath(`/feedbacks`, 'page');
  // revalidatePath(`/feedbacks/[[...feedbackId]]`, 'page');
  // return data;
}

export async function adminUpdateFeedbackStatus({
  feedbackId,
  status,
}: {
  feedbackId: string;
  status: Enum<'internal_feedback_thread_status'>;
}): Promise<SAPayload> {
  const userRoleType = await serverGetUserType();
  const user = await serverGetLoggedInUser();

  if (userRoleType !== userRoles.ADMIN) {
    throw new Error('You are unathorized to perform this action');
  }

  const { data: feedbackThread, error: feedbackThreadError } =
    await supabaseAdminClient
      .from('internal_feedback_threads')
      .select('user_id, status')
      .eq('id', feedbackId)
      .single();

  if (feedbackThreadError) {
    return {
      status: 'error',
      message: feedbackThreadError.message,
    };
  }
  const { error } = await supabaseAdminClient
    .from('internal_feedback_threads')
    .update({ status })
    .eq('id', feedbackId);

  if (error) {
    return { status: 'error', message: error.message };
  }

  await createFeedbackStatusChangedNotification({
    feedbackId,
    newStatus: status,
    oldStatus: feedbackThread.status,
    feedbackOwnerId: feedbackThread.user_id,
    statusUpdaterId: user.id,
  });

  revalidatePath('/', 'layout');

  return { status: 'success' };
}

export async function adminUpdateFeedbackType({
  feedbackId,
  type,
}: {
  feedbackId: string;
  type: Enum<'internal_feedback_thread_type'>;
}): Promise<SAPayload> {
  const userRoleType = await serverGetUserType();
  const user = await serverGetLoggedInUser();

  if (userRoleType !== userRoles.ADMIN) {
    throw new Error('You are unathorized to perform this action');
  }

  const { data: feedbackThread, error: feedbackThreadError } =
    await supabaseAdminClient
      .from('internal_feedback_threads')
      .select('user_id, type')
      .eq('id', feedbackId)
      .single();

  if (feedbackThreadError) {
    return {
      status: 'error',
      message: feedbackThreadError.message,
    };
  }

  const { error } = await supabaseAdminClient
    .from('internal_feedback_threads')
    .update({ type })
    .eq('id', feedbackId);

  if (error) {
    return { status: 'error', message: error.message };
  }

  await createFeedbackTypeUpdatedNotification({
    feedbackId,
    newType: type,
    oldType: feedbackThread.type,
    feedbackOwnerId: feedbackThread.user_id,
    typeUpdaterId: user.id,
  });

  revalidatePath('/feedback', 'page');
  revalidatePath(`/feedback/${feedbackId}`, 'page');

  return { status: 'success' };
}

export async function adminUpdateFeedbackPriority({
  feedbackId,
  priority,
}: {
  feedbackId: string;
  priority: Enum<'internal_feedback_thread_priority'>;
}): Promise<SAPayload> {
  const userRoleType = await serverGetUserType();
  const user = await serverGetLoggedInUser();

  if (userRoleType !== userRoles.ADMIN) {
    throw new Error('You are unathorized to perform this action');
  }

  const { data: feedbackThread, error: feedbackThreadError } =
    await supabaseAdminClient
      .from('internal_feedback_threads')
      .select('user_id, priority')
      .eq('id', feedbackId)
      .single();

  if (feedbackThreadError) {
    return {
      status: 'error',
      message: feedbackThreadError.message,
    };
  }

  const { error } = await supabaseAdminClient
    .from('internal_feedback_threads')
    .update({ priority })
    .eq('id', feedbackId);

  if (error) {
    return { status: 'error', message: error.message };
  }

  await createFeedbackPriorityChangedNotification({
    feedbackId,
    newPriority: priority,
    oldPriority: feedbackThread.priority,
    feedbackOwnerId: feedbackThread.user_id,
    priorityUpdaterId: user.id,
  });

  revalidatePath('/feedback', 'page');
  revalidatePath(`/feedback/${feedbackId}`, 'page');

  return { status: 'success' };
}

export async function adminToggleFeedbackFromRoadmap({
  feedbackId,
  isInRoadmap,
}: {
  feedbackId: string;
  isInRoadmap: boolean;
}): Promise<SAPayload> {
  const userRoleType = await serverGetUserType();
  const user = await serverGetLoggedInUser();

  if (userRoleType !== userRoles.ADMIN) {
    throw new Error('You are unathorized to perform this action');
  }

  const { error, data: updatedFeedbackData } = await supabaseAdminClient
    .from('internal_feedback_threads')
    .update({ added_to_roadmap: isInRoadmap })
    .eq('id', feedbackId);

  if (error) {
    return { status: 'error', message: error.message };
  }

  if (isInRoadmap) {
    await adminToggleFeedbackVisibility({
      feedbackId,
      isPubliclyVisible: isInRoadmap,
    });
  }

  await createFeedbackAddedToRoadmapUpdatedNotification({
    feedbackId,
    isInRoadmap,
    updaterId: user.id,
  });

  revalidatePath('/feedback', 'page');
  revalidatePath(`/feedback/${feedbackId}`, 'page');

  return { status: 'success' };
}

export async function adminToggleFeedbackOpenForComments({
  feedbackId,
  isOpenForComments,
}: {
  feedbackId: string;
  isOpenForComments: boolean;
}): Promise<SAPayload> {
  const userRoleType = await serverGetUserType();
  const user = await serverGetLoggedInUser();

  if (userRoleType !== userRoles.ADMIN) {
    throw new Error('You are unathorized to perform this action');
  }

  const { error } = await supabaseAdminClient
    .from('internal_feedback_threads')
    .update({ open_for_public_discussion: isOpenForComments })
    .eq('id', feedbackId);

  if (error) {
    return { status: 'error', message: error.message };
  }

  if (isOpenForComments) {
    await adminToggleFeedbackVisibility({
      feedbackId,
      isPubliclyVisible: isOpenForComments,
    });
  }

  await createUpdateFeedbackOpenForCommentsNotification({
    feedbackId,
    isOpenForComments,
    updaterId: user.id,
  });

  revalidatePath('/feedback', 'page');
  revalidatePath(`/feedback/${feedbackId}`, 'page');

  return { status: 'success' };
}

export async function adminToggleFeedbackVisibility({
  feedbackId,
  isPubliclyVisible,
}: {
  feedbackId: string;
  isPubliclyVisible: boolean;
}): Promise<SAPayload> {
  const userRoleType = await serverGetUserType();
  const user = await serverGetLoggedInUser();

  if (userRoleType !== userRoles.ADMIN) {
    throw new Error('You are unathorized to perform this action');
  }

  const { error } = await supabaseAdminClient
    .from('internal_feedback_threads')
    .update({ is_publicly_visible: isPubliclyVisible })
    .eq('id', feedbackId);

  if (error) {
    return { status: 'error', message: error.message };
  }

  await createFeedbackVisibilityUpdatedNotification({
    feedbackId,
    isPubliclyVisible,
    updaterId: user.id,
  });

  revalidatePath('/feedback', 'page');
  revalidatePath(`/feedback/${feedbackId}`, 'page');

  return { status: 'success' };
}

export async function getFeedbackStakeholdersExceptMentionedUser({
  feedbackId,
  excludedUserId,
}: {
  feedbackId: string;
  excludedUserId?: string;
}): Promise<string[]> {
  // return all the user ids that are concerned with the feedback conversation including owner
  // except the one mentioned, the mentioned user could be owner of the feedback thread or the commentator or logged in user
  try {
    const supabaseClient = await supabaseClientBasedOnUserRole();

    const feedbackOwnerQuery = supabaseClient
      .from('internal_feedback_threads')
      .select('user_id')
      .eq('id', feedbackId);
    const feedbackCommentatorsQuery = supabaseClient
      .from('internal_feedback_comments')
      .select('user_id')
      .eq('thread_id', feedbackId);

    const [feedbackOwnerResult, feedbackCommentatorsResult] = await Promise.all(
      [feedbackOwnerQuery, feedbackCommentatorsQuery],
    );

    if (feedbackOwnerResult.error) throw feedbackOwnerResult.error;
    if (feedbackCommentatorsResult.error)
      throw feedbackCommentatorsResult.error;

    const stakeholders = new Set<string>();

    if (feedbackOwnerResult.data.length > 0) {
      stakeholders.add(feedbackOwnerResult.data[0].user_id);
    }

    feedbackCommentatorsResult.data.forEach((comment) => {
      stakeholders.add(comment.user_id);
    });

    if (excludedUserId) {
      stakeholders.delete(excludedUserId);
    }

    return Array.from(stakeholders);
  } catch (error) {
    console.log('error in getFeedbackStakeholdersExceptMentionedUser: ', error);
    throw error;
  }
}
