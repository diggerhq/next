insert into storage.buckets(id, name, public, file_size_limit) values ('changelog-assets', 'changelog-assets', true, 52428800);

create policy "Allow users to read their changelog assets"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'changelog-assets'::text));


