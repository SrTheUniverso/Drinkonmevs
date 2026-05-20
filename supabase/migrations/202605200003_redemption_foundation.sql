-- Redemption foundation for the MVP.
-- This prepares temporary redemption tokens only. It does not validate final redemptions and does not decrement offer stock.

create table if not exists public.plans (
  id bigint primary key generated always as identity,
  code text unique not null,
  name text not null,
  max_daily_redemptions integer not null check (max_daily_redemptions >= 0),
  max_weekly_redemptions integer not null check (max_weekly_redemptions >= 0),
  is_active boolean not null default true
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id bigint not null references public.plans(id),
  status text not null check (status in ('active', 'inactive', 'canceled')),
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bar_id uuid not null references public.bars(id) on delete cascade,
  drink_offer_id uuid not null references public.drink_offers(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  validation_status text not null check (
    validation_status in ('pending', 'validated', 'expired', 'canceled')
  ) default 'pending'
);

create table if not exists public.redemption_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  drink_offer_id uuid not null references public.drink_offers(id) on delete cascade,
  token text unique not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_redemptions_user_id on public.redemptions(user_id);
create index if not exists idx_redemptions_drink_offer_id on public.redemptions(drink_offer_id);
create index if not exists idx_redemptions_redeemed_at on public.redemptions(redeemed_at);
create index if not exists idx_redemption_tokens_user_id on public.redemption_tokens(user_id);
create index if not exists idx_redemption_tokens_drink_offer_id on public.redemption_tokens(drink_offer_id);
create index if not exists idx_redemption_tokens_expires_at on public.redemption_tokens(expires_at);

insert into public.plans (code, name, max_daily_redemptions, max_weekly_redemptions, is_active)
values ('free_test', 'Free Teste', 1, 3, true)
on conflict (code) do update set
  name = excluded.name,
  max_daily_redemptions = excluded.max_daily_redemptions,
  max_weekly_redemptions = excluded.max_weekly_redemptions,
  is_active = excluded.is_active;

insert into public.subscriptions (user_id, plan_id, status, started_at)
select u.id, p.id, 'active', now()
from auth.users u
cross join public.plans p
where p.code = 'free_test'
  and not exists (
    select 1
    from public.subscriptions s
    where s.user_id = u.id
      and s.status = 'active'
  );

create or replace function public.get_active_subscription(target_user_id uuid)
returns table (
  subscription_id uuid,
  plan_id bigint,
  plan_code text,
  plan_name text,
  max_daily_redemptions integer,
  max_weekly_redemptions integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.id,
    p.id,
    p.code,
    p.name,
    p.max_daily_redemptions,
    p.max_weekly_redemptions
  from public.subscriptions s
  join public.plans p on p.id = s.plan_id
  where s.user_id = target_user_id
    and s.status = 'active'
    and p.is_active = true
    and s.started_at <= now()
    and (s.expires_at is null or s.expires_at > now())
  order by s.started_at desc
  limit 1;
$$;

create or replace function public.prepare_redemption_token(p_drink_offer_id uuid)
returns table (
  id uuid,
  user_id uuid,
  drink_offer_id uuid,
  token text,
  expires_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  active_sub record;
  offer_record record;
  day_start timestamptz;
  day_end timestamptz;
  week_start_date date;
  week_start timestamptz;
  week_end timestamptz;
  daily_count integer;
  weekly_count integer;
  duplicate_count integer;
  active_daily_token_count integer;
  active_weekly_token_count integer;
  available_quantity integer;
  existing_token record;
  generated_token text;
begin
  if current_user_id is null then
    raise exception 'Usuário não autenticado.' using errcode = '28000';
  end if;

  select * into active_sub
  from public.get_active_subscription(current_user_id)
  limit 1;

  if active_sub.subscription_id is null then
    raise exception 'Assinatura ativa não encontrada.' using errcode = 'P0001';
  end if;

  select
    dof.id as offer_id,
    dof.offer_date,
    dof.total_quantity,
    dof.redeemed_quantity,
    dof.is_active as offer_is_active,
    d.id as drink_id,
    d.bar_id,
    d.is_active as drink_is_active,
    b.is_active as bar_is_active
  into offer_record
  from public.drink_offers dof
  join public.drinks d on d.id = dof.drink_id
  join public.bars b on b.id = d.bar_id
  where dof.id = p_drink_offer_id;

  if offer_record.offer_id is null then
    raise exception 'Oferta não encontrada.' using errcode = 'P0001';
  end if;

  if not offer_record.offer_is_active or not offer_record.drink_is_active or not offer_record.bar_is_active then
    raise exception 'Oferta indisponível.' using errcode = 'P0001';
  end if;

  if offer_record.offer_date <> (now() at time zone 'America/Sao_Paulo')::date then
    raise exception 'Oferta não disponível hoje.' using errcode = 'P0001';
  end if;

  available_quantity := offer_record.total_quantity - offer_record.redeemed_quantity;
  if available_quantity <= 0 then
    raise exception 'Oferta esgotada.' using errcode = 'P0001';
  end if;

  select * into existing_token
  from public.redemption_tokens rt
  where rt.user_id = current_user_id
    and rt.drink_offer_id = p_drink_offer_id
    and rt.used_at is null
    and rt.expires_at > now()
  order by rt.created_at desc
  limit 1;

  if existing_token.id is not null then
    return query
    select
      existing_token.id,
      existing_token.user_id,
      existing_token.drink_offer_id,
      existing_token.token,
      existing_token.expires_at,
      existing_token.created_at;
    return;
  end if;

  day_start := (((now() at time zone 'America/Sao_Paulo')::date)::timestamp at time zone 'America/Sao_Paulo');
  day_end := day_start + interval '1 day';

  week_start_date := ((now() at time zone 'America/Sao_Paulo')::date - (((extract(isodow from (now() at time zone 'America/Sao_Paulo'))::int) - 1) * interval '1 day'))::date;
  week_start := (week_start_date::timestamp at time zone 'America/Sao_Paulo');
  week_end := week_start + interval '7 days';

  select count(*) into daily_count
  from public.redemptions r
  where r.user_id = current_user_id
    and r.validation_status in ('pending', 'validated')
    and r.redeemed_at >= day_start
    and r.redeemed_at < day_end;

  select count(*) into active_daily_token_count
  from public.redemption_tokens rt
  where rt.user_id = current_user_id
    and rt.used_at is null
    and rt.expires_at > now()
    and rt.created_at >= day_start
    and rt.created_at < day_end;

  if (daily_count + active_daily_token_count) >= active_sub.max_daily_redemptions then
    raise exception 'Limite diário de resgates atingido.' using errcode = 'P0001';
  end if;

  select count(*) into weekly_count
  from public.redemptions r
  where r.user_id = current_user_id
    and r.validation_status in ('pending', 'validated')
    and r.redeemed_at >= week_start
    and r.redeemed_at < week_end;

  select count(*) into active_weekly_token_count
  from public.redemption_tokens rt
  where rt.user_id = current_user_id
    and rt.used_at is null
    and rt.expires_at > now()
    and rt.created_at >= week_start
    and rt.created_at < week_end;

  if (weekly_count + active_weekly_token_count) >= active_sub.max_weekly_redemptions then
    raise exception 'Limite semanal de resgates atingido.' using errcode = 'P0001';
  end if;

  select count(*) into duplicate_count
  from public.redemptions r
  where r.user_id = current_user_id
    and r.drink_offer_id = p_drink_offer_id
    and r.validation_status in ('pending', 'validated')
    and r.redeemed_at >= day_start
    and r.redeemed_at < day_end;

  if duplicate_count > 0 then
    raise exception 'Você já iniciou ou realizou resgate desta oferta hoje.' using errcode = 'P0001';
  end if;

  generated_token := encode(gen_random_bytes(24), 'hex');

  return query
  insert into public.redemption_tokens (
    user_id,
    drink_offer_id,
    token,
    expires_at
  )
  values (
    current_user_id,
    p_drink_offer_id,
    generated_token,
    now() + interval '5 minutes'
  )
  returning
    redemption_tokens.id,
    redemption_tokens.user_id,
    redemption_tokens.drink_offer_id,
    redemption_tokens.token,
    redemption_tokens.expires_at,
    redemption_tokens.created_at;
end;
$$;

grant execute on function public.prepare_redemption_token(uuid) to authenticated;

alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.redemptions enable row level security;
alter table public.redemption_tokens enable row level security;

drop policy if exists "plans_select_active" on public.plans;
create policy "plans_select_active"
on public.plans for select
to authenticated
using (is_active = true);

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
on public.subscriptions for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "redemptions_select_own" on public.redemptions;
create policy "redemptions_select_own"
on public.redemptions for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "redemption_tokens_select_own" on public.redemption_tokens;
create policy "redemption_tokens_select_own"
on public.redemption_tokens for select
to authenticated
using (user_id = auth.uid());
