-- Final manual validation of redemption tokens by bar operators/managers.
-- No camera/QR scanner dependency: this validates the token text.

create or replace function public.validate_redemption_token(p_token text)
returns table (
  redemption_id uuid,
  bar_id uuid,
  drink_name text,
  validated_at timestamptz,
  status text,
  message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  token_record record;
  offer_record record;
  new_redemption_id uuid;
  now_value timestamptz := now();
begin
  if current_user_id is null then
    raise exception 'Operador não autenticado.' using errcode = '28000';
  end if;

  if p_token is null or length(trim(p_token)) = 0 then
    raise exception 'Token não informado.' using errcode = 'P0001';
  end if;

  select * into token_record
  from public.redemption_tokens rt
  where rt.token = trim(p_token)
  for update;

  if token_record.id is null then
    raise exception 'Token não encontrado.' using errcode = 'P0001';
  end if;

  if token_record.used_at is not null then
    raise exception 'Token já utilizado.' using errcode = 'P0001';
  end if;

  if token_record.expires_at <= now_value then
    raise exception 'Token expirado.' using errcode = 'P0001';
  end if;

  select
    dof.id as offer_id,
    dof.total_quantity,
    dof.redeemed_quantity,
    dof.is_active as offer_is_active,
    d.id as drink_id,
    d.name as drink_name,
    d.bar_id,
    d.is_active as drink_is_active,
    b.is_active as bar_is_active
  into offer_record
  from public.drink_offers dof
  join public.drinks d on d.id = dof.drink_id
  join public.bars b on b.id = d.bar_id
  where dof.id = token_record.drink_offer_id
  for update of dof;

  if offer_record.offer_id is null then
    raise exception 'Oferta do token não encontrada.' using errcode = 'P0001';
  end if;

  if not offer_record.offer_is_active or not offer_record.drink_is_active or not offer_record.bar_is_active then
    raise exception 'Oferta indisponível.' using errcode = 'P0001';
  end if;

  if not (
    public.is_active_bar_member(offer_record.bar_id, 'bar_operator')
    or public.is_active_bar_member(offer_record.bar_id, 'bar_manager')
    or public.has_role('platform_admin')
  ) then
    raise exception 'Operador não autorizado para este bar.' using errcode = '42501';
  end if;

  if (offer_record.total_quantity - offer_record.redeemed_quantity) <= 0 then
    raise exception 'Oferta esgotada.' using errcode = 'P0001';
  end if;

  insert into public.redemptions (
    user_id,
    bar_id,
    drink_offer_id,
    redeemed_at,
    validation_status
  )
  values (
    token_record.user_id,
    offer_record.bar_id,
    token_record.drink_offer_id,
    now_value,
    'validated'
  )
  returning id into new_redemption_id;

  update public.redemption_tokens
  set used_at = now_value
  where id = token_record.id;

  update public.drink_offers
  set redeemed_quantity = redeemed_quantity + 1
  where id = token_record.drink_offer_id;

  return query
  select
    new_redemption_id,
    offer_record.bar_id::uuid,
    offer_record.drink_name::text,
    now_value,
    'validated'::text,
    'Resgate validado. Drink liberado para o cliente.'::text;
end;
$$;

grant execute on function public.validate_redemption_token(text) to authenticated;

-- Allow active bar operators/managers to see validated/pending redemptions for their own bar.
drop policy if exists "redemptions_select_own_or_bar_member" on public.redemptions;
create policy "redemptions_select_own_or_bar_member"
on public.redemptions for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_active_bar_member(bar_id, 'bar_operator')
  or public.is_active_bar_member(bar_id, 'bar_manager')
  or public.has_role('platform_admin')
);
