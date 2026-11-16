-- 밤의 목장 v2.7 — Supabase SQL Editor에서 한 번 실행
-- 실행 전에는: 계정 삭제가 "기록만 삭제"로 동작하고, 프리미엄 서버 확인은 항상 "무료"로 나옵니다.
-- (앱은 이 SQL 없이도 오류 없이 동작합니다.)

-- ─────────────────────────────────────────────
-- 1) 계정 삭제 함수: 본인 기록 4개 테이블 + 로그인 계정까지 삭제
--    앱에서 sb.rpc('delete_my_account') 로 호출합니다.
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
-- 2) 구독 테이블: 프리미엄 자격의 기준
--    사용자는 자기 행을 "읽기만" 할 수 있습니다. insert/update/delete 정책을 만들지 않으므로
--    브라우저(anon/publishable 키)로는 쓸 수 없고, 결제 완료 웹훅(service_role 키, 서버에서만 사용)만 씁니다.
-- ─────────────────────────────────────────────
create table if not exists public.subscriptions (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  status             text not null default 'inactive' check (status in ('active','inactive','canceled','past_due')),
  plan               text,                       -- 'monthly' | 'yearly'
  current_period_end timestamptz,                -- 이 시각 이후에는 앱이 무료로 취급
  provider           text,                       -- 결제사 이름
  provider_ref       text,                       -- 결제사 구독/빌링 키 식별자
  updated_at         timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "read own subscription" on public.subscriptions;
create policy "read own subscription" on public.subscriptions
  for select to authenticated
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- 3) 점검용: 기존 4개 테이블에 RLS가 켜져 있는지 확인 (결과의 rowsecurity가 모두 true여야 합니다)
-- ─────────────────────────────────────────────
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles','visit_dates','mood_history','saved_verses','subscriptions');
