import { z } from 'zod';

const invitedToOrganizationPayload = z.object({
  organizationName: z.string(),
  organizationId: z.string(),
  inviterFullName: z.string(),
  invitationId: z.string(),
  type: z.literal('invitedToOrganization'),
});

export const acceptedOrganizationInvitationPayload = z.object({
  userFullName: z.string(),
  organizationId: z.string(),
  type: z.literal('acceptedOrganizationInvitation'),
});

export const welcomeNotificationPayload = z.object({
  type: z.literal('welcome'),
});

const receivedFeedbackPayload = z.object({
  type: z.literal('receivedFeedback'),
  feedbackId: z.string(),
  feedbackTitle: z.string(),
  feedbackCreatorFullName: z.string(),
});

const feedbackReceivedCommentPayload = z.object({
  type: z.literal('feedbackReceivedComment'),
  feedbackTitle: z.string(),
  feedbackId: z.string(),
  commenterName: z.string(),
  comment: z.string(),
});

const feedbackStatusChangedPayload = z.object({
  type: z.literal('feedbackStatusChanged'),
  feedbackId: z.string(),
  oldStatus: z.string(),
  newStatus: z.string(),
});

const feedbackPriorityChangedPayload = z.object({
  type: z.literal('feedbackPriorityChanged'),
  feedbackId: z.string(),
  oldPriority: z.string(),
  newPriority: z.string(),
});

const feedbackTypeUpdatedPayload = z.object({
  type: z.literal('feedbackTypeUpdated'),
  feedbackId: z.string(),
  oldType: z.string(),
  newType: z.string(),
});

const feedbackIsInRoadmapUpdatedPayload = z.object({
  type: z.literal('feedbackIsInRoadmapUpdated'),
  feedbackId: z.string(),
  isInRoadmap: z.boolean(),
});

const feedbackVisibilityUpdatedPayload = z.object({
  type: z.literal('feedbackVisibilityUpdated'),
  feedbackId: z.string(),
  isPubliclyVisible: z.boolean(),
});

const feedbackFeedbackOpenForCommentUpdatedPayload = z.object({
  type: z.literal('feedbackFeedbackOpenForCommentUpdated'),
  feedbackId: z.string(),
  isOpenForComments: z.boolean(),
});

const applyFailurePayload = z.object({
  type: z.literal('applyFailure'),
  projectName: z.string(),
  projectId: z.string(),
  commitId: z.string(),
  userId: z.string(),
  reason: z.string(),
  dashboardUrl: z.string(),
});

const planNeedsApprovalPayload = z.object({
  type: z.literal('planNeedsApproval'),
  projectName: z.string(),
  projectId: z.string(),
  commitId: z.string(),
  dashboardUrl: z.string(),
});

const planApprovedPayload = z.object({
  type: z.literal('planApproved'),
  planName: z.string(),
  planId: z.string(),
  projectId: z.string(),
  projectName: z.string(),
  approverName: z.string(),
  approverId: z.string(),
});

const planRejectedPayload = z.object({
  type: z.literal('planRejected'),
  planName: z.string(),
  planId: z.string(),
  projectName: z.string(),
  projectId: z.string(),
  rejectorName: z.string(),
  rejectorId: z.string(),
});

const projectDriftedPayload = z.object({
  type: z.literal('projectDrifted'),
  projectName: z.string(),
  projectId: z.string(),
  dashboardUrl: z.string(),
});

const policyViolationPayload = z.object({
  type: z.literal('policyViolation'),
  projectName: z.string(),
  projectId: z.string(),
  dashboardUrl: z.string(),
});

export const userNotificationPayloadSchema = z.union([
  invitedToOrganizationPayload,
  acceptedOrganizationInvitationPayload,
  welcomeNotificationPayload,
  receivedFeedbackPayload,
  feedbackReceivedCommentPayload,
  feedbackStatusChangedPayload,
  feedbackPriorityChangedPayload,
  feedbackTypeUpdatedPayload,
  feedbackIsInRoadmapUpdatedPayload,
  feedbackVisibilityUpdatedPayload,
  feedbackFeedbackOpenForCommentUpdatedPayload,
  applyFailurePayload,
  planNeedsApprovalPayload,
  planApprovedPayload,
  planRejectedPayload,
  projectDriftedPayload,
  policyViolationPayload,
]);

export type UserNotification = z.infer<typeof userNotificationPayloadSchema>;
