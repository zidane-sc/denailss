-- Review images bucket + policies (hand-authored).
-- Public read (review photos show on the public reviews page); the owning
-- customer can upload via the server-side review-photo route.

insert into storage.buckets (id, name, public)
values ('review-images', 'review-images', true)
on conflict (id) do update set public = excluded.public;

create policy review_images_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'review-images');

-- Writes go through the API (service-role); customers may not write directly.
