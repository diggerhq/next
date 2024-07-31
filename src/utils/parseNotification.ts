import { PRODUCT_NAME } from '@/constants';
import {
  userNotificationPayloadSchema,
  type UserNotification,
} from './zod-schemas/notifications';

type NormalizedNotification = {
  title: string;
  description: string;
  image: string;
  type: UserNotification['type'] | 'unknown';
  detailsLink?: string;
} & (
  | {
      actionType: 'link';
      href: string;
    }
  | {
      actionType: 'button';
    }
);

export const parseNotification = (
  notificationPayload: unknown,
): NormalizedNotification => {
  try {
    const notification =
      userNotificationPayloadSchema.parse(notificationPayload);
    switch (notification.type) {
      case 'applyFailure':
        return {
          title: 'Apply Failure',
          description: `Apply by user ${notification.userId} has failed in commit ${notification.commitId}. Reason: ${notification.reason}.`,
          image: 'AlertTriangle',
          actionType: 'link',
          href: notification.dashboardUrl,
          type: notification.type,
        };
      case 'planNeedsApproval':
        return {
          title: 'Plan Needs Approval',
          description: `Digger apply is pending user approval for commit ${notification.commitId}.`,
          image: 'ClipboardCheck',
          actionType: 'link',
          href: notification.dashboardUrl,
          type: notification.type,
        };
      case 'projectDrifted':
        return {
          title: 'Project Drifted',
          description: `Project ${notification.projectName} has drift detected.`,
          image: 'GitCompare',
          actionType: 'link',
          href: notification.dashboardUrl,
          type: notification.type,
        };
      case 'policyViolation':
        return {
          title: 'Policy Violation Detected',
          description: `A policy violation was detected in ${notification.projectName}.`,
          image: 'ShieldAlert',
          actionType: 'link',
          href: notification.dashboardUrl,
          type: notification.type,
        };
      case 'invitedToOrganization':
        return {
          title: 'Invitation to join organization',
          description: `You have been invited to join ${notification.organizationName}`,
          href: `/invitations/${notification.invitationId}`,
          image: 'Users',
          type: notification.type,
          actionType: 'link',
        };
      case 'acceptedOrganizationInvitation':
        return {
          title: 'Accepted invitation to join organization',
          description: `${notification.userFullName} has accepted your invitation to join your organization`,
          href: `/org/${notification.organizationId}/settings/members`,
          image: 'UserCheck',
          type: notification.type,
          actionType: 'link',
        };
      case 'welcome':
        return {
          title: 'Welcome to the Nextbase',
          description:
            'Welcome to the Nextbase Ultimate. We are glad to see you here!',
          actionType: 'button',
          image: 'Hand',
          type: notification.type,
        };
      case 'receivedFeedback':
        return {
          title: `${PRODUCT_NAME} received new feedback`,
          description: `${notification.feedbackCreatorFullName} said: ${notification.feedbackTitle}`,
          image: 'MessageSquare',
          actionType: 'link',
          href: `/feedback/${notification.feedbackId}`,
          type: notification.type,
        };
      case 'feedbackReceivedComment':
        return {
          title: `New comment on ${notification.feedbackTitle}`,
          description: `${notification.commenterName} says: ${
            notification.comment.slice(0, 50) + '...'
          }`,
          image: 'MessageCircle',
          actionType: 'link',
          href: `/feedback/${notification.feedbackId}`,
          type: notification.type,
        };
      case 'feedbackStatusChanged':
        return {
          title: `Your feedback was updated.`,
          description: `Your feedback status was updated from ${notification.oldStatus} to ${notification.newStatus}`,
          image: 'RefreshCw',
          actionType: 'link',
          href: `/feedback/${notification.feedbackId}`,
          type: notification.type,
        };
      case 'feedbackPriorityChanged':
        return {
          title: `Your feedback was updated.`,
          description: `Your feedback priority was updated from ${notification.oldPriority} to ${notification.newPriority}`,
          image: 'ArrowUpCircle',
          actionType: 'link',
          href: `/feedback/${notification.feedbackId}`,
          type: notification.type,
        };
      case 'feedbackTypeUpdated':
        return {
          title: `Your feedback was updated.`,
          description: `Your feedback type was updated from ${notification.oldType} to ${notification.newType}`,
          image: 'Tag',
          actionType: 'link',
          href: `/feedback/${notification.feedbackId}`,
          type: notification.type,
        };
      case 'feedbackIsInRoadmapUpdated':
        return {
          title: `Your feedback was updated.`,
          description: `Your feedback is now ${
            notification.isInRoadmap ? 'added to' : 'removed from'
          } roadmap.`,
          image: 'Map',
          actionType: 'link',
          href: `/feedback/${notification.feedbackId}`,
          type: notification.type,
        };
      case 'feedbackVisibilityUpdated':
        return {
          title: `Your feedback was updated.`,
          description: `Your feedback is now ${
            notification.isPubliclyVisible ? 'visible to' : 'hidden from'
          } public.`,
          image: 'Eye',
          actionType: 'link',
          href: `/feedback/${notification.feedbackId}`,
          type: notification.type,
        };
      case 'feedbackFeedbackOpenForCommentUpdated':
        return {
          title: `Your feedback was updated.`,
          description: `Your feedback is now ${
            notification.isOpenForComments ? 'open' : 'closed to'
          } comments.`,
          image: 'MessageSquare',
          actionType: 'link',
          href: `/feedback/${notification.feedbackId}`,
          type: notification.type,
        };
      case 'planApproved':
        return {
          title: 'Plan Approved',
          description: `${notification.approverName} approved the plan for ${notification.projectName}`,
          image: 'CheckCircle',
          actionType: 'link',
          href: `/projects/${notification.projectId}/plans/${notification.planId}`,
          type: notification.type,
        };
      case 'planRejected':
        return {
          title: 'Plan Rejected',
          description: `${notification.rejectorName} rejected the plan for ${notification.projectName}`,
          image: 'XCircle',
          actionType: 'link',
          href: `/projects/${notification.projectId}/plans/${notification.planId}`,
          type: notification.type,
        };
      default: {
        return {
          title: 'Unknown notification type',
          description: 'Unknown notification type',
          href: '#',
          image: 'Layers',
          actionType: 'link',
          type: 'unknown',
        };
      }
    }
  } catch (error) {
    return {
      title: 'Unknown notification type',
      description: 'Unknown notification type',
      image: 'help-circle',
      actionType: 'button',
      type: 'unknown',
    };
  }
};
