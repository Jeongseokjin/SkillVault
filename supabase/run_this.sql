-- =============================================
-- SkillVault Complete Migration (clean install)
-- =============================================

-- 1. DROP everything first (tables cascade will drop triggers automatically)
drop policy if exists "skills_storage_select" on storage.objects;
drop policy if exists "skills_storage_insert" on storage.objects;
drop policy if exists "skills_storage_delete" on storage.objects;
drop policy if exists "previews_storage_select" on storage.objects;
drop policy if exists "previews_storage_insert" on storage.objects;
drop policy if exists "previews_storage_delete" on storage.objects;

drop trigger if exists on_auth_user_created on auth.users;

drop table if exists activity_logs cascade;
drop table if exists reports cascade;
drop table if exists bookmarks cascade;
drop table if exists likes cascade;
drop table if exists downloads cascade;
drop table if exists reviews cascade;
drop table if exists skills cascade;
drop table if exists profiles cascade;

drop function if exists handle_new_user() cascade;
drop function if exists handle_updated_at() cascade;
drop function if exists increment_download_count() cascade;
drop function if exists update_like_count() cascade;
drop function if exists update_bookmark_count() cascade;
drop function if exists update_skill_rating() cascade;
drop function if exists get_user_role() cascade;
drop function if exists check_email_exists(text) cascade;
drop function if exists check_username_exists(text) cascade;

