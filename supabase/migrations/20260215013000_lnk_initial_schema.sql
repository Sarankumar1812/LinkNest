create extension if not exists pgcrypto;

create table if not exists public.lnk_user_table (
  lnk_ut_id uuid primary key references auth.users(id) on delete cascade,
  lnk_ut_email text not null unique,
  lnk_ut_full_name text,
  lnk_ut_avatar_url text,
  lnk_ut_created_at timestamptz not null default now()
);

create table if not exists public.lnk_bookmark_table (
  lnk_bt_id uuid primary key default gen_random_uuid(),
  lnk_bt_user_id uuid not null references public.lnk_user_table(lnk_ut_id) on delete cascade,
  lnk_bt_title text not null,
  lnk_bt_url text not null,
  lnk_bt_created_at timestamptz not null default now()
);

create index if not exists idx_lnk_bt_user_created_at
  on public.lnk_bookmark_table (lnk_bt_user_id, lnk_bt_created_at desc);

alter table public.lnk_user_table enable row level security;
alter table public.lnk_bookmark_table enable row level security;

drop policy if exists "lnk_user_select_own" on public.lnk_user_table;
create policy "lnk_user_select_own"
  on public.lnk_user_table
  for select
  to authenticated
  using (auth.uid() = lnk_ut_id);

drop policy if exists "lnk_user_insert_own" on public.lnk_user_table;
create policy "lnk_user_insert_own"
  on public.lnk_user_table
  for insert
  to authenticated
  with check (auth.uid() = lnk_ut_id);

drop policy if exists "lnk_user_update_own" on public.lnk_user_table;
create policy "lnk_user_update_own"
  on public.lnk_user_table
  for update
  to authenticated
  using (auth.uid() = lnk_ut_id)
  with check (auth.uid() = lnk_ut_id);

drop policy if exists "lnk_bookmark_select_own" on public.lnk_bookmark_table;
create policy "lnk_bookmark_select_own"
  on public.lnk_bookmark_table
  for select
  to authenticated
  using (auth.uid() = lnk_bt_user_id);

drop policy if exists "lnk_bookmark_insert_own" on public.lnk_bookmark_table;
create policy "lnk_bookmark_insert_own"
  on public.lnk_bookmark_table
  for insert
  to authenticated
  with check (auth.uid() = lnk_bt_user_id);

drop policy if exists "lnk_bookmark_delete_own" on public.lnk_bookmark_table;
create policy "lnk_bookmark_delete_own"
  on public.lnk_bookmark_table
  for delete
  to authenticated
  using (auth.uid() = lnk_bt_user_id);
