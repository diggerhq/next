ALTER TABLE "public"."products"
ADD COLUMN "is_visible_in_ui" boolean NOT NULL DEFAULT false;

-- Create the billing_bypass_organizations table
CREATE TABLE public.billing_bypass_organizations (
  id UUID PRIMARY KEY REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.billing_bypass_organizations ENABLE ROW LEVEL SECURITY;

-- Policy for organization members to view their own organization
CREATE POLICY "Organization members can view their own enterprise organization"
ON public.billing_bypass_organizations
FOR SELECT
USING (
  auth.uid() IN (
    SELECT member_id
    FROM public.organization_members
    WHERE organization_id = billing_bypass_organizations.id
  )
);

