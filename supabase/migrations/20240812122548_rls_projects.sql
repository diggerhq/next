-- Enable Row Level Security for projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy for projects
CREATE POLICY "Users can access projects in their organizations" ON projects
FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM organization_members om
    WHERE projects.organization_id = om.organization_id
      AND om.member_id = auth.uid()
  )
);