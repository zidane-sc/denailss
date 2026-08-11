-- Promo banner images bucket + policies (mirrors 0003_storage.sql catalog buckets).
insert into storage.buckets (id, name, public)
values
  ('promotion-images', 'promotion-images', true)
on conflict (id) do update set public = excluded.public;

create policy promotion_images_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'promotion-images');

create policy owner_upload_promotion_assets on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'promotion-images'
    and public.current_user_role() = 'owner'
  );

create policy owner_update_promotion_assets on storage.objects
  for update to authenticated
  using (bucket_id = 'promotion-images' and public.current_user_role() = 'owner')
  with check (bucket_id = 'promotion-images' and public.current_user_role() = 'owner');

create policy owner_delete_promotion_assets on storage.objects
  for delete to authenticated
  using (bucket_id = 'promotion-images' and public.current_user_role() = 'owner');
