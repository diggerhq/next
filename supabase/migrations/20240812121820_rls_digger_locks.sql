-- Enable Row Level Security for digger_locks table
ALTER TABLE digger_locks ENABLE ROW LEVEL SECURITY;

-- Create policy for digger_locks
CREATE POLICY "Users can access digger_locks in their organizations" ON digger_locks
FOR ALL USING (
  EXISTS (
    SELECT 1
    FROM organization_members om
    WHERE digger_locks.organization_id = om.organization_id
      AND om.member_id = auth.uid()
  )
);