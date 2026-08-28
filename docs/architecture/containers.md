---
estado: real
fonte: package.json, next.config.ts, prisma.config.ts, src/lib/prisma.ts, src/server/modules/calendar/infra, src/server/modules/email/infra
ultima-revisao: 2026-08-27 bootstrap-init
---

# Containers

## 1. Aplicação PhysioFlow

- Next.js 16.2.4, React 19 e TypeScript.
- Serve páginas App Router, componentes React e Route Handlers em um único processo.
- As rotas autenticadas são protegidas por `src/proxy.ts`; a sessão é mantida em cookie HTTP-only.
- A comunicação com o banco e com provedores externos fica no lado servidor.

## 2. PostgreSQL Neon

- Banco hospedado acessado pelo Prisma 7 através de `@prisma/adapter-pg`.
- Schema e evolução ficam em `prisma/schema.prisma` e `prisma/migrations/`.
- Toda tabela clínica/financeira relevante carrega `userId` e as queries aplicam ownership.

## Serviços externos consumidos

| Serviço | Consumido por | Protocolo |
|---|---|---|
| Google Calendar | `src/server/modules/calendar/infra/` | OAuth 2.0 + HTTPS |
| Gmail SMTP | `src/server/modules/email/infra/transporter.ts` | SMTP |

## Comunicação entre containers

```text
Navegador → Aplicação Next.js → PostgreSQL Neon
                         ├──→ Google Calendar (opcional)
                         └──→ Gmail SMTP (opcional)
```
