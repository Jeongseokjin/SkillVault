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
