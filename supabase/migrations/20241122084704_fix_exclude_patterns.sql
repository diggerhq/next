ALTER TABLE projects DROP COLUMN exclude_patterns;
ALTER table projects add column exclude_patterns TEXT;