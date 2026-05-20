create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id bigserial primary key,
  code text unique not null,
  name text not null
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id bigint not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table if not exists public.bars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  address text,
  latitude double precision,
  longitude double precision,
  phone text,
  instagram text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bar_members (
  id uuid primary key default gen_random_uuid(),
  bar_id uuid not null references public.bars(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('bar_manager', 'bar_operator')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (bar_id, user_id, role)
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  bar_id uuid not null references public.bars(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, bar_id)
);

create index if not exists idx_user_roles_user_id on public.user_roles(user_id);
create index if not exists idx_bar_members_user_id on public.bar_members(user_id);
create index if not exists idx_bar_members_bar_id on public.bar_members(bar_id);
create index if not exists idx_bars_is_active on public.bars(is_active);
create index if not exists idx_favorites_user_id on public.favorites(user_id);

insert into public.roles (code, name)
values
  ('subscriber', 'Assinante'),
  ('bar_manager', 'Gerente do bar'),
  ('bar_operator', 'Operador do bar'),
  ('platform_admin', 'Administrador da plataforma')
on conflict (code) do update set name = excluded.name;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_bars_updated_at on public.bars;
create trigger set_bars_updated_at
before update on public.bars
for each row execute function public.set_updated_at();

create or replace function public.has_role(role_code text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.code = role_code
  );
$$;

create or replace function public.is_active_bar_member(target_bar_id uuid, member_role text default null)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.bar_members bm
    where bm.user_id = auth.uid()
      and bm.bar_id = target_bar_id
      and bm.is_active = true
      and (member_role is null or bm.role = member_role)
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  subscriber_role_id bigint;
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (id) do nothing;

  select id into subscriber_role_id from public.roles where code = 'subscriber';

  if subscriber_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, subscriber_role_id)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.bars enable row level security;
alter table public.bar_members enable row level security;
alter table public.favorites enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "roles_select_linked_to_user" on public.roles;
create policy "roles_select_linked_to_user"
on public.roles for select
to authenticated
using (
  exists (
    select 1 from public.user_roles ur
    where ur.role_id = roles.id
      and ur.user_id = auth.uid()
  )
);

drop policy if exists "user_roles_select_own" on public.user_roles;
create policy "user_roles_select_own"
on public.user_roles for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "bars_select_active_or_member" on public.bars;
create policy "bars_select_active_or_member"
on public.bars for select
to authenticated
using (
  is_active = true
  or public.is_active_bar_member(id)
  or public.has_role('platform_admin')
);

drop policy if exists "bars_update_by_manager" on public.bars;
create policy "bars_update_by_manager"
on public.bars for update
to authenticated
using (
  public.is_active_bar_member(id, 'bar_manager')
  or public.has_role('platform_admin')
)
with check (
  public.is_active_bar_member(id, 'bar_manager')
  or public.has_role('platform_admin')
);

drop policy if exists "bar_members_select_own_or_manager" on public.bar_members;
create policy "bar_members_select_own_or_manager"
on public.bar_members for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_active_bar_member(bar_id, 'bar_manager')
  or public.has_role('platform_admin')
);

drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
on public.favorites for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "favorites_insert_own_subscriber" on public.favorites;
create policy "favorites_insert_own_subscriber"
on public.favorites for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.has_role('subscriber')
);

drop policy if exists "favorites_delete_own_subscriber" on public.favorites;
create policy "favorites_delete_own_subscriber"
on public.favorites for delete
to authenticated
using (
  user_id = auth.uid()
  and public.has_role('subscriber')
);
