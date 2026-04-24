# PhysioFlow — Contexto Atual

> Estado vivo do projeto. Ler antes de iniciar qualquer task. Atualizar ao concluir qualquer task.

## Fase Atual

**Phase 5 — Dashboard & KPIs concluída**
Dashboard `/dashboard` implementado com Server Component: KPI cards em tempo real (pacientes ativos, atendimentos hoje, sem retorno 30+ dias), gráfico semanal SVG, ações rápidas, atendimentos recentes e alerta de atenção clínica. Endpoint `GET /api/dashboard/metrics` disponível. Sem migration nova — usa `Patient` e `Session` existentes.

## Próximo Passo Planejado

**Phase 6 — Timeline de Evolução**: histórico cronológico visual de sessões SOAP por paciente, em `/pacientes/:id/evolucao`.

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
  - Shell e páginas de pacientes revisados para melhor responsividade em mobile e desktop
- **Dashboard & KPIs (Phase 5)**:
  - Endpoint `GET /api/dashboard/metrics` com todos os KPIs
  - Módulo `server/modules/dashboard/application/get-metrics.ts`
  - Página `/dashboard` com saudação, KPI cards, gráfico semanal SVG, ações rápidas, atendimentos recentes e alerta de atenção
  - Componentes `KpiCard`, `WeeklyChart`, `QuickActions`, `RecentSessions`, `AttentionAlert`
- **Sessões SOAP (Phase 4)**:
  - Modelo `Session` no Prisma + migration `phase4_sessions`
  - `GET/POST /api/sessions` e `GET/PUT/DELETE /api/sessions/:id`
  - Módulo `server/modules/sessions/` com application, domain, http e infra
  - Páginas `/atendimentos`, `/agenda` e `/pacientes/:id/sessoes/nova`
  - Componentes `SessionCard`, `StatusBadge` e `SessionForm`
  - Seed demo com histórico, agendamentos e atendimento domiciliar
  - Testes unitários cobrindo create/list/update do módulo
- **Páginas stub restantes**: dashboard, documentos

### Notas técnicas importantes

- **Prisma 7** usa engine `prisma-client` (novo) + adapter PG — não usa `prisma-client-js`
- **Seed no Prisma 7** fica em `prisma.config.ts` (`migrations.seed`), não em `package.json`
- **Middleware** renomeado para `proxy` (Next.js 16 convention): `src/proxy.ts`
- **Cliente Prisma** importado de `@/generated/prisma/client` (não de `@prisma/client`)
- **Datas de nascimento** tratadas como `date-only` com helpers UTC-safe em `src/lib/date.ts`
- **Paciente ativo** é a regra padrão de busca. Arquivados (`isActive = false`) saem das telas e lookups padrão
- **E-mail do paciente** é único por `userId` entre pacientes ativos
- **Sessões agendadas** não podem ser criadas/atualizadas no passado quando o status for `AGENDADO`
- **Migration já aplicada** não deve ser editada; mudanças novas devem virar uma nova migration
- Migrations ainda precisam ser executadas contra a `DATABASE_URL` real para validar o fluxo completo com Neon

## Modelos de Banco

- `User` — id, email, name, password, createdAt, updatedAt
- `Patient` — cadastro clínico base, classificação, área terapêutica, observações, `isActive`
- `ClinicalRecord` — prontuário inicial vinculado 1:1 ao paciente
- `Session` — atendimento clínico com data, duração, tipo, status e campos SOAP

## Realidade Arquitetural Atual

```
UI → Route Handlers (API) → Use Cases → Domain → Repositories (Prisma) → DB
```

Módulo `auth` completo com camadas: application, domain, http, infra
Módulo `patients` segue a mesma estrutura em `src/server/modules/patients/`
Módulo `sessions` segue o mesmo padrão em `src/server/modules/sessions/`

## Pendências Conhecidas

- Rodar `npx prisma migrate dev` e `npx prisma db seed` contra a base real (phases 4 e 5 dependem disso para validação completa)
- Reiniciar o `npm run dev` local após o `prisma generate` para carregar `prisma.session`
- Validar no browser: `/dashboard`, `/pacientes`, `/atendimentos`, `/agenda` e `/pacientes/:id/sessoes/nova`
- Confirmar o fluxo completo com o usuário demo `demo@phisioflow.com`

## Decisões Chave

- [ADR-001](decisions/ADR-001-tech-stack.md) — Tech Stack
- [ADR-002](decisions/ADR-002-soap-notes.md) — Estrutura SOAP
- [ADR-003](decisions/ADR-003-auth-approach.md) — Estratégia de Auth
