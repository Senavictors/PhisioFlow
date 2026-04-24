# PhysioFlow — Contexto Atual

> Estado vivo do projeto. Ler antes de iniciar qualquer task. Atualizar ao concluir qualquer task.

## Fase Atual

**Phase 3 — CRM de Pacientes em andamento**
Implementação local do módulo `patients` concluída no código: CRUD via API, páginas de listagem/cadastro/ficha/edição, prontuário base, soft delete, seed demo e documentação do módulo. Validação integrada com banco real ainda está pendente.

## Próximo Passo Planejado

**Concluir validação integrada da Phase 3 e iniciar Phase 4 — Registro SOAP** — ver task em `.docs/tasks/phase-4-soap-sessions.md`

## O Que Existe

### Infraestrutura

- Next.js 16 + TypeScript + Tailwind v4 (design tokens OKLCH completos)
- Fontes Fraunces + Plus Jakarta Sans via next/font
- shadcn/ui + lucide-react + Vitest configurados
- Prisma 7 com adapter `@prisma/adapter-pg` (engine nova)
  - Cliente gerado em `src/generated/prisma/`
  - Configuração de conexão em `prisma.config.ts`
- Seed demo em `prisma/seed.ts` com loader local `prisma/ts-loader.mjs`
- ESLint + Prettier configurados
- Design system completo em `physioflow-design-system/project/`

### Features implementadas

- **Auth completa**: register, login, logout
  - Sessões HTTP-only via iron-session
  - Proteção de rotas via `src/proxy.ts` (Next.js 16)
  - Hash de senha com bcryptjs
  - Validação Zod nos endpoints
- **Layout base**: Sidebar fiel ao design system, Topbar com nome do usuário e logout
- **CRM de Pacientes (Phase 3)**:
  - Modelos `Patient` e `ClinicalRecord` no Prisma + migration `patient_crm`
  - `GET/POST /api/patients` com filtros e criação de prontuário base
  - `GET/PUT/DELETE /api/patients/:id` com edição e arquivamento
  - Multi-tenant por `userId` em listagem, busca e conflito de e-mail
  - Páginas `/pacientes`, `/pacientes/new`, `/pacientes/:id` e `/pacientes/:id/editar`
  - Testes unitários cobrindo create/list/get/update do módulo
- **Páginas stub restantes**: dashboard, atendimentos, agenda, documentos

### Notas técnicas importantes

- **Prisma 7** usa engine `prisma-client` (novo) + adapter PG — não usa `prisma-client-js`
- **Seed no Prisma 7** fica em `prisma.config.ts` (`migrations.seed`), não em `package.json`
- **Middleware** renomeado para `proxy` (Next.js 16 convention): `src/proxy.ts`
- **Cliente Prisma** importado de `@/generated/prisma/client` (não de `@prisma/client`)
- **Datas de nascimento** tratadas como `date-only` com helpers UTC-safe em `src/lib/date.ts`
- **Paciente ativo** é a regra padrão de busca. Arquivados (`isActive = false`) saem das telas e lookups padrão
- **E-mail do paciente** é único por `userId` entre pacientes ativos
- **Migration já aplicada** não deve ser editada; mudanças novas devem virar uma nova migration
- Migrations ainda precisam ser executadas contra a `DATABASE_URL` real para validar o fluxo completo com Neon

## Modelos de Banco

- `User` — id, email, name, password, createdAt, updatedAt
- `Patient` — cadastro clínico base, classificação, área terapêutica, observações, `isActive`
- `ClinicalRecord` — prontuário inicial vinculado 1:1 ao paciente

## Realidade Arquitetural Atual

```
UI → Route Handlers (API) → Use Cases → Domain → Repositories (Prisma) → DB
```

Módulo `auth` completo com camadas: application, domain, http, infra
Módulo `patients` segue a mesma estrutura em `src/server/modules/patients/`

## Pendências Conhecidas

- Rodar `npx prisma migrate dev` e `npx prisma db seed` contra a base real
- Validar no browser o fluxo completo com o usuário demo `demo@phisioflow.com`
- Se tudo passar no ambiente real, mover o roadmap para Phase 4

## Decisões Chave

- [ADR-001](decisions/ADR-001-tech-stack.md) — Tech Stack
- [ADR-002](decisions/ADR-002-soap-notes.md) — Estrutura SOAP
- [ADR-003](decisions/ADR-003-auth-approach.md) — Estratégia de Auth