-- 2. TABLES
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  username text unique not null,
  avatar_url text,
  role text default 'user' check (role in ('superadmin', 'admin', 'user')),
  is_blocked boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table skills (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text not null,
  tags text[],
  author_id uuid references profiles(id) on delete cascade,
  downloads integer default 0,
  like_count integer default 0,
  bookmark_count integer default 0,
  version text default '1.0.0',
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  file_url text,
  preview_url text,
  npm_package_name text,
  npm_published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table reviews (
  id uuid default gen_random_uuid() primary key,
  skill_id uuid references skills(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  comment text not null,
  created_at timestamptz default now(),
  unique (skill_id, user_id)
);

create table likes (
  id uuid default gen_random_uuid() primary key,
  skill_id uuid references skills(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(skill_id, user_id)
);

create table downloads (
  id uuid default gen_random_uuid() primary key,
  skill_id uuid references skills(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  skill_id uuid references skills(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(skill_id, user_id)
);

create table reports (
  id uuid default gen_random_uuid() primary key,
  skill_id uuid references skills(id) on delete cascade not null,
  reporter_id uuid references profiles(id) on delete cascade not null,
  reason text not null,
  status text default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamptz default now()
);

create table activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- 3. FUNCTIONS

create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

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

create or replace function get_user_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- auth.users에서 이메일 존재 여부 확인 (회원가입 중복 체크용)
create or replace function check_email_exists(check_email text)
returns boolean as $$
  select exists(select 1 from auth.users where lower(email) = lower(check_email));
$$ language sql security definer;

-- profiles에서 유저명 존재 여부 확인 (회원가입 중복 체크용)
create or replace function check_username_exists(check_username text)
returns boolean as $$
  select exists(select 1 from public.profiles where lower(username) = lower(check_username));
$$ language sql security definer;

create or replace function update_like_count()
returns trigger as $$
begin
  update skills
  set like_count = (select count(*) from likes where skill_id = coalesce(new.skill_id, old.skill_id))
  where id = coalesce(new.skill_id, old.skill_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create or replace function update_bookmark_count()
returns trigger as $$
begin
  update skills
  set bookmark_count = (select count(*) from bookmarks where skill_id = coalesce(new.skill_id, old.skill_id))
  where id = coalesce(new.skill_id, old.skill_id);
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create or replace function increment_download_count()
returns trigger as $$
begin
  update skills
  set downloads = downloads + 1
  where id = new.skill_id;
  return new;
end;
$$ language plpgsql security definer;

-- 4. TRIGGERS

create trigger on_profiles_updated
  before update on profiles
  for each row execute function handle_updated_at();

create trigger on_skills_updated
  before update on skills
  for each row execute function handle_updated_at();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

create trigger on_like_changed
  after insert or delete on likes
  for each row execute function update_like_count();

create trigger on_bookmark_changed
  after insert or delete on bookmarks
  for each row execute function update_bookmark_count();

create trigger on_download_inserted
  after insert on downloads
  for each row execute function increment_download_count();

-- 5. RLS POLICIES

-- profiles
alter table profiles enable row level security;

create policy "profiles_select_own"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles_select_admin"
  on profiles for select
  using (public.get_user_role() in ('admin', 'superadmin'));

create policy "profiles_update_own"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_update_admin"
  on profiles for update
  using (public.get_user_role() in ('admin', 'superadmin'));

-- skills
alter table skills enable row level security;

create policy "skills_select_approved"
  on skills for select
  using (status = 'approved');

create policy "skills_select_own"
  on skills for select
  using (author_id = auth.uid());

create policy "skills_select_admin"
  on skills for select
  using (public.get_user_role() in ('admin', 'superadmin'));

create policy "skills_insert_authenticated"
  on skills for insert
  with check (auth.uid() = author_id);

create policy "skills_update_own"
  on skills for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "skills_update_admin"
  on skills for update
  using (public.get_user_role() in ('admin', 'superadmin'));

create policy "skills_delete_own"
  on skills for delete
  using (author_id = auth.uid());

create policy "skills_delete_admin"
  on skills for delete
  using (public.get_user_role() in ('admin', 'superadmin'));

-- reviews
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

-- downloads
alter table downloads enable row level security;

create policy "downloads_select_own"
  on downloads for select
  using (user_id = auth.uid());

create policy "downloads_insert_authenticated"
  on downloads for insert
  with check (auth.uid() = user_id);

-- bookmarks
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

-- likes
alter table likes enable row level security;

create policy "likes_select_all"
  on likes for select
  using (true);

create policy "likes_insert_authenticated"
  on likes for insert
  with check (auth.uid() = user_id);

create policy "likes_delete_own"
  on likes for delete
  using (user_id = auth.uid());

-- reports
alter table reports enable row level security;

create policy "reports_select_admin"
  on reports for select
  using (public.get_user_role() in ('admin', 'superadmin'));

create policy "reports_select_own"
  on reports for select
  using (reporter_id = auth.uid());

create policy "reports_insert_authenticated"
  on reports for insert
  with check (auth.uid() = reporter_id);

create policy "reports_update_admin"
  on reports for update
  using (public.get_user_role() in ('admin', 'superadmin'));

-- activity_logs
alter table activity_logs enable row level security;

create policy "activity_logs_select_admin"
  on activity_logs for select
  using (public.get_user_role() in ('admin', 'superadmin'));

create policy "activity_logs_insert_authenticated"
  on activity_logs for insert
  with check (auth.uid() = user_id);

-- 6. STORAGE

insert into storage.buckets (id, name, public)
values ('skills', 'skills', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('previews', 'previews', true)
on conflict (id) do nothing;

create policy "skills_storage_select"
  on storage.objects for select
  using (bucket_id = 'skills');

create policy "skills_storage_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'skills'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "skills_storage_delete"
  on storage.objects for delete
  using (
    bucket_id = 'skills'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "previews_storage_select"
  on storage.objects for select
  using (bucket_id = 'previews');

create policy "previews_storage_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'previews'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "previews_storage_delete"
  on storage.objects for delete
  using (
    bucket_id = 'previews'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 7. BACKFILL existing auth users into profiles
insert into public.profiles (id, email, username)
select id, email, raw_user_meta_data->>'username'
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;

-- 8. Set superadmin (본인 이메일로 변경 후 실행)
-- UPDATE profiles SET role = 'superadmin' WHERE email = 'your-email@example.com';
