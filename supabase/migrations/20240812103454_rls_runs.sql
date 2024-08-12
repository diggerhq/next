-- Enable RLS on digger_runs table
ALTER TABLE digger_runs ENABLE ROW LEVEL SECURITY;

-- Create policy for digger_runs
CREATE POLICY "Users can access digger_runs in their organizations" ON digger_runs
FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM projects p
    JOIN organizations o ON p.organization_id = o.id
    JOIN organization_members om ON o.id = om.organization_id
    WHERE digger_runs.project_id = p.id
      AND om.member_id = auth.uid()
  )
);