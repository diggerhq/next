-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "auth"."aal_level" AS ENUM ('aal1', 'aal2', 'aal3');

-- CreateEnum
CREATE TYPE "auth"."code_challenge_method" AS ENUM ('s256', 'plain');

-- CreateEnum
CREATE TYPE "auth"."factor_status" AS ENUM ('unverified', 'verified');

-- CreateEnum
CREATE TYPE "auth"."factor_type" AS ENUM ('totp', 'webauthn', 'phone');

-- CreateEnum
CREATE TYPE "auth"."one_time_token_type" AS ENUM ('confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token');

-- CreateEnum
CREATE TYPE "public"."app_admin_role" AS ENUM ('moderator', 'admin', 'super_admin');

-- CreateEnum
CREATE TYPE "public"."app_role" AS ENUM ('admin');

-- CreateEnum
CREATE TYPE "public"."iac_type_enum" AS ENUM ('terraform', 'terragrunt', 'opentofu');

-- CreateEnum
CREATE TYPE "public"."internal_blog_post_status" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "public"."internal_feedback_thread_priority" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "public"."internal_feedback_thread_status" AS ENUM ('open', 'under_review', 'planned', 'closed', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "public"."internal_feedback_thread_type" AS ENUM ('bug', 'feature_request', 'general');

-- CreateEnum
CREATE TYPE "public"."organization_join_invitation_link_status" AS ENUM ('active', 'finished_accepted', 'finished_declined', 'inactive');

-- CreateEnum
CREATE TYPE "public"."organization_joining_status" AS ENUM ('invited', 'joinied', 'declined_invitation', 'joined');

-- CreateEnum
CREATE TYPE "public"."organization_member_role" AS ENUM ('owner', 'admin', 'member', 'readonly');

-- CreateEnum
CREATE TYPE "public"."pricing_plan_interval" AS ENUM ('day', 'week', 'month', 'year');

-- CreateEnum
CREATE TYPE "public"."pricing_type" AS ENUM ('one_time', 'recurring');

-- CreateEnum
CREATE TYPE "public"."project_status" AS ENUM ('draft', 'pending_approval', 'approved', 'completed');

-- CreateEnum
CREATE TYPE "public"."project_team_member_role" AS ENUM ('admin', 'member', 'readonly');

-- CreateEnum
CREATE TYPE "public"."subscription_status" AS ENUM ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused');

-- CreateTable
CREATE TABLE "auth"."audit_log_entries" (
    "instance_id" UUID,
    "id" UUID NOT NULL,
    "payload" JSON,
    "created_at" TIMESTAMPTZ(6),
    "ip_address" VARCHAR(64) NOT NULL DEFAULT '',

    CONSTRAINT "audit_log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."flow_state" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "auth_code" TEXT NOT NULL,
    "code_challenge_method" "auth"."code_challenge_method" NOT NULL,
    "code_challenge" TEXT NOT NULL,
    "provider_type" TEXT NOT NULL,
    "provider_access_token" TEXT,
    "provider_refresh_token" TEXT,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "authentication_method" TEXT NOT NULL,
    "auth_code_issued_at" TIMESTAMPTZ(6),

    CONSTRAINT "flow_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."identities" (
    "provider_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "identity_data" JSONB NOT NULL,
    "provider" TEXT NOT NULL,
    "last_sign_in_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "email" TEXT DEFAULT lower((identity_data ->> 'email'::text)),
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),

    CONSTRAINT "identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."instances" (
    "id" UUID NOT NULL,
    "uuid" UUID,
    "raw_base_config" TEXT,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."mfa_amr_claims" (
    "session_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "authentication_method" TEXT NOT NULL,
    "id" UUID NOT NULL,

    CONSTRAINT "amr_id_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."mfa_challenges" (
    "id" UUID NOT NULL,
    "factor_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "verified_at" TIMESTAMPTZ(6),
    "ip_address" INET NOT NULL,
    "otp_code" TEXT,

    CONSTRAINT "mfa_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."mfa_factors" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "friendly_name" TEXT,
    "factor_type" "auth"."factor_type" NOT NULL,
    "status" "auth"."factor_status" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "secret" TEXT,
    "phone" TEXT,
    "last_challenged_at" TIMESTAMPTZ(6),

    CONSTRAINT "mfa_factors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."one_time_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_type" "auth"."one_time_token_type" NOT NULL,
    "token_hash" TEXT NOT NULL,
    "relates_to" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "one_time_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."refresh_tokens" (
    "instance_id" UUID,
    "id" BIGSERIAL NOT NULL,
    "token" VARCHAR(255),
    "user_id" VARCHAR(255),
    "revoked" BOOLEAN,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "parent" VARCHAR(255),
    "session_id" UUID,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."saml_providers" (
    "id" UUID NOT NULL,
    "sso_provider_id" UUID NOT NULL,
    "entity_id" TEXT NOT NULL,
    "metadata_xml" TEXT NOT NULL,
    "metadata_url" TEXT,
    "attribute_mapping" JSONB,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "name_id_format" TEXT,

    CONSTRAINT "saml_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."saml_relay_states" (
    "id" UUID NOT NULL,
    "sso_provider_id" UUID NOT NULL,
    "request_id" TEXT NOT NULL,
    "for_email" TEXT,
    "redirect_to" TEXT,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "flow_state_id" UUID,

    CONSTRAINT "saml_relay_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."schema_migrations" (
    "version" VARCHAR(255) NOT NULL,

    CONSTRAINT "schema_migrations_pkey" PRIMARY KEY ("version")
);

-- CreateTable
CREATE TABLE "auth"."sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "factor_id" UUID,
    "aal" "auth"."aal_level",
    "not_after" TIMESTAMPTZ(6),
    "refreshed_at" TIMESTAMP(6),
    "user_agent" TEXT,
    "ip" INET,
    "tag" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."sso_domains" (
    "id" UUID NOT NULL,
    "sso_provider_id" UUID NOT NULL,
    "domain" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "sso_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."sso_providers" (
    "id" UUID NOT NULL,
    "resource_id" TEXT,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "sso_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."users" (
    "instance_id" UUID,
    "id" UUID NOT NULL,
    "aud" VARCHAR(255),
    "role" VARCHAR(255),
    "email" VARCHAR(255),
    "encrypted_password" VARCHAR(255),
    "email_confirmed_at" TIMESTAMPTZ(6),
    "invited_at" TIMESTAMPTZ(6),
    "confirmation_token" VARCHAR(255),
    "confirmation_sent_at" TIMESTAMPTZ(6),
    "recovery_token" VARCHAR(255),
    "recovery_sent_at" TIMESTAMPTZ(6),
    "email_change_token_new" VARCHAR(255),
    "email_change" VARCHAR(255),
    "email_change_sent_at" TIMESTAMPTZ(6),
    "last_sign_in_at" TIMESTAMPTZ(6),
    "raw_app_meta_data" JSONB,
    "raw_user_meta_data" JSONB,
    "is_super_admin" BOOLEAN,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "phone" TEXT,
    "phone_confirmed_at" TIMESTAMPTZ(6),
    "phone_change" TEXT DEFAULT '',
    "phone_change_token" VARCHAR(255) DEFAULT '',
    "phone_change_sent_at" TIMESTAMPTZ(6),
    "confirmed_at" TIMESTAMPTZ(6) DEFAULT LEAST(email_confirmed_at, phone_confirmed_at),
    "email_change_token_current" VARCHAR(255) DEFAULT '',
    "email_change_confirm_status" SMALLINT DEFAULT 0,
    "banned_until" TIMESTAMPTZ(6),
    "reauthentication_token" VARCHAR(255) DEFAULT '',
    "reauthentication_sent_at" TIMESTAMPTZ(6),
    "is_sso_user" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMPTZ(6),
    "is_anonymous" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."account_delete_tokens" (
    "token" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,

    CONSTRAINT "account_delete_tokens_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."billing_bypass_organizations" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_bypass_organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chats" (
    "id" TEXT NOT NULL,
    "user_id" UUID,
    "payload" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT timezone('utc'::text, now()),
    "project_id" UUID NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customers" (
    "stripe_customer_id" VARCHAR NOT NULL,
    "organization_id" UUID NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("stripe_customer_id","organization_id")
);

-- CreateTable
CREATE TABLE "public"."digger_batches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pr_number" BIGINT,
    "status" SMALLINT NOT NULL,
    "branch_name" TEXT NOT NULL,
    "digger_config" TEXT,
    "github_installation_id" BIGINT,
    "repo_full_name" TEXT NOT NULL,
    "repo_owner" TEXT NOT NULL,
    "repo_name" TEXT NOT NULL,
    "batch_type" TEXT NOT NULL,
    "comment_id" BIGINT,
    "source_details" BYTEA,
    "vcs" TEXT,
    "gitlab_project_id" BIGINT,
    "organization_id" UUID,
    "event_type" TEXT,

    CONSTRAINT "digger_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."digger_job_parent_links" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "digger_job_id" TEXT,
    "parent_digger_job_id" TEXT,

    CONSTRAINT "digger_job_parent_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."digger_job_summaries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "resources_created" BIGINT NOT NULL DEFAULT 0,
    "resources_deleted" BIGINT NOT NULL DEFAULT 0,
    "resources_updated" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "digger_job_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."digger_job_tokens" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "value" TEXT,
    "expiry" TIMESTAMPTZ(6),
    "type" TEXT,
    "organisation_id" UUID,

    CONSTRAINT "job_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."digger_jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "digger_job_id" TEXT NOT NULL,
    "status" SMALLINT NOT NULL,
    "batch_id" UUID NOT NULL,
    "status_updated_at" TIMESTAMPTZ(6),
    "digger_job_summary_id" UUID,
    "workflow_file" TEXT,
    "workflow_run_url" TEXT,
    "plan_footprint" BYTEA,
    "pr_comment_url" TEXT,
    "terraform_output" TEXT,
    "job_spec" BYTEA,
    "variables_spec" BYTEA,

    CONSTRAINT "digger_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."digger_locks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "resource" TEXT NOT NULL,
    "lock_id" BIGINT NOT NULL,
    "organization_id" UUID NOT NULL,

    CONSTRAINT "digger_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."digger_run_queue_items" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "digger_run_id" UUID,
    "project_id" UUID,

    CONSTRAINT "digger_run_queue_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."digger_run_stages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "batch_id" UUID NOT NULL,

    CONSTRAINT "digger_run_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."digger_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "triggertype" TEXT NOT NULL,
    "pr_number" BIGINT,
    "status" TEXT NOT NULL,
    "commit_id" TEXT NOT NULL,
    "digger_config" TEXT,
    "github_installation_id" BIGINT,
    "repo_id" BIGSERIAL NOT NULL,
    "run_type" TEXT NOT NULL,
    "plan_stage_id" UUID,
    "apply_stage_id" UUID,
    "project_name" TEXT,
    "is_approved" BOOLEAN,
    "approval_author" TEXT,
    "approval_date" TIMESTAMPTZ(6),
    "project_id" UUID NOT NULL,
    "terraform_output" TEXT,
    "apply_logs" TEXT,
    "approver_user_id" UUID,
    "triggered_by_user_id" UUID,

    CONSTRAINT "digger_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."env_vars" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_secret" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "encrypted_env_vars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."github_app_installation_links" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "github_installation_id" BIGINT NOT NULL,
    "organization_id" UUID NOT NULL,
    "status" SMALLINT NOT NULL,

    CONSTRAINT "github_app_installation_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."github_app_installations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "github_installation_id" BIGINT NOT NULL,
    "github_app_id" BIGINT NOT NULL,
    "account_id" BIGINT NOT NULL,
    "login" TEXT NOT NULL,
    "repo" TEXT,
    "status" BIGINT NOT NULL,

    CONSTRAINT "github_app_installations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."github_apps" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "github_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "github_app_url" TEXT NOT NULL,

    CONSTRAINT "github_apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."internal_blog_author_posts" (
    "author_id" UUID NOT NULL,
    "post_id" UUID NOT NULL,

    CONSTRAINT "internal_blog_author_posts_pkey" PRIMARY KEY ("author_id","post_id")
);

-- CreateTable
CREATE TABLE "public"."internal_blog_author_profiles" (
    "user_id" UUID NOT NULL,
    "display_name" VARCHAR(255) NOT NULL,
    "bio" TEXT NOT NULL,
    "avatar_url" VARCHAR(255) NOT NULL,
    "website_url" VARCHAR(255),
    "twitter_handle" VARCHAR(255),
    "facebook_handle" VARCHAR(255),
    "linkedin_handle" VARCHAR(255),
    "instagram_handle" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internal_blog_author_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."internal_blog_post_tags" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "internal_blog_post_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."internal_blog_post_tags_relationship" (
    "blog_post_id" UUID NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "internal_blog_post_tags_relationship_pkey" PRIMARY KEY ("blog_post_id","tag_id")
);

-- CreateTable
CREATE TABLE "public"."internal_blog_posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."internal_blog_post_status" NOT NULL DEFAULT 'draft',
    "cover_image" VARCHAR(255),
    "seo_data" JSONB,
    "json_content" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "internal_blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."internal_changelog" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "changes" TEXT NOT NULL,
    "user_id" UUID,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "cover_image" TEXT,

    CONSTRAINT "internal_changelog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."internal_feedback_comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "thread_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "internal_feedback_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."internal_feedback_threads" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priority" "public"."internal_feedback_thread_priority" NOT NULL DEFAULT 'low',
    "type" "public"."internal_feedback_thread_type" NOT NULL DEFAULT 'general',
    "status" "public"."internal_feedback_thread_status" NOT NULL DEFAULT 'open',
    "added_to_roadmap" BOOLEAN NOT NULL DEFAULT false,
    "open_for_public_discussion" BOOLEAN NOT NULL DEFAULT false,
    "is_publicly_visible" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "internal_feedback_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organization_credits" (
    "organization_id" UUID NOT NULL,
    "credits" BIGINT NOT NULL DEFAULT 12,

    CONSTRAINT "organization_credits_pkey" PRIMARY KEY ("organization_id")
);

-- CreateTable
CREATE TABLE "public"."organization_join_invitations" (
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inviter_user_id" UUID NOT NULL,
    "status" "public"."organization_join_invitation_link_status" NOT NULL DEFAULT 'active',
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "invitee_user_email" VARCHAR NOT NULL,
    "organization_id" UUID NOT NULL,
    "invitee_organization_role" "public"."organization_member_role" NOT NULL DEFAULT 'member',
    "invitee_user_id" UUID,

    CONSTRAINT "organization_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organization_members" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "member_id" UUID NOT NULL,
    "member_role" "public"."organization_member_role" NOT NULL,
    "organization_id" UUID NOT NULL,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organizations" (
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" VARCHAR NOT NULL DEFAULT 'Test Organization',
    "slug" VARCHAR(255) NOT NULL DEFAULT (gen_random_uuid())::text,
    "public_key" TEXT,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organizations_private_info" (
    "id" UUID NOT NULL,
    "billing_address" JSON,
    "payment_method" JSON,

    CONSTRAINT "projects_private_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prices" (
    "id" VARCHAR NOT NULL,
    "product_id" VARCHAR,
    "active" BOOLEAN,
    "description" VARCHAR,
    "unit_amount" BIGINT,
    "currency" VARCHAR,
    "type" "public"."pricing_type",
    "interval" "public"."pricing_plan_interval",
    "interval_count" BIGINT,
    "trial_period_days" BIGINT,
    "metadata" JSONB,

    CONSTRAINT "price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" VARCHAR NOT NULL,
    "active" BOOLEAN,
    "name" VARCHAR,
    "description" VARCHAR,
    "image" VARCHAR,
    "metadata" JSONB,
    "is_visible_in_ui" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_comments" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "in_reply_to" BIGINT,
    "project_id" UUID NOT NULL,

    CONSTRAINT "project_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project_tfvars" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "project_id" UUID NOT NULL,
    "tfvars" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_tfvars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."projects" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization_id" UUID NOT NULL,
    "team_id" BIGINT,
    "project_status" "public"."project_status" NOT NULL DEFAULT 'draft',
    "slug" VARCHAR(255) NOT NULL DEFAULT (gen_random_uuid())::text,
    "latest_action_on" TEXT,
    "repo_id" BIGSERIAL NOT NULL,
    "configuration_yaml" TEXT,
    "status" TEXT,
    "is_generated" BOOLEAN,
    "is_in_main_branch" BOOLEAN,
    "deleted_at" TIMESTAMPTZ(6),
    "terraform_working_dir" TEXT,
    "is_managing_state" BOOLEAN,
    "labels" TEXT[],
    "is_drift_detection_enabled" BOOLEAN DEFAULT false,
    "drift_crontab" TEXT,
    "branch" TEXT,
    "latest_drift_output" TEXT,
    "iac_type" "public"."iac_type_enum" DEFAULT 'terraform',
    "workspace" TEXT,
    "workflow_file" TEXT,
    "include_patterns" TEXT,
    "exclude_patterns" TEXT,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."repos" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "name" TEXT NOT NULL,
    "organization_id" UUID,
    "digger_config" TEXT,
    "repo_name" TEXT,
    "repo_full_name" TEXT,
    "repo_organisation" TEXT,
    "repo_url" TEXT,

    CONSTRAINT "repos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "id" VARCHAR NOT NULL,
    "status" "public"."subscription_status",
    "metadata" JSON,
    "price_id" VARCHAR,
    "quantity" BIGINT,
    "cancel_at_period_end" BOOLEAN,
    "created" TIMESTAMPTZ(6) NOT NULL,
    "current_period_start" TIMESTAMPTZ(6) NOT NULL,
    "current_period_end" TIMESTAMPTZ(6) NOT NULL,
    "ended_at" TIMESTAMPTZ(6),
    "cancel_at" TIMESTAMPTZ(6),
    "canceled_at" TIMESTAMPTZ(6),
    "trial_start" TIMESTAMPTZ(6),
    "trial_end" TIMESTAMPTZ(6),
    "organization_id" UUID,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."team_members" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "role" "public"."project_team_member_role" NOT NULL DEFAULT 'member',
    "team_id" BIGINT NOT NULL,

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."teams" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_api_keys" (
    "key_id" TEXT NOT NULL,
    "masked_key" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ(6),
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_api_keys_pkey" PRIMARY KEY ("key_id")
);

-- CreateTable
CREATE TABLE "public"."user_notifications" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_seen" BOOLEAN NOT NULL DEFAULT false,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_onboarding" (
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_terms" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_onboarding_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."user_private_info" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "default_organization" UUID,

    CONSTRAINT "user_private_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_profiles" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR,
    "avatar_url" VARCHAR,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_name" VARCHAR,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_roles" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "public"."app_role" NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_instance_id_idx" ON "auth"."audit_log_entries"("instance_id");

-- CreateIndex
CREATE INDEX "flow_state_created_at_idx" ON "auth"."flow_state"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_auth_code" ON "auth"."flow_state"("auth_code");

-- CreateIndex
CREATE INDEX "idx_user_id_auth_method" ON "auth"."flow_state"("user_id", "authentication_method");

-- CreateIndex
CREATE INDEX "identities_email_idx" ON "auth"."identities"("email");

-- CreateIndex
CREATE INDEX "identities_user_id_idx" ON "auth"."identities"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "identities_provider_id_provider_unique" ON "auth"."identities"("provider_id", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "mfa_amr_claims_session_id_authentication_method_pkey" ON "auth"."mfa_amr_claims"("session_id", "authentication_method");

-- CreateIndex
CREATE INDEX "mfa_challenge_created_at_idx" ON "auth"."mfa_challenges"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "mfa_factors_last_challenged_at_key" ON "auth"."mfa_factors"("last_challenged_at");

-- CreateIndex
CREATE INDEX "factor_id_created_at_idx" ON "auth"."mfa_factors"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "mfa_factors_user_id_idx" ON "auth"."mfa_factors"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_phone_factor_per_user" ON "auth"."mfa_factors"("user_id", "phone");

-- CreateIndex
CREATE INDEX "one_time_tokens_relates_to_hash_idx" ON "auth"."one_time_tokens" USING HASH ("relates_to");

-- CreateIndex
CREATE INDEX "one_time_tokens_token_hash_hash_idx" ON "auth"."one_time_tokens" USING HASH ("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "one_time_tokens_user_id_token_type_key" ON "auth"."one_time_tokens"("user_id", "token_type");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_unique" ON "auth"."refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_instance_id_idx" ON "auth"."refresh_tokens"("instance_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_instance_id_user_id_idx" ON "auth"."refresh_tokens"("instance_id", "user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_parent_idx" ON "auth"."refresh_tokens"("parent");

-- CreateIndex
CREATE INDEX "refresh_tokens_session_id_revoked_idx" ON "auth"."refresh_tokens"("session_id", "revoked");

-- CreateIndex
CREATE INDEX "refresh_tokens_updated_at_idx" ON "auth"."refresh_tokens"("updated_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "saml_providers_entity_id_key" ON "auth"."saml_providers"("entity_id");

-- CreateIndex
CREATE INDEX "saml_providers_sso_provider_id_idx" ON "auth"."saml_providers"("sso_provider_id");

-- CreateIndex
CREATE INDEX "saml_relay_states_created_at_idx" ON "auth"."saml_relay_states"("created_at" DESC);

-- CreateIndex
CREATE INDEX "saml_relay_states_for_email_idx" ON "auth"."saml_relay_states"("for_email");

-- CreateIndex
CREATE INDEX "saml_relay_states_sso_provider_id_idx" ON "auth"."saml_relay_states"("sso_provider_id");

-- CreateIndex
CREATE INDEX "sessions_not_after_idx" ON "auth"."sessions"("not_after" DESC);

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "auth"."sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_id_created_at_idx" ON "auth"."sessions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "sso_domains_sso_provider_id_idx" ON "auth"."sso_domains"("sso_provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "auth"."users"("phone");

-- CreateIndex
CREATE INDEX "users_instance_id_idx" ON "auth"."users"("instance_id");

-- CreateIndex
CREATE INDEX "users_is_anonymous_idx" ON "auth"."users"("is_anonymous");

-- CreateIndex
CREATE UNIQUE INDEX "customers_stripe_customer_id_key" ON "public"."customers"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "customers_organization_id_index" ON "public"."customers"("organization_id");

-- CreateIndex
CREATE INDEX "customers_stripe_customer_id_index" ON "public"."customers"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "idx_digger_job_parent_links_deleted_at" ON "public"."digger_job_parent_links"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_digger_job_summaries_deleted_at" ON "public"."digger_job_summaries"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_job_tokens_deleted_at" ON "public"."digger_job_tokens"("deleted_at");

-- CreateIndex
CREATE INDEX "digger_jobs_batch_id_idx" ON "public"."digger_jobs"("batch_id");

-- CreateIndex
CREATE INDEX "idx_digger_job_id" ON "public"."digger_jobs"("batch_id");

-- CreateIndex
CREATE INDEX "idx_digger_jobs_deleted_at" ON "public"."digger_jobs"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_digger_locked_resource" ON "public"."digger_locks"("resource");

-- CreateIndex
CREATE INDEX "idx_digger_locks_deleted_at" ON "public"."digger_locks"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_digger_run_queue_items_deleted_at" ON "public"."digger_run_queue_items"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_digger_run_batch_id" ON "public"."digger_run_stages"("batch_id");

-- CreateIndex
CREATE INDEX "idx_digger_run_stages_deleted_at" ON "public"."digger_run_stages"("deleted_at");

-- CreateIndex
CREATE INDEX "digger_runs_project_id_idx" ON "public"."digger_runs"("project_id");

-- CreateIndex
CREATE INDEX "idx_digger_runs_deleted_at" ON "public"."digger_runs"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_digger_runs_project_id" ON "public"."digger_runs"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_project_var_name" ON "public"."env_vars"("project_id", "name");

-- CreateIndex
CREATE INDEX "idx_github_app_installation_links_deleted_at" ON "public"."github_app_installation_links"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_github_installation_org" ON "public"."github_app_installation_links"("github_installation_id", "organization_id");

-- CreateIndex
CREATE INDEX "idx_github_app_installations_deleted_at" ON "public"."github_app_installations"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_github_apps_deleted_at" ON "public"."github_apps"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "internal_blog_posts_slug_key" ON "public"."internal_blog_posts"("slug");

-- CreateIndex
CREATE INDEX "organization_join_invitations_invitee_user_email_idx" ON "public"."organization_join_invitations"("invitee_user_email");

-- CreateIndex
CREATE INDEX "organization_join_invitations_invitee_user_id_idx" ON "public"."organization_join_invitations"("invitee_user_id");

-- CreateIndex
CREATE INDEX "organization_join_invitations_inviter_user_id_idx" ON "public"."organization_join_invitations"("inviter_user_id");

-- CreateIndex
CREATE INDEX "organization_join_invitations_organization_id_idx" ON "public"."organization_join_invitations"("organization_id");

-- CreateIndex
CREATE INDEX "organization_join_invitations_status_idx" ON "public"."organization_join_invitations"("status");

-- CreateIndex
CREATE INDEX "organization_members_member_id_idx" ON "public"."organization_members"("member_id");

-- CreateIndex
CREATE INDEX "organization_members_member_role_idx" ON "public"."organization_members"("member_role");

-- CreateIndex
CREATE INDEX "organization_members_organization_id_idx" ON "public"."organization_members"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "public"."organizations"("slug");

-- CreateIndex
CREATE INDEX "prices_active_idx" ON "public"."prices"("active");

-- CreateIndex
CREATE INDEX "prices_product_id_idx" ON "public"."prices"("product_id");

-- CreateIndex
CREATE INDEX "products_active_idx" ON "public"."products"("active");

-- CreateIndex
CREATE INDEX "project_comments_project_id_idx" ON "public"."project_comments"("project_id");

-- CreateIndex
CREATE INDEX "project_comments_user_id_idx" ON "public"."project_comments"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_tfvars_project_id_key" ON "public"."project_tfvars"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_slug_key" ON "public"."projects"("slug");

-- CreateIndex
CREATE INDEX "idx_repos_deleted_at" ON "public"."repos"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "idx_org_repo" ON "public"."repos"("name", "organization_id");

-- CreateIndex
CREATE INDEX "subscriptions_organization_id_idx" ON "public"."subscriptions"("organization_id");

-- CreateIndex
CREATE INDEX "subscriptions_price_id_idx" ON "public"."subscriptions"("price_id");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "public"."subscriptions"("status");

-- CreateIndex
CREATE INDEX "user_notifications_user_id_idx" ON "public"."user_notifications"("user_id");

-- CreateIndex
CREATE INDEX "user_private_info_default_organization_idx" ON "public"."user_private_info"("default_organization");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "public"."user_roles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_key" ON "public"."user_roles"("user_id", "role");

-- AddForeignKey
ALTER TABLE "auth"."identities" ADD CONSTRAINT "identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth"."mfa_amr_claims" ADD CONSTRAINT "mfa_amr_claims_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth"."mfa_challenges" ADD CONSTRAINT "mfa_challenges_auth_factor_id_fkey" FOREIGN KEY ("factor_id") REFERENCES "auth"."mfa_factors"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth"."mfa_factors" ADD CONSTRAINT "mfa_factors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth"."one_time_tokens" ADD CONSTRAINT "one_time_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "auth"."sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth"."saml_providers" ADD CONSTRAINT "saml_providers_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth"."saml_relay_states" ADD CONSTRAINT "saml_relay_states_flow_state_id_fkey" FOREIGN KEY ("flow_state_id") REFERENCES "auth"."flow_state"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth"."saml_relay_states" ADD CONSTRAINT "saml_relay_states_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "auth"."sso_domains" ADD CONSTRAINT "sso_domains_sso_provider_id_fkey" FOREIGN KEY ("sso_provider_id") REFERENCES "auth"."sso_providers"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."account_delete_tokens" ADD CONSTRAINT "account_delete_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."billing_bypass_organizations" ADD CONSTRAINT "billing_bypass_organizations_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."chats" ADD CONSTRAINT "chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."chats" ADD CONSTRAINT "public_chats_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."digger_job_tokens" ADD CONSTRAINT "fk_jt_organisation_id" FOREIGN KEY ("organisation_id") REFERENCES "public"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."digger_jobs" ADD CONSTRAINT "fk_digger_jobs_batch" FOREIGN KEY ("batch_id") REFERENCES "public"."digger_batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."digger_jobs" ADD CONSTRAINT "fk_digger_jobs_digger_job_summary" FOREIGN KEY ("digger_job_summary_id") REFERENCES "public"."digger_job_summaries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."digger_locks" ADD CONSTRAINT "fk_digger_locks_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."digger_run_stages" ADD CONSTRAINT "fk_digger_run_stages_batch" FOREIGN KEY ("batch_id") REFERENCES "public"."digger_batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."digger_runs" ADD CONSTRAINT "fk_digger_runs_apply_stage" FOREIGN KEY ("apply_stage_id") REFERENCES "public"."digger_run_stages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."digger_runs" ADD CONSTRAINT "fk_digger_runs_plan_stage" FOREIGN KEY ("plan_stage_id") REFERENCES "public"."digger_run_stages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."digger_runs" ADD CONSTRAINT "fk_digger_runs_project" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."digger_runs" ADD CONSTRAINT "fk_digger_runs_repo" FOREIGN KEY ("repo_id") REFERENCES "public"."repos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."digger_runs" ADD CONSTRAINT "fk_triggered_by_user" FOREIGN KEY ("triggered_by_user_id") REFERENCES "public"."user_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."env_vars" ADD CONSTRAINT "encrypted_env_vars_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."github_app_installation_links" ADD CONSTRAINT "fk_github_app_installation_links_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."internal_blog_author_posts" ADD CONSTRAINT "internal_blog_author_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."internal_blog_author_profiles"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."internal_blog_author_posts" ADD CONSTRAINT "internal_blog_author_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."internal_blog_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."internal_blog_author_profiles" ADD CONSTRAINT "internal_blog_author_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."internal_blog_post_tags_relationship" ADD CONSTRAINT "internal_blog_post_tags_relationship_blog_post_id_fkey" FOREIGN KEY ("blog_post_id") REFERENCES "public"."internal_blog_posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."internal_blog_post_tags_relationship" ADD CONSTRAINT "internal_blog_post_tags_relationship_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."internal_blog_post_tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."internal_changelog" ADD CONSTRAINT "internal_changelog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."internal_feedback_comments" ADD CONSTRAINT "internal_feedback_comments_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "public"."internal_feedback_threads"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."internal_feedback_comments" ADD CONSTRAINT "internal_feedback_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."internal_feedback_threads" ADD CONSTRAINT "internal_feedback_threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."organization_credits" ADD CONSTRAINT "organization_credits_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."organization_join_invitations" ADD CONSTRAINT "organization_join_invitations_invitee_user_id_fkey" FOREIGN KEY ("invitee_user_id") REFERENCES "public"."user_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."organization_join_invitations" ADD CONSTRAINT "organization_join_invitations_inviter_user_id_fkey" FOREIGN KEY ("inviter_user_id") REFERENCES "public"."user_profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."organization_join_invitations" ADD CONSTRAINT "organization_join_invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."organization_members" ADD CONSTRAINT "organization_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."organization_members" ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."organizations_private_info" ADD CONSTRAINT "organizations_private_info_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."prices" ADD CONSTRAINT "prices_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."project_comments" ADD CONSTRAINT "project_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "fk_projects_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "fk_projects_repo" FOREIGN KEY ("repo_id") REFERENCES "public"."repos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."projects" ADD CONSTRAINT "projects_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."repos" ADD CONSTRAINT "fk_repos_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_price_id_fkey" FOREIGN KEY ("price_id") REFERENCES "public"."prices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."teams" ADD CONSTRAINT "teams_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_notifications" ADD CONSTRAINT "user_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_onboarding" ADD CONSTRAINT "user_onboarding_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_private_info" ADD CONSTRAINT "user_private_info_default_organization_fkey" FOREIGN KEY ("default_organization") REFERENCES "public"."organizations"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_private_info" ADD CONSTRAINT "user_private_info_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

