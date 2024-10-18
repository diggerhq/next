-- Drop existing columns
ALTER TABLE user_profiles
DROP COLUMN IF EXISTS hasAcceptedTerms,
DROP COLUMN IF EXISTS hasCompletedProfile,
DROP COLUMN IF EXISTS hasCreatedOrganization,
DROP COLUMN IF EXISTS isCreatedThroughOrgInvitation;

-- Recreate columns with underscore notation
ALTER TABLE user_profiles
ADD COLUMN has_accepted_terms BOOLEAN DEFAULT TRUE,
ADD COLUMN has_completed_profile BOOLEAN DEFAULT FALSE,
ADD COLUMN has_created_organization BOOLEAN DEFAULT FALSE,
ADD COLUMN is_created_through_org_invitation BOOLEAN DEFAULT FALSE;