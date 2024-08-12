import { Database, FolderIcon, GitPullRequest, Lock, MessageSquare, Terminal, Zap } from "lucide-react";

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
export const SLUG_PATTERN = /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})|(^[a-zA-Z][a-zA-Z0-9-]*[a-zA-Z0-9])$/;

type DiggerFeature = {
  icon: React.ElementType
  title: string
  description: string
}

export const DIGGER_FEATURES: DiggerFeature[] = [
  {
    icon: Lock,
    title: "PR level locks",
    description: "Digger performs a lock when the PR is opened and unlocks when merged, avoiding stale plan previews."
  },
  {
    icon: FolderIcon,
    title: "Dynamic project generation",
    description: "Digger traverses directories according to patterns and dynamically generates the list of projects."
  },
  {
    icon: Database,
    title: "Plan Persistence",
    description: "Store plan outputs in artifacts or cloud provider storage."
  },
  {
    icon: GitPullRequest,
    title: "Plan Previews",
    description: "Digger runs terraform plan on PR creation and appends output as a comment."
  },
  {
    icon: Zap,
    title: "Concurrency",
    description: "Independent plan/apply jobs run in parallel."
  },
  {
    icon: MessageSquare,
    title: "Real-time updates",
    description: "Digger updates a single summary comment with progress in real-time."
  },
  {
    icon: Terminal,
    title: "CommentOps",
    description: "Use commands like Digger apply, plan, lock, and unlock in comments."
  }
]
