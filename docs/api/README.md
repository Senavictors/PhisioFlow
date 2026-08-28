# API

Os contratos HTTP são implementados em `src/app/api/**/route.ts`, com DTOs Zod nos módulos de `src/server/modules/*/http/`. As rotas exigem a sessão `phisioflow_session` e filtram operações pelo usuário autenticado.

## Índices existentes

- [`../../.docs/api/patients.md`](../../.docs/api/patients.md) — pacientes.
- [`../../.docs/api/sessions.md`](../../.docs/api/sessions.md) — sessões.
- [`../../.docs/api/google-calendar.md`](../../.docs/api/google-calendar.md) — Google Calendar.

## Grupos atuais

`/api/auth`, `/api/patients`, `/api/sessions`, `/api/treatment-plans`, `/api/payments`, `/api/finance`, `/api/documents`, `/api/workplaces`, `/api/settings/email` e `/api/integrations/google-calendar`.

Não crie documentação individual de endpoint nesta inicialização; ela deve ser adicionada sob demanda quando uma task alterar o contrato.
