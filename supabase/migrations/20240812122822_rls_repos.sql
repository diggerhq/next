-- Enable Row Level Security for repos table
ALTER TABLE repos ENABLE ROW LEVEL SECURITY;

-- Create policy for repos
CREATE POLICY "Users can access repos in their organizations" ON repos
FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM organization_members om
    WHERE repos.organization_id = om.organization_id
      AND om.member_id = auth.uid()
  )
);