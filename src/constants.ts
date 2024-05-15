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
  'feedback'
]

// starts with a letter, ends with a letter or number, and can contain letters, numbers, and hyphens
export const SLUG_PATTERN = /^[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9]$/;

