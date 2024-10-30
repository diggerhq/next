-- Add email column to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN email VARCHAR(255);

-- Optionally, you can add constraints or indexes
ALTER TABLE user_profiles
ADD CONSTRAINT email_unique UNIQUE (email);