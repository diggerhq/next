export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account_delete_tokens: {
        Row: {
          token: string
          user_id: string
        }
        Insert: {
          token?: string
          user_id: string
        }
        Update: {
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_delete_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string
          id: string
          payload: Json | null
          project_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id: string
          payload?: Json | null
          project_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json | null
          project_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_chats_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          organization_id: string
          stripe_customer_id: string
        }
        Insert: {
          organization_id: string
          stripe_customer_id: string
        }
        Update: {
          organization_id?: string
          stripe_customer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      digger_batches: {
        Row: {
          batch_type: string
          branch_name: string
          comment_id: number | null
          digger_config: string | null
          github_installation_id: number | null
          gitlab_project_id: number | null
          id: string
          pr_number: number | null
          repo_full_name: string
          repo_name: string
          repo_owner: string
          source_details: string | null
          status: number
          vcs: string | null
        }
        Insert: {
          batch_type: string
          branch_name: string
          comment_id?: number | null
          digger_config?: string | null
          github_installation_id?: number | null
          gitlab_project_id?: number | null
          id?: string
          pr_number?: number | null
          repo_full_name: string
          repo_name: string
          repo_owner: string
          source_details?: string | null
          status: number
          vcs?: string | null
        }
        Update: {
          batch_type?: string
          branch_name?: string
          comment_id?: number | null
          digger_config?: string | null
          github_installation_id?: number | null
          gitlab_project_id?: number | null
          id?: string
          pr_number?: number | null
          repo_full_name?: string
          repo_name?: string
          repo_owner?: string
          source_details?: string | null
          status?: number
          vcs?: string | null
        }
        Relationships: []
      }
      digger_job_parent_links: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          digger_job_id: string | null
          id: number
          parent_digger_job_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          digger_job_id?: string | null
          id?: number
          parent_digger_job_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          digger_job_id?: string | null
          id?: number
          parent_digger_job_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      digger_job_summaries: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          resources_created: number
          resources_deleted: number
          resources_updated: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          resources_created?: number
          resources_deleted?: number
          resources_updated?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          resources_created?: number
          resources_deleted?: number
          resources_updated?: number
          updated_at?: string
        }
        Relationships: []
      }
      digger_job_tokens: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          expiry: string | null
          id: number
          organisation_id: number | null
          type: string | null
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          expiry?: string | null
          id?: number
          organisation_id?: number | null
          type?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          expiry?: string | null
          id?: number
          organisation_id?: number | null
          type?: string | null
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      digger_jobs: {
        Row: {
          batch_id: string
          created_at: string
          deleted_at: string | null
          digger_job_id: string
          digger_job_summary_id: string | null
          id: string
          job_spec: string | null
          plan_footprint: string | null
          pr_comment_url: string | null
          status: number
          status_updated_at: string | null
          terraform_output: string | null
          updated_at: string
          workflow_file: string | null
          workflow_run_url: string | null
        }
        Insert: {
          batch_id: string
          created_at?: string
          deleted_at?: string | null
          digger_job_id: string
          digger_job_summary_id?: string | null
          id?: string
          job_spec?: string | null
          plan_footprint?: string | null
          pr_comment_url?: string | null
          status: number
          status_updated_at?: string | null
          terraform_output?: string | null
          updated_at?: string
          workflow_file?: string | null
          workflow_run_url?: string | null
        }
        Update: {
          batch_id?: string
          created_at?: string
          deleted_at?: string | null
          digger_job_id?: string
          digger_job_summary_id?: string | null
          id?: string
          job_spec?: string | null
          plan_footprint?: string | null
          pr_comment_url?: string | null
          status?: number
          status_updated_at?: string | null
          terraform_output?: string | null
          updated_at?: string
          workflow_file?: string | null
          workflow_run_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_digger_jobs_batch"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "digger_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_digger_jobs_digger_job_summary"
            columns: ["digger_job_summary_id"]
            isOneToOne: false
            referencedRelation: "digger_job_summaries"
            referencedColumns: ["id"]
          },
        ]
      }
      digger_locks: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          lock_id: number
          organization_id: string
          resource: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          lock_id: number
          organization_id: string
          resource: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          lock_id?: number
          organization_id?: string
          resource?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_digger_locks_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      digger_run_queue_items: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          digger_run_id: number | null
          id: number
          project_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          digger_run_id?: number | null
          id?: number
          project_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          digger_run_id?: number | null
          id?: number
          project_id?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      digger_run_stages: {
        Row: {
          batch_id: string
          created_at: string
          deleted_at: string | null
          id: string
          updated_at: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_digger_run_stages_batch"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "digger_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      digger_runs: {
        Row: {
          apply_stage_id: string | null
          approval_author: string | null
          approval_date: string | null
          commit_id: string
          created_at: string
          deleted_at: string | null
          digger_config: string | null
          github_installation_id: number | null
          id: string
          is_approved: boolean | null
          plan_stage_id: string | null
          pr_number: number | null
          project_name: string | null
          repo_id: number
          run_type: string
          status: string
          triggertype: string
          updated_at: string
        }
        Insert: {
          apply_stage_id?: string | null
          approval_author?: string | null
          approval_date?: string | null
          commit_id: string
          created_at?: string
          deleted_at?: string | null
          digger_config?: string | null
          github_installation_id?: number | null
          id?: string
          is_approved?: boolean | null
          plan_stage_id?: string | null
          pr_number?: number | null
          project_name?: string | null
          repo_id?: number
          run_type: string
          status: string
          triggertype: string
          updated_at?: string
        }
        Update: {
          apply_stage_id?: string | null
          approval_author?: string | null
          approval_date?: string | null
          commit_id?: string
          created_at?: string
          deleted_at?: string | null
          digger_config?: string | null
          github_installation_id?: number | null
          id?: string
          is_approved?: boolean | null
          plan_stage_id?: string | null
          pr_number?: number | null
          project_name?: string | null
          repo_id?: number
          run_type?: string
          status?: string
          triggertype?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_digger_runs_apply_stage"
            columns: ["apply_stage_id"]
            isOneToOne: false
            referencedRelation: "digger_run_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_digger_runs_plan_stage"
            columns: ["plan_stage_id"]
            isOneToOne: false
            referencedRelation: "digger_run_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_digger_runs_repo"
            columns: ["repo_id"]
            isOneToOne: false
            referencedRelation: "repos"
            referencedColumns: ["id"]
          },
        ]
      }
      encrypted_env_vars: {
        Row: {
          encrypted_value: string
          id: string
          is_secret: boolean
          name: string
          project_id: string
          updated_at: string
        }
        Insert: {
          encrypted_value?: string
          id?: string
          is_secret?: boolean
          name: string
          project_id: string
          updated_at?: string
        }
        Update: {
          encrypted_value?: string
          id?: string
          is_secret?: boolean
          name?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "encrypted_env_vars_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      github_app_installation_links: {
        Row: {
          created_at: string
          deleted_at: string | null
          github_installation_id: number
          id: string
          organization_id: string
          status: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          github_installation_id: number
          id?: string
          organization_id: string
          status: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          github_installation_id?: number
          id?: string
          organization_id?: string
          status?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_github_app_installation_links_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      github_app_installations: {
        Row: {
          account_id: number
          created_at: string
          deleted_at: string | null
          github_app_id: number
          github_installation_id: number
          id: string
          login: string
          repo: string | null
          status: number
          updated_at: string
        }
        Insert: {
          account_id: number
          created_at?: string
          deleted_at?: string | null
          github_app_id: number
          github_installation_id: number
          id?: string
          login: string
          repo?: string | null
          status: number
          updated_at?: string
        }
        Update: {
          account_id?: number
          created_at?: string
          deleted_at?: string | null
          github_app_id?: number
          github_installation_id?: number
          id?: string
          login?: string
          repo?: string | null
          status?: number
          updated_at?: string
        }
        Relationships: []
      }
      github_apps: {
        Row: {
          created_at: string
          deleted_at: string | null
          github_app_url: string
          github_id: number
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          github_app_url: string
          github_id: number
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          github_app_url?: string
          github_id?: number
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      internal_blog_author_posts: {
        Row: {
          author_id: string
          post_id: string
        }
        Insert: {
          author_id: string
          post_id: string
        }
        Update: {
          author_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_blog_author_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "internal_blog_author_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "internal_blog_author_posts_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "internal_blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_blog_author_profiles: {
        Row: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          facebook_handle: string | null
          instagram_handle: string | null
          linkedin_handle: string | null
          twitter_handle: string | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          avatar_url: string
          bio: string
          created_at?: string
          display_name: string
          facebook_handle?: string | null
          instagram_handle?: string | null
          linkedin_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string
          bio?: string
          created_at?: string
          display_name?: string
          facebook_handle?: string | null
          instagram_handle?: string | null
          linkedin_handle?: string | null
          twitter_handle?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_blog_author_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_blog_post_tags: {
        Row: {
          description: string | null
          id: number
          name: string
          slug: string
        }
        Insert: {
          description?: string | null
          id?: never
          name: string
          slug: string
        }
        Update: {
          description?: string | null
          id?: never
          name?: string
          slug?: string
        }
        Relationships: []
      }
      internal_blog_post_tags_relationship: {
        Row: {
          blog_post_id: string
          tag_id: number
        }
        Insert: {
          blog_post_id: string
          tag_id: number
        }
        Update: {
          blog_post_id?: string
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "internal_blog_post_tags_relationship_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "internal_blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_blog_post_tags_relationship_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "internal_blog_post_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_blog_posts: {
        Row: {
          content: string
          cover_image: string | null
          created_at: string
          id: string
          is_featured: boolean
          json_content: Json
          seo_data: Json | null
          slug: string
          status: Database["public"]["Enums"]["internal_blog_post_status"]
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          json_content?: Json
          seo_data?: Json | null
          slug: string
          status?: Database["public"]["Enums"]["internal_blog_post_status"]
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          cover_image?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean
          json_content?: Json
          seo_data?: Json | null
          slug?: string
          status?: Database["public"]["Enums"]["internal_blog_post_status"]
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      internal_changelog: {
        Row: {
          changes: string
          cover_image: string | null
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          changes: string
          cover_image?: string | null
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          changes?: string
          cover_image?: string | null
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_changelog_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_feedback_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          thread_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          thread_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          thread_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_feedback_comments_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "internal_feedback_threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_feedback_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_feedback_threads: {
        Row: {
          added_to_roadmap: boolean
          content: string
          created_at: string
          id: string
          is_publicly_visible: boolean
          open_for_public_discussion: boolean
          priority: Database["public"]["Enums"]["internal_feedback_thread_priority"]
          status: Database["public"]["Enums"]["internal_feedback_thread_status"]
          title: string
          type: Database["public"]["Enums"]["internal_feedback_thread_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          added_to_roadmap?: boolean
          content: string
          created_at?: string
          id?: string
          is_publicly_visible?: boolean
          open_for_public_discussion?: boolean
          priority?: Database["public"]["Enums"]["internal_feedback_thread_priority"]
          status?: Database["public"]["Enums"]["internal_feedback_thread_status"]
          title: string
          type?: Database["public"]["Enums"]["internal_feedback_thread_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          added_to_roadmap?: boolean
          content?: string
          created_at?: string
          id?: string
          is_publicly_visible?: boolean
          open_for_public_discussion?: boolean
          priority?: Database["public"]["Enums"]["internal_feedback_thread_priority"]
          status?: Database["public"]["Enums"]["internal_feedback_thread_status"]
          title?: string
          type?: Database["public"]["Enums"]["internal_feedback_thread_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_feedback_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_credits: {
        Row: {
          credits: number
          organization_id: string
        }
        Insert: {
          credits?: number
          organization_id: string
        }
        Update: {
          credits?: number
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_credits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_join_invitations: {
        Row: {
          created_at: string
          id: string
          invitee_organization_role: Database["public"]["Enums"]["organization_member_role"]
          invitee_user_email: string
          invitee_user_id: string | null
          inviter_user_id: string
          organization_id: string
          status: Database["public"]["Enums"]["organization_join_invitation_link_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          invitee_organization_role?: Database["public"]["Enums"]["organization_member_role"]
          invitee_user_email: string
          invitee_user_id?: string | null
          inviter_user_id: string
          organization_id: string
          status?: Database["public"]["Enums"]["organization_join_invitation_link_status"]
        }
        Update: {
          created_at?: string
          id?: string
          invitee_organization_role?: Database["public"]["Enums"]["organization_member_role"]
          invitee_user_email?: string
          invitee_user_id?: string | null
          inviter_user_id?: string
          organization_id?: string
          status?: Database["public"]["Enums"]["organization_join_invitation_link_status"]
        }
        Relationships: [
          {
            foreignKeyName: "organization_join_invitations_invitee_user_id_fkey"
            columns: ["invitee_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_join_invitations_inviter_user_id_fkey"
            columns: ["inviter_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_join_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: number
          member_id: string
          member_role: Database["public"]["Enums"]["organization_member_role"]
          organization_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          member_id: string
          member_role: Database["public"]["Enums"]["organization_member_role"]
          organization_id: string
        }
        Update: {
          created_at?: string
          id?: number
          member_id?: string
          member_role?: Database["public"]["Enums"]["organization_member_role"]
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          slug: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          slug?: string
          title?: string
        }
        Update: {
          created_at?: string
          id?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      organizations_private_info: {
        Row: {
          billing_address: Json | null
          id: string
          payment_method: Json | null
        }
        Insert: {
          billing_address?: Json | null
          id: string
          payment_method?: Json | null
        }
        Update: {
          billing_address?: Json | null
          id?: string
          payment_method?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_private_info_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      prices: {
        Row: {
          active: boolean | null
          currency: string | null
          description: string | null
          id: string
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          metadata: Json | null
          product_id: string | null
          trial_period_days: number | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      project_comments: {
        Row: {
          created_at: string | null
          id: number
          in_reply_to: number | null
          project_id: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          in_reply_to?: number | null
          project_id: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          in_reply_to?: number | null
          project_id?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tfvars: {
        Row: {
          id: string
          project_id: string
          tfvars: Json
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          tfvars: Json
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          tfvars?: Json
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          configuration_yaml: string | null
          created_at: string
          deleted_at: string | null
          id: string
          is_generated: boolean | null
          is_in_main_branch: boolean | null
          is_managing_state: boolean | null
          labels: string[] | null
          latest_action_on: string | null
          name: string
          organization_id: string
          project_status: Database["public"]["Enums"]["project_status"]
          repo_id: number
          slug: string
          status: string | null
          team_id: number | null
          terraform_working_dir: string | null
          updated_at: string
        }
        Insert: {
          configuration_yaml?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_generated?: boolean | null
          is_in_main_branch?: boolean | null
          is_managing_state?: boolean | null
          labels?: string[] | null
          latest_action_on?: string | null
          name: string
          organization_id: string
          project_status?: Database["public"]["Enums"]["project_status"]
          repo_id?: number
          slug?: string
          status?: string | null
          team_id?: number | null
          terraform_working_dir?: string | null
          updated_at?: string
        }
        Update: {
          configuration_yaml?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_generated?: boolean | null
          is_in_main_branch?: boolean | null
          is_managing_state?: boolean | null
          labels?: string[] | null
          latest_action_on?: string | null
          name?: string
          organization_id?: string
          project_status?: Database["public"]["Enums"]["project_status"]
          repo_id?: number
          slug?: string
          status?: string | null
          team_id?: number | null
          terraform_working_dir?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_projects_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_projects_repo"
            columns: ["repo_id"]
            isOneToOne: false
            referencedRelation: "repos"
            referencedColumns: ["id"]
          },
        ]
      }
      repos: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          digger_config: string | null
          id: number
          name: string
          organization_id: string | null
          repo_full_name: string | null
          repo_name: string | null
          repo_organisation: string | null
          repo_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          digger_config?: string | null
          id?: number
          name: string
          organization_id?: string | null
          repo_full_name?: string | null
          repo_name?: string | null
          repo_organisation?: string | null
          repo_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          digger_config?: string | null
          id?: number
          name?: string
          organization_id?: string | null
          repo_full_name?: string | null
          repo_name?: string | null
          repo_organisation?: string | null
          repo_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_repos_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          price_id: string | null
          quantity: number | null
          status: Database["public"]["Enums"]["subscription_status"] | null
          trial_end: string | null
          trial_start: string | null
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at?: string | null
          id: string
          metadata?: Json | null
          organization_id?: string | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          price_id?: string | null
          quantity?: number | null
          status?: Database["public"]["Enums"]["subscription_status"] | null
          trial_end?: string | null
          trial_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "prices"
            referencedColumns: ["id"]
          },
        ]
      }
      user_api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          is_revoked: boolean
          key_id: string
          masked_key: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          is_revoked?: boolean
          key_id: string
          masked_key: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          is_revoked?: boolean
          key_id?: string
          masked_key?: string
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          is_seen: boolean
          payload: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          is_seen?: boolean
          payload?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          is_seen?: boolean
          payload?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_onboarding: {
        Row: {
          accepted_terms: boolean
          created_at: string
          user_id: string
        }
        Insert: {
          accepted_terms?: boolean
          created_at?: string
          user_id: string
        }
        Update: {
          accepted_terms?: boolean
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_onboarding_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_private_info: {
        Row: {
          created_at: string | null
          default_organization: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          default_organization?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          default_organization?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_private_info_default_organization_fkey"
            columns: ["default_organization"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_private_info_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: number
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: number
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      app_admin_get_all_organizations: {
        Args: {
          search_query?: string
          page?: number
          page_size?: number
        }
        Returns: {
          id: string
          created_at: string
          title: string
          team_members_count: number
          owner_full_name: string
          owner_email: string
          credits: number
        }[]
      }
      app_admin_get_all_organizations_count: {
        Args: {
          search_query?: string
        }
        Returns: number
      }
      app_admin_get_all_users: {
        Args: {
          search_query?: string
          page?: number
          page_size?: number
        }
        Returns: {
          id: string
          email: string
          created_at: string
          updated_at: string
          full_name: string
          avatar_url: string
          is_app_admin: boolean
          confirmed_at: string
          is_confirmed: boolean
          last_sign_in_at: string
        }[]
      }
      app_admin_get_all_users_count: {
        Args: {
          search_query?: string
        }
        Returns: number
      }
      app_admin_get_organizations_created_per_month: {
        Args: Record<PropertyKey, never>
        Returns: {
          month: string
          number_of_organizations: number
        }[]
      }
      app_admin_get_projects_created_per_month: {
        Args: Record<PropertyKey, never>
        Returns: {
          month: string
          number_of_projects: number
        }[]
      }
      app_admin_get_recent_30_day_signin_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      app_admin_get_total_organization_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      app_admin_get_total_project_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      app_admin_get_total_user_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      app_admin_get_user_id_by_email: {
        Args: {
          emailarg: string
        }
        Returns: string
      }
      app_admin_get_users_created_per_month: {
        Args: Record<PropertyKey, never>
        Returns: {
          month: string
          number_of_users: number
        }[]
      }
      check_if_authenticated_user_owns_email: {
        Args: {
          email: string
        }
        Returns: boolean
      }
      check_if_user_is_app_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      custom_access_token_hook: {
        Args: {
          event: Json
        }
        Returns: Json
      }
      decrement_credits: {
        Args: {
          org_id: string
          amount: number
        }
        Returns: undefined
      }
      get_all_app_admins: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
        }[]
      }
      get_invited_organizations_for_user_v2: {
        Args: {
          user_id: string
          user_email: string
        }
        Returns: {
          organization_id: string
        }[]
      }
      get_organization_admin_ids: {
        Args: {
          organization_id: string
        }
        Returns: {
          member_id: string
        }[]
      }
      get_organization_id_by_team_id: {
        Args: {
          p_id: number
        }
        Returns: string
      }
      get_organization_id_for_project_id: {
        Args: {
          project_id: string
        }
        Returns: string
      }
      get_organization_member_ids: {
        Args: {
          organization_id: string
        }
        Returns: {
          member_id: string
        }[]
      }
      get_organizations_for_user: {
        Args: {
          user_id: string
        }
        Returns: {
          organization_id: string
        }[]
      }
      get_team_id_for_project_id: {
        Args: {
          project_id: string
        }
        Returns: number
      }
      increment_credits: {
        Args: {
          org_id: string
          amount: number
        }
        Returns: undefined
      }
      make_user_app_admin: {
        Args: {
          user_id_arg: string
        }
        Returns: undefined
      }
      remove_app_admin_privilege_for_user: {
        Args: {
          user_id_arg: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_admin_role: "moderator" | "admin" | "super_admin"
      app_role: "admin"
      internal_blog_post_status: "draft" | "published"
      internal_feedback_thread_priority: "low" | "medium" | "high"
      internal_feedback_thread_status:
        | "open"
        | "under_review"
        | "planned"
        | "closed"
        | "in_progress"
        | "completed"
      internal_feedback_thread_type: "bug" | "feature_request" | "general"
      organization_join_invitation_link_status:
        | "active"
        | "finished_accepted"
        | "finished_declined"
        | "inactive"
      organization_joining_status:
        | "invited"
        | "joinied"
        | "declined_invitation"
        | "joined"
      organization_member_role: "owner" | "admin" | "member" | "readonly"
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      project_status: "draft" | "pending_approval" | "approved" | "completed"
      project_team_member_role: "admin" | "member" | "readonly"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
        | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            isOneToOne: false
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

