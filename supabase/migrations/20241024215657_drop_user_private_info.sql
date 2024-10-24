DROP TABLE IF EXISTS user_private_info;

ALTER TABLE user_profiles
ADD COLUMN default_organization uuid;