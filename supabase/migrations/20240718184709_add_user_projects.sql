-- Add NOT NULL constraint to the name column in the repos table
ALTER TABLE "public"."repos"
ALTER COLUMN "name" SET NOT NULL;

