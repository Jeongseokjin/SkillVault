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
