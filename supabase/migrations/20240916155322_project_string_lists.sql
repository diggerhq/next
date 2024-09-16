ALTER TABLE public.projects
  ALTER COLUMN include_patterns TYPE TEXT USING array_to_string(include_patterns, ','),
  ALTER COLUMN exclude_patterns TYPE TEXT USING array_to_string(exclude_patterns, ',');
