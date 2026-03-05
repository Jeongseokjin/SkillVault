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
  price text default 'free' check (price in ('free', 'premium')),
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
