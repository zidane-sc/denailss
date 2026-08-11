-- Supabase Storage buckets for uploaded assets.
insert into storage.buckets (id, name, public)
values
  ('gallery-images', 'gallery-images', true),
  ('service-images', 'service-images', true),
  ('business-assets', 'business-assets', true),
  ('deposit-proofs', 'deposit-proofs', false)
on conflict (id) do update set public = excluded.public;

-- Public catalog assets can be read by anyone; writes stay owner-only.
create policy gallery_images_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'gallery-images');

create policy service_images_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'service-images');

create policy business_assets_public_read on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'business-assets');

create policy owner_upload_catalog_assets on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('gallery-images', 'service-images', 'business-assets')
    and public.current_user_role() = 'owner'
  );

create policy owner_update_catalog_assets on storage.objects
  for update to authenticated
  using (
    bucket_id in ('gallery-images', 'service-images', 'business-assets')
    and public.current_user_role() = 'owner'
  )
  with check (
    bucket_id in ('gallery-images', 'service-images', 'business-assets')
    and public.current_user_role() = 'owner'
  );

create policy owner_delete_catalog_assets on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('gallery-images', 'service-images', 'business-assets')
    and public.current_user_role() = 'owner'
  );

-- Deposit proofs are never publicly readable. The server creates signed URLs for owners.
create policy owner_read_deposit_proofs on storage.objects
  for select to authenticated
  using (bucket_id = 'deposit-proofs' and public.current_user_role() = 'owner');

create policy owner_delete_deposit_proofs on storage.objects
  for delete to authenticated
  using (bucket_id = 'deposit-proofs' and public.current_user_role() = 'owner');
