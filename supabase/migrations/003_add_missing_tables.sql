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
