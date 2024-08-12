-- Enable Row Level Security for digger_job_tokens table
ALTER TABLE digger_job_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for digger_job_tokens
CREATE POLICY "Users can access digger_job_tokens in their organizations" ON digger_job_tokens
FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM organization_members om
    WHERE digger_job_tokens.organisation_id = om.organization_id
      AND om.member_id = auth.uid()
  )
);