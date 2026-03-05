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
