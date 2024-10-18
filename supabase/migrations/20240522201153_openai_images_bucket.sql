insert into storage.buckets(id, name, public, file_size_limit) values ('openai-images', 'openai-images', true, 52428800);

create policy "Allow users to read their openai images"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'openai-images'::text));


