import {
  AlertTriangle,
  LayoutDashboard,
  MessageCircle,
  Shield,
  Terminal,
} from 'lucide-react';

export const ADMIN_USER_LIST_VIEW_PAGE_SIZE = 10;
export const ADMIN_ORGANIZATION_LIST_VIEW_PAGE_SIZE = 10;
export const PRODUCT_NAME = 'NextBase';
export const DEV_PORT = 4000;
export const SIDEBAR_VISIBILITY_COOKIE_KEY = 'sidebar_visibility';
export const MOBILE_MEDIA_QUERY_MATCHER = '(max-width: 1023px)';
export const PAYMENT_PROVIDER: 'stripe' | 'lemonsqueezy' = 'stripe';
export const RESTRICTED_SLUG_NAMES = [
  'admin',
  'app_admin',
  'terms',
  'privacy',
  'login',
  'sign-up',
  'forgot-password',
  'reset-password',
  'email-confirmation',
  'redirecting-please-wait',
  '404',
  '500',
  '403',
  'error',
  'onboarding',
  'dashboard',
  'billing',
  'profile',
  'organization',
  'settings',
  'billing-portal',
  'invitations',
  'invite-members',
  'invite-members-success',
  'invite-members-error',
  'project',
  'projects',
  'user',
  'account',
  'users',
  'accounts',
  'blog',
  'docs',
  'feedback',
];

// starts with a letter, ends with a letter or number, and can contain letters, numbers, and hyphens
export const SLUG_PATTERN =
  /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})|(^[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9])$/;

type DiggerFeature = {
  icon: React.ElementType;
  title: string;
  description: string;
};

export const DIGGER_FEATURES: DiggerFeature[] = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description:
      'View projects, activities, run histories, and apply after merge',
  },
  {
    icon: Shield,
    title: 'RBAC',
    description: 'Enable roles and user permissions',
  },
  {
    icon: AlertTriangle,
    title: 'Drift detection',
    description: 'Get notified of Drift Detected in your projects',
  },
  {
    icon: Terminal,
    title: 'Manual Remote Execution via Dgctl',
    description: 'Execute Terraform Plans Remotely',
  },
  {
    icon: MessageCircle,
    title: 'Slack & GitHub Issues integration for Drift detection',
    description: 'Forward Drift Notifications to Slack and to GitHub Issues',
  },
];
