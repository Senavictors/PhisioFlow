# Integrações

## Google Calendar

Implementado em `src/server/modules/calendar/` com OAuth, tokens criptografados, seleção de calendário e sincronização de sessões. Contratos e decisões funcionais: [`.docs/api/google-calendar.md`](../../.docs/api/google-calendar.md) e [`.docs/decisions/ADR-004-integracoes-externas.md`](../../.docs/decisions/ADR-004-integracoes-externas.md).

## Gmail SMTP

Implementado em `src/server/modules/email/` com App Password, envio de documentos, lembretes e teste. A senha é armazenada criptografada; os valores necessários estão em `.env.example` e a configuração é server-side.

## PDF

`src/lib/pdf/` gera laudos, relatórios e declarações on-demand com `@react-pdf/renderer`. A implementação atual não usa storage persistente.

Integrações novas precisam declarar credenciais, ownership, efeitos externos, estratégia de teste e tratamento de falhas antes da implementação.
