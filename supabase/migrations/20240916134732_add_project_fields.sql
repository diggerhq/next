CREATE TYPE iac_type_enum AS ENUM ('terraform', 'terragrunt', 'opentofu');

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS iac_type iac_type_enum DEFAULT 'terraform'::iac_type_enum,
ADD COLUMN IF NOT EXISTS workspace TEXT,
ADD COLUMN IF NOT EXISTS workflow_file TEXT,
ADD COLUMN IF NOT EXISTS include_patterns TEXT[],
ADD COLUMN IF NOT EXISTS exclude_patterns TEXT[];
