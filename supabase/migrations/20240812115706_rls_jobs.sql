-- Enable Row Level Security for digger_jobs table
ALTER TABLE digger_jobs ENABLE ROW LEVEL SECURITY;

-- Create policy for digger_jobs
CREATE POLICY "Users can access digger_jobs in their organizations" ON digger_jobs
FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM digger_batches b
    JOIN organization_members om ON om.organization_id = b.organization_id
    WHERE digger_jobs.batch_id = b.id
      AND om.member_id = auth.uid()
  )
);