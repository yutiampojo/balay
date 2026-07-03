insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "listing_photos_read" on storage.objects;
create policy "listing_photos_read" on storage.objects
  for select to public using (bucket_id = 'listing-photos');

drop policy if exists "listing_photos_insert" on storage.objects;
create policy "listing_photos_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'listing-photos');
