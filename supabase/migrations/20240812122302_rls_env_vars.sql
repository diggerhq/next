-- Enable Row Level Security for env_vars table
ALTER TABLE env_vars ENABLE ROW LEVEL SECURITY;

-- Create policy for env_vars
CREATE POLICY "Users can access env_vars in their organizations" ON env_vars
FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM projects p
    JOIN organizations o ON p.organization_id = o.id
    JOIN organization_members om ON o.id = om.organization_id
    WHERE env_vars.project_id = p.id
      AND om.member_id = auth.uid()
  )
);