-- 밤의 목장 — Supabase 전체 스키마 (새 프로젝트에서도, 기존 프로젝트에서도 SQL Editor에 통째로 실행 가능)
-- 여러 번 실행해도 안전합니다(이미 있는 것은 건너뜀). 기존 데이터는 지우지 않습니다.
-- 이 파일 하나로 앱이 쓰는 DB를 처음부터 다시 만들 수 있습니다:
--   1) Supabase에서 새 프로젝트 생성 → 이 파일 실행
--   2) Authentication > Providers > Google 켜기 (Google Cloud의 OAuth 클라이언트 ID/시크릿 입력)
--   3) Authentication > URL Configuration: Site URL과 Redirect URLs에 앱 주소 등록
--   4) js/core.js의 SUPABASE_URL / SUPABASE_KEY(publishable 키)를 새 프로젝트 값으로 교체
-- (docs/supabase_v2.7.sql의 내용도 여기에 포함되어 있습니다.)

-- ─────────────────────────────────────────────
-- 1) 테이블
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  lang        text,
  theme       text,
  font_level  int,
  updated_at  timestamptz not null default now()
);

create table if not exists public.visit_dates (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  visit_date  date not null,
  unique (user_id, visit_date)            -- 앱이 upsert(onConflict: 'user_id,visit_date')로 씀
);

create table if not exists public.mood_history (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  date        date not null,              -- 사용자 기기의 현지 날짜 (YYYY-MM-DD)
  emotion     text not null,              -- 감사·평안·걱정·지침·아픔·기도
  topic       text,                       -- 일·가족·공부·사람·모름
  need        text,                       -- 위로·힘·지혜·쉼
  diary_text  text,
  created_at  timestamptz not null default now()
);
create index if not exists mood_history_user_date on public.mood_history (user_id, date desc);

create table if not exists public.saved_verses (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  verse_text  text not null,
  verse_ref   text,
  emotion     text,
  need        text,
  saved_at    timestamptz not null default now()
);
create index if not exists saved_verses_user on public.saved_verses (user_id, saved_at desc);
-- 예전에 만든 테이블에 열이 빠져 있을 때를 대비
alter table public.saved_verses add column if not exists need text;
alter table public.saved_verses add column if not exists saved_at timestamptz not null default now();

-- 구독: 프리미엄 자격의 기준. 사용자는 자기 행을 "읽기만" 한다.
-- 쓰기 정책을 만들지 않으므로 브라우저 키로는 못 쓰고, 결제 웹훅(서버의 service_role 키)만 쓴다.
create table if not exists public.subscriptions (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  status             text not null default 'inactive' check (status in ('active','inactive','canceled','past_due')),
  plan               text,                       -- 'monthly' | 'yearly'
  current_period_end timestamptz,                -- 이 시각 이후에는 앱이 무료로 취급 (canceled여도 이때까지는 이용)
  provider           text,                       -- 결제사 이름
  provider_ref       text,                       -- 결제사 구독/빌링 키 식별자
  updated_at         timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- 2) RLS: 본인 데이터만 접근
-- ─────────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.visit_dates   enable row level security;
alter table public.mood_history  enable row level security;
alter table public.saved_verses  enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own visit_dates" on public.visit_dates;
create policy "own visit_dates" on public.visit_dates
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own mood_history" on public.mood_history;
create policy "own mood_history" on public.mood_history
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own saved_verses" on public.saved_verses;
create policy "own saved_verses" on public.saved_verses
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "read own subscription" on public.subscriptions;
create policy "read own subscription" on public.subscriptions
  for select to authenticated using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 3) 계정 삭제 함수 — 앱에서 sb.rpc('delete_my_account')
--    (구독 행은 auth.users 삭제 때 함께 지워진다. 실결제를 연 뒤에는 결제사의 자동결제도 먼저 해지해야 함)
-- ─────────────────────────────────────────────
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  delete from public.mood_history where user_id = uid;
  delete from public.saved_verses where user_id = uid;
  delete from public.visit_dates  where user_id = uid;
  delete from public.profiles     where id = uid;
  delete from auth.users          where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ─────────────────────────────────────────────
-- 4) 점검: 다섯 테이블 모두 rowsecurity = true 여야 합니다
-- ─────────────────────────────────────────────
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles','visit_dates','mood_history','saved_verses','subscriptions');
