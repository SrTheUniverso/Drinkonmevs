-- Drink catalog and daily offers for the MVP.
-- Offers are seeded for the current date in America/Sao_Paulo.

create table if not exists public.drinks (
  id uuid primary key default gen_random_uuid(),
  bar_id uuid not null references public.bars(id) on delete cascade,
  name text not null,
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.drink_offers (
  id uuid primary key default gen_random_uuid(),
  drink_id uuid not null references public.drinks(id) on delete cascade,
  offer_date date not null,
  total_quantity integer not null check (total_quantity >= 0),
  redeemed_quantity integer not null default 0 check (redeemed_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (drink_id, offer_date),
  check (redeemed_quantity <= total_quantity)
);

create index if not exists idx_drinks_bar_id on public.drinks(bar_id);
create index if not exists idx_drinks_is_active on public.drinks(is_active);
create index if not exists idx_drink_offers_drink_id on public.drink_offers(drink_id);
create index if not exists idx_drink_offers_offer_date on public.drink_offers(offer_date);
create index if not exists idx_drink_offers_is_active on public.drink_offers(is_active);

drop trigger if exists set_drinks_updated_at on public.drinks;
create trigger set_drinks_updated_at
before update on public.drinks
for each row execute function public.set_updated_at();

drop trigger if exists set_drink_offers_updated_at on public.drink_offers;
create trigger set_drink_offers_updated_at
before update on public.drink_offers
for each row execute function public.set_updated_at();

alter table public.drinks enable row level security;
alter table public.drink_offers enable row level security;

drop policy if exists "drinks_select_active_from_active_bars" on public.drinks;
create policy "drinks_select_active_from_active_bars"
on public.drinks for select
to authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.bars b
    where b.id = drinks.bar_id
      and b.is_active = true
  )
);

drop policy if exists "drinks_insert_by_bar_manager" on public.drinks;
create policy "drinks_insert_by_bar_manager"
on public.drinks for insert
to authenticated
with check (
  public.is_active_bar_member(bar_id, 'bar_manager')
  or public.has_role('platform_admin')
);

drop policy if exists "drinks_update_by_bar_manager" on public.drinks;
create policy "drinks_update_by_bar_manager"
on public.drinks for update
to authenticated
using (
  public.is_active_bar_member(bar_id, 'bar_manager')
  or public.has_role('platform_admin')
)
with check (
  public.is_active_bar_member(bar_id, 'bar_manager')
  or public.has_role('platform_admin')
);

drop policy if exists "drink_offers_select_active_today_or_future" on public.drink_offers;
create policy "drink_offers_select_active_today_or_future"
on public.drink_offers for select
to authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.drinks d
    join public.bars b on b.id = d.bar_id
    where d.id = drink_offers.drink_id
      and d.is_active = true
      and b.is_active = true
  )
);

drop policy if exists "drink_offers_insert_by_bar_manager" on public.drink_offers;
create policy "drink_offers_insert_by_bar_manager"
on public.drink_offers for insert
to authenticated
with check (
  exists (
    select 1
    from public.drinks d
    where d.id = drink_offers.drink_id
      and (
        public.is_active_bar_member(d.bar_id, 'bar_manager')
        or public.has_role('platform_admin')
      )
  )
);

drop policy if exists "drink_offers_update_by_bar_manager" on public.drink_offers;
create policy "drink_offers_update_by_bar_manager"
on public.drink_offers for update
to authenticated
using (
  exists (
    select 1
    from public.drinks d
    where d.id = drink_offers.drink_id
      and (
        public.is_active_bar_member(d.bar_id, 'bar_manager')
        or public.has_role('platform_admin')
      )
  )
)
with check (
  exists (
    select 1
    from public.drinks d
    where d.id = drink_offers.drink_id
      and (
        public.is_active_bar_member(d.bar_id, 'bar_manager')
        or public.has_role('platform_admin')
      )
  )
);

