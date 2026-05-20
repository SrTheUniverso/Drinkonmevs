# Supabase - Drinkonme MVP

Esta pasta contém as migrations SQL iniciais do MVP.

## Aplicar em um projeto remoto Supabase

1. Instale/autentique a CLI:

```bash
supabase login
```

2. Vincule este repositório ao seu projeto Supabase:

```bash
supabase link --project-ref SEU_PROJECT_REF
```

3. Confira o plano antes de aplicar:

```bash
supabase db push --dry-run
```

4. Aplique as migrations:

```bash
supabase db push
```

Alternativa sem link, usando a connection string do Postgres:

```bash
supabase db push --db-url "postgresql://..."
```

## Observação

As regras sensíveis de resgate, QR Code, Mercado Pago, drinks e estoque ainda não foram implementadas por escopo.
