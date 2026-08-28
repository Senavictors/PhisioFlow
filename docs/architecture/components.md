---
estado: real
fonte: src/app, src/components, src/server/modules, src/lib, prisma/schema.prisma
ultima-revisao: 2026-08-27 bootstrap-init
---

# Componentes

## Entrada e apresentação

- **Páginas App Router** — `src/app/(app)/` e `src/app/(auth)/` compõem os fluxos de usuário.
- **Route Handlers** — `src/app/api/**/route.ts` autenticam, validam e adaptam HTTP para use cases.
- **Componentes de domínio** — `src/components/patients/`, `sessions/`, `treatment-plans/`, `payments/`, `finance/`, `documents/`, `agenda/` e `workplaces/`.
- **Layout e primitives** — `src/components/layout/` e `src/components/ui/`.

## Regras de negócio

- **Use cases** — `src/server/modules/*/application/` orquestra operações de pacientes, sessões, planos, pagamentos, financeiro e integrações.
- **Domínio** — `domain/` contém entidades, enums, erros e regras puras quando o módulo possui essa camada.
- **DTOs HTTP** — `http/` valida e tipa entradas com Zod.

## Persistência e serviços

- **Repositórios** — `infra/` encapsula Prisma por módulo.
- **Cliente Prisma** — `src/lib/prisma.ts` configura o adapter PostgreSQL.
- **Sessão e proteção** — `src/lib/session.ts` e `src/proxy.ts`.
- **Criptografia** — `src/lib/crypto.ts` protege tokens e senhas de app de integrações.
- **PDF** — `src/lib/pdf/` renderiza documentos no servidor sem persistência de arquivo na v1.

## Observabilidade/infraestrutura transversal

Não há camada de observabilidade estruturada, tracing ou auditoria dedicada identificada no código atual. Erros são tratados pelos módulos e Route Handlers existentes; uma futura implementação deve ser documentada antes de virar padrão.