with seed_drinks (id, bar_id, name, description) as (
  values
    ('aaaaaaaa-0001-4000-8000-000000000001'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'Citrus da Casa', 'Drink cítrico fictício com limão, laranja e toque de hortelã.'),
    ('aaaaaaaa-0001-4000-8000-000000000002'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'Brinde Tropical', 'Mistura leve fictícia de frutas tropicais e especiarias suaves.'),
    ('aaaaaaaa-0001-4000-8000-000000000003'::uuid, '11111111-1111-4111-8111-111111111111'::uuid, 'Alta Spritz', 'Spritz fictício refrescante com notas herbais.'),

    ('aaaaaaaa-0002-4000-8000-000000000001'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, 'Clássico da Noite', 'Coquetel fictício equilibrado, inspirado em clássicos de balcão.'),
    ('aaaaaaaa-0002-4000-8000-000000000002'::uuid, '22222222-2222-4222-8222-222222222222'::uuid, 'Lua de Gengibre', 'Drink fictício com gengibre, cítricos e final levemente picante.'),

    ('aaaaaaaa-0003-4000-8000-000000000001'::uuid, '33333333-3333-4333-8333-333333333333'::uuid, 'Esquina Sour', 'Sour fictício com espuma cremosa e acidez elegante.'),
    ('aaaaaaaa-0003-4000-8000-000000000002'::uuid, '33333333-3333-4333-8333-333333333333'::uuid, 'Pinheiros Fizz', 'Fizz fictício leve, borbulhante e fácil de beber.'),

    ('aaaaaaaa-0004-4000-8000-000000000001'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, 'Segredo Vermelho', 'Drink fictício frutado com cor intensa e toque aromático.'),
    ('aaaaaaaa-0004-4000-8000-000000000002'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, 'Copinho Fresh', 'Opção fictícia refrescante com pepino, limão e ervas.'),

    ('aaaaaaaa-0005-4000-8000-000000000001'::uuid, '55555555-5555-4555-8555-555555555555'::uuid, 'Aurora Mule', 'Mule fictício com ginger beer e perfume cítrico.'),
    ('aaaaaaaa-0005-4000-8000-000000000002'::uuid, '55555555-5555-4555-8555-555555555555'::uuid, 'Varanda Tônica', 'Drink fictício leve com tônica, botânicos e final seco.')
)
insert into public.drinks (id, bar_id, name, description, is_active)
select id, bar_id, name, description, true
from seed_drinks
on conflict (id) do update set
  bar_id = excluded.bar_id,
  name = excluded.name,
  description = excluded.description,
  is_active = excluded.is_active;

with seed_offers (drink_id, total_quantity) as (
  values
    ('aaaaaaaa-0001-4000-8000-000000000001'::uuid, 24),
    ('aaaaaaaa-0001-4000-8000-000000000002'::uuid, 18),
    ('aaaaaaaa-0001-4000-8000-000000000003'::uuid, 12),
    ('aaaaaaaa-0002-4000-8000-000000000001'::uuid, 20),
    ('aaaaaaaa-0002-4000-8000-000000000002'::uuid, 15),
    ('aaaaaaaa-0003-4000-8000-000000000001'::uuid, 16),
    ('aaaaaaaa-0003-4000-8000-000000000002'::uuid, 22),
    ('aaaaaaaa-0004-4000-8000-000000000001'::uuid, 10),
    ('aaaaaaaa-0004-4000-8000-000000000002'::uuid, 28),
    ('aaaaaaaa-0005-4000-8000-000000000001'::uuid, 14),
    ('aaaaaaaa-0005-4000-8000-000000000002'::uuid, 26)
)
insert into public.drink_offers (
  drink_id,
  offer_date,
  total_quantity,
  redeemed_quantity,
  is_active
)
select
  drink_id,
  (now() at time zone 'America/Sao_Paulo')::date,
  total_quantity,
  0,
  true
from seed_offers
on conflict (drink_id, offer_date) do update set
  total_quantity = excluded.total_quantity,
  is_active = true;
