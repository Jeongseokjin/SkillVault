-- ============================================
-- SkillVault Initial Schema
-- ============================================

-- profiles 테이블
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  username text unique,
  avatar_url text,
  role text default 'user' check (role in ('admin', 'user')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- skills 테이블
create table skills (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text not null,
  tags text[],
  author_id uuid references profiles(id) on delete cascade,
  downloads integer default 0,
  rating decimal default 0,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  file_url text,
  preview_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- reviews 테이블
create table reviews (
  id uuid default gen_random_uuid() primary key,
  skill_id uuid references skills(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  rating integer check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- downloads 테이블
create table downloads (
  id uuid default gen_random_uuid() primary key,
  skill_id uuid references skills(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

-- updated_at 자동 갱신 함수
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- profiles updated_at 트리거
create trigger on_profiles_updated
  before update on profiles
  for each row execute function handle_updated_at();

-- skills updated_at 트리거
create trigger on_skills_updated
  before update on skills
  for each row execute function handle_updated_at();

-- 회원가입 시 profiles 자동 생성 함수
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'username'
  );
  return new;
end;
$$ language plpgsql security definer;

-- auth.users insert 트리거
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
-- ============================================
-- Row Level Security Policies
-- ============================================

-- ========== PROFILES ==========
alter table profiles enable row level security;

create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on profiles for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ========== SKILLS ==========
alter table skills enable row level security;

create policy "skills_select_approved"
  on skills for select
  using (status = 'approved');

create policy "skills_select_own"
  on skills for select
  using (author_id = auth.uid());

create policy "skills_select_admin"
  on skills for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "skills_insert_authenticated"
  on skills for insert
  with check (auth.uid() = author_id);

create policy "skills_update_own"
  on skills for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "skills_update_admin"
  on skills for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "skills_delete_own"
  on skills for delete
  using (author_id = auth.uid());

create policy "skills_delete_admin"
  on skills for delete
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ========== REVIEWS ==========
alter table reviews enable row level security;

create policy "reviews_select_all"
  on reviews for select
  using (true);

create policy "reviews_insert_authenticated"
  on reviews for insert
  with check (auth.uid() = user_id);

create policy "reviews_update_own"
  on reviews for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "reviews_delete_own"
  on reviews for delete
  using (user_id = auth.uid());

-- ========== DOWNLOADS ==========
alter table downloads enable row level security;

create policy "downloads_select_own"
  on downloads for select
  using (user_id = auth.uid());

create policy "downloads_insert_authenticated"
  on downloads for insert
  with check (auth.uid() = user_id);
-- ============================================
-- Add missing columns and tables
-- ============================================

-- profiles: add is_blocked, allow superadmin role
alter table profiles add column if not exists is_blocked boolean default false;
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('superadmin', 'admin', 'user'));

-- skills: add rating_count, version
alter table skills add column if not exists rating_count integer default 0;
alter table skills add column if not exists version text default '1.0.0';

-- bookmarks 테이블
create table if not exists bookmarks (
  id uuid default gen_random_uuid() primary key,
  skill_id uuid references skills(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(skill_id, user_id)
);

-- reports 테이블
create table if not exists reports (
  id uuid default gen_random_uuid() primary key,
  skill_id uuid references skills(id) on delete cascade not null,
  reporter_id uuid references profiles(id) on delete cascade not null,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamptz default now()
);

-- activity_logs 테이블
create table if not exists activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- reviews 중복 방지 unique constraint
alter table reviews add constraint reviews_unique_user_skill
  unique (skill_id, user_id);
-- ============================================
-- RLS for bookmarks, reports, activity_logs
-- ============================================

-- ========== BOOKMARKS ==========
alter table bookmarks enable row level security;

create policy "bookmarks_select_own"
  on bookmarks for select
  using (user_id = auth.uid());

create policy "bookmarks_insert_authenticated"
  on bookmarks for insert
  with check (auth.uid() = user_id);

create policy "bookmarks_delete_own"
  on bookmarks for delete
  using (user_id = auth.uid());

-- ========== REPORTS ==========
alter table reports enable row level security;

create policy "reports_select_admin"
  on reports for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'superadmin')
    )
  );

create policy "reports_select_own"
  on reports for select
  using (reporter_id = auth.uid());

create policy "reports_insert_authenticated"
  on reports for insert
  with check (auth.uid() = reporter_id);

create policy "reports_update_admin"
  on reports for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'superadmin')
    )
  );

-- ========== ACTIVITY_LOGS ==========
alter table activity_logs enable row level security;

create policy "activity_logs_select_admin"
  on activity_logs for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'superadmin')
    )
  );

create policy "activity_logs_insert_authenticated"
  on activity_logs for insert
  with check (auth.uid() = user_id);

-- ========== Update admin policies to include superadmin ==========
drop policy if exists "profiles_select_admin" on profiles;
create policy "profiles_select_admin"
  on profiles for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'superadmin')
    )
  );

drop policy if exists "profiles_update_admin" on profiles;
create policy "profiles_update_admin"
  on profiles for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'superadmin')
    )
  );

drop policy if exists "skills_select_admin" on skills;
create policy "skills_select_admin"
  on skills for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'superadmin')
    )
  );

drop policy if exists "skills_update_admin" on skills;
create policy "skills_update_admin"
  on skills for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'superadmin')
    )
  );

drop policy if exists "skills_delete_admin" on skills;
create policy "skills_delete_admin"
  on skills for delete
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role in ('admin', 'superadmin')
    )
  );
-- ============================================
-- Functions & Triggers
-- ============================================

-- 리뷰 작성/수정/삭제 시 스킬 평점 자동 갱신
create or replace function update_skill_rating()
returns trigger as $$
declare
  avg_rating decimal;
  review_count integer;
begin
  select coalesce(avg(rating), 0), count(*)
  into avg_rating, review_count
  from reviews
  where skill_id = coalesce(new.skill_id, old.skill_id);

  update skills
  set rating = round(avg_rating, 1),
      rating_count = review_count
  where id = coalesce(new.skill_id, old.skill_id);

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger on_review_inserted
  after insert on reviews
  for each row execute function update_skill_rating();

create trigger on_review_updated
  after update on reviews
  for each row execute function update_skill_rating();

create trigger on_review_deleted
  after delete on reviews
  for each row execute function update_skill_rating();

-- 다운로드 시 스킬 다운로드 수 자동 증가
create or replace function increment_download_count()
returns trigger as $$
begin
  update skills
  set downloads = downloads + 1
  where id = new.skill_id;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_download_inserted
  after insert on downloads
  for each row execute function increment_download_count();
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
