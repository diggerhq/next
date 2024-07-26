-- Create a new enum type for approval_status
CREATE TYPE digger_run_approval_status AS ENUM (
  'pending_approval',
  'approved',
  'running',
  'queued',
  'succeeded',
  'failed'
);

-- Add the approval_status column to the digger_runs table
ALTER TABLE "public"."digger_runs"
ADD COLUMN "approval_status" digger_run_approval_status NOT NULL DEFAULT 'pending_approval';

-- Create an index on the new column for better query performance
CREATE INDEX idx_digger_runs_approval_status ON "public"."digger_runs" ("approval_status");