insert into public.bars (
  id,
  name,
  description,
  address,
  latitude,
  longitude,
  phone,
  instagram,
  is_active
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'Laranja Alta Bar',
    'Bar fictício com ambiente descontraído, balcão autoral e boas opções para começar a noite.',
    'Rua Harmonia, 320 - Vila Madalena, São Paulo - SP',
    -23.556520,
    -46.690720,
    '(11) 90000-1001',
    '@laranjaaltabar',
    true
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Noite Clara Lounge',
    'Lounge fictício com clima intimista, música baixa e carta de coquetéis clássicos.',
    'Rua Augusta, 1480 - Consolação, São Paulo - SP',
    -23.555310,
    -46.662480,
    '(11) 90000-1002',
    '@noiteclaralounge',
    true
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'Brinde da Esquina',
    'Bar fictício de esquina com mesas externas, drinks cítricos e atmosfera casual.',
    'Rua dos Pinheiros, 870 - Pinheiros, São Paulo - SP',
    -23.566960,
    -46.686230,
    '(11) 90000-1003',
    '@brindedaesquina',
    true
  ),
  (
    '44444444-4444-4444-8444-444444444444',
    'Copinho Secreto',
    'Bar fictício compacto com iluminação quente e foco em experiências rápidas de happy hour.',
    'Rua Vergueiro, 1000 - Liberdade, São Paulo - SP',
    -23.574050,
    -46.637560,
    '(11) 90000-1004',
    '@copinhosecreto',
    true
  ),
  (
    '55555555-5555-4555-8555-555555555555',
    'Varanda Aurora',
    'Bar fictício com varanda, vista urbana e drinks leves para encontros depois do trabalho.',
    'Alameda Santos, 1800 - Jardim Paulista, São Paulo - SP',
    -23.563580,
    -46.657350,
    '(11) 90000-1005',
    '@varandaaurora',
    true
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  phone = excluded.phone,
  instagram = excluded.instagram,
  is_active = excluded.is_active;

-- Reassert MVP RLS policies without changing the original migration.
drop policy if exists "bars_select_active_or_member" on public.bars;
create policy "bars_select_active_or_member"
on public.bars for select
to authenticated
using (
  is_active = true
  or public.is_active_bar_member(id)
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
