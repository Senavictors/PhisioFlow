# PhysioFlow — Contexto Atual

> Estado vivo do projeto. Ler antes de iniciar qualquer task. Atualizar ao concluir qualquer task.

## Fase Atual

**Phase 8 — Logística Domiciliar concluída**
Campos de endereço e prioridade no modelo `Patient`, seção de logística na ficha e no formulário de edição, badge de prioridade no `SessionCard`, e visão domiciliar na agenda (`/agenda?domiciliar=1`) com ordenação por prioridade. Migration `phase8_homecare_logistics` aplicada.

**PhysioFlow v1 completo**: Cadastro → Atendimento SOAP → Evolução → Documentação → Logística Domiciliar.

## Próximo Passo Planejado

Próximo ciclo: melhorias de UX, notificações, multi-usuário por clínica (multi-tenant expandido) e integração com calendários externos (Google Calendar).

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
- `@react-pdf/renderer` v4 instalado (`serverExternalPackages` configurado em `next.config.ts`)

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
- **Timeline de Evolução (Phase 6)**:
  - Endpoint `GET /api/patients/:id/sessions` (valida ownership do paciente)
  - Página `/pacientes/:id/evolucao` com timeline cronológica reversa e paginação
  - Componentes `TimelineEntry` e `SoapAccordion` (colapsável, client component)
  - Link "Ver evolução" na ficha do paciente
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
- **Logística Domiciliar (Phase 8)**:
  - Enum `HomeCarePriority` + campos `address`, `neighborhood`, `city`, `homeCareNotes`, `homeCarePriority` no modelo `Patient` (migration `phase8_homecare_logistics`)
  - `PUT /api/patients/:id` aceita os novos campos via DTO Zod atualizado
  - Seção "Logística Domiciliar" no `PatientForm` e na ficha do paciente (apenas HOME_CARE)
  - Badge de prioridade no `SessionCard` (URGENTE terracota, PRIORITÁRIO amarelo)
  - Componente `DomiciliarToggle` + visão `/agenda?domiciliar=1` com filtro HOME_CARE e sort por prioridade
- **Central de Documentos (Phase 7)**:
  - Modelo `Document` + enum `DocumentType` no Prisma + migration `phase7_documents`
  - `POST /api/documents`, `GET /api/documents`, `GET /api/documents/:id/download`, `DELETE /api/documents/:id`
  - Módulo `server/modules/documents/` com domain, http, infra e application
  - Templates PDF em `src/lib/pdf/templates/` (laudo, relatório, declaração)
  - `renderDocumentPDF()` em `src/lib/pdf/render.ts` (server-only)
  - Componentes `DocumentCard`, `DocumentFilters`, `NovoDocumentoModal`
  - Página `/documentos` com modal de geração + download automático
- **Páginas stub restantes**: nenhuma

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
- **PDF gerado on-demand**: nenhum arquivo é persistido; `storagePath` é null na v1
- **@react-pdf/renderer** só importado server-side; adicionado a `serverExternalPackages` no `next.config.ts`
- Migrations ainda precisam ser executadas contra a `DATABASE_URL` real para validar o fluxo completo com Neon

## Modelos de Banco

- `User` — id, email, name, password, createdAt, updatedAt
- `Patient` — cadastro clínico base, classificação, área terapêutica, observações, endereço (address, neighborhood, city), homeCareNotes, homeCarePriority, `isActive`
- `ClinicalRecord` — prontuário inicial vinculado 1:1 ao paciente
- `Session` — atendimento clínico com data, duração, tipo, status e campos SOAP
- `Document` — metadados do documento gerado (tipo, título, período, patientId, userId), `isActive`

## Realidade Arquitetural Atual

```
UI → Route Handlers (API) → Use Cases → Domain → Repositories (Prisma) → DB
```

Módulo `auth` completo com camadas: application, domain, http, infra
Módulo `patients` segue a mesma estrutura em `src/server/modules/patients/`
Módulo `sessions` segue o mesmo padrão em `src/server/modules/sessions/`
Módulo `documents` segue o mesmo padrão em `src/server/modules/documents/`

## Pendências Conhecidas

- Rodar `npx prisma migrate dev` e `npx prisma db seed` contra a base real (phases 4 e 5 dependem disso para validação completa)
- Reiniciar o `npm run dev` local após o `prisma generate` para carregar `prisma.session`
- Validar no browser: `/dashboard`, `/pacientes`, `/atendimentos`, `/agenda` e `/pacientes/:id/sessoes/nova`
- Confirmar o fluxo completo com o usuário demo `demo@phisioflow.com`

## Decisões Chave

- [ADR-001](decisions/ADR-001-tech-stack.md) — Tech Stack
- [ADR-002](decisions/ADR-002-soap-notes.md) — Estrutura SOAP
- [ADR-003](decisions/ADR-003-auth-approach.md) — Estratégia de Auth
