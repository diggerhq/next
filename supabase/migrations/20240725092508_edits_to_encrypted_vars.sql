-- Conditionally drop the 'iv' column if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'encrypted_env_vars' 
        AND column_name = 'iv'
    ) THEN
        ALTER TABLE "public"."encrypted_env_vars" DROP COLUMN "iv";
    END IF;
END $$;

-- Change the data type of 'encrypted_value' to text
ALTER TABLE "public"."encrypted_env_vars" 
ALTER COLUMN "encrypted_value" TYPE text USING encrypted_value::text;

-- Set the default value for 'encrypted_value'
ALTER TABLE "public"."encrypted_env_vars" 
ALTER COLUMN "encrypted_value" SET DEFAULT '';