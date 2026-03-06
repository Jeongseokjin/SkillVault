-- ============================================
-- Storage Buckets & Policies
-- ============================================

-- 스킬 파일 버킷
insert into storage.buckets (id, name, public)
values ('skills', 'skills', true)
on conflict (id) do nothing;

-- 미리보기 이미지 버킷
insert into storage.buckets (id, name, public)
values ('previews', 'previews', true)
on conflict (id) do nothing;

-- skills 버킷 정책: 누구나 읽기
create policy "skills_storage_select"
  on storage.objects for select
  using (bucket_id = 'skills');

-- skills 버킷 정책: 인증된 유저만 업로드 (자기 폴더)
create policy "skills_storage_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'skills'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- skills 버킷 정책: 자기 파일만 삭제
create policy "skills_storage_delete"
  on storage.objects for delete
  using (
    bucket_id = 'skills'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- previews 버킷 정책: 누구나 읽기
create policy "previews_storage_select"
  on storage.objects for select
  using (bucket_id = 'previews');

-- previews 버킷 정책: 인증된 유저만 업로드 (자기 폴더)
create policy "previews_storage_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'previews'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- previews 버킷 정책: 자기 파일만 삭제
create policy "previews_storage_delete"
  on storage.objects for delete
  using (
    bucket_id = 'previews'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
