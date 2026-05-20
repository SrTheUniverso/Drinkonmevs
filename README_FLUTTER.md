# Drinkonme Flutter MVP

Fundação Flutter do Drinkonme para Android e iOS.

## Stack inicial

- Flutter
- Riverpod
- go_router
- Supabase Flutter
- Geolocator
- url_launcher

## Configuração do Supabase

Passe as variáveis em tempo de execução usando `--dart-define`:

```bash
flutter run \
  --dart-define=SUPABASE_URL=https://SEU_PROJETO.supabase.co \
  --dart-define=SUPABASE_ANON_KEY=SUA_ANON_KEY
```

Sem essas variáveis, o app abre em modo não autenticado, mas login/cadastro reais não funcionarão.

## Autenticação implementada

- Login com email/senha via Supabase Auth.
- Cadastro com email/senha + nome.
- Carregamento de `profiles`, `roles` e `bar_members` após autenticação.
- Redirecionamento por papel:
  - `subscriber` -> `/home`
  - `bar_manager` -> `/bar-admin/dashboard`
  - `bar_operator` -> `/bar-operator/scan`
  - múltiplos papéis -> `/area-selection`
- Logout funcional.

## Fora do escopo desta etapa

Mercado Pago, QR Code real, regras de resgate, drinks, estoque/cota diária e Edge Functions ainda não foram implementados.
