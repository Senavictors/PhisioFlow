# PhysioFlow — Contexto Atual

> Estado vivo do projeto. Ler antes de iniciar qualquer task. Atualizar ao concluir qualquer task.

## Fase Atual

**Phase 16 — Pagamentos concluída**
Modelo `Payment` criado com vínculo XOR a `Session` ou `TreatmentPlan` (constraint SQL),
enums `PaymentMethod` e `PaymentStatus`, e snapshot `Session.expectedFee` + cache
`Session.paymentStatus`. Migration `phase16_payments` faz backfill: PER_SESSION usa
`plan.sessionPrice`, avulso usa `workplace.defaultSessionPrice` e `paymentStatus` inicia
como `PENDING` quando há valor a cobrar. Módulo `payments` completo (domain, dto, infra,
application) com use cases `registerPaymentUseCase`, `updatePaymentUseCase`,
`voidPaymentUseCase`, `listPaymentsUseCase`, `getTreatmentPlanFinancialsUseCase`,
`getPatientFinancialsUseCase` e `recomputeSessionPaymentStatus`. Endpoints REST em
`/api/treatment-plans/:id/payments`, `/api/sessions/:id/payments`, `/api/payments`,
`/api/payments/:id`, `/api/treatment-plans/:id/financials` e `/api/patients/:id/financials`.
`createSessionUseCase` e `updateSessionUseCase` snapshotam `expectedFee` (do plano
PER_SESSION, default do workplace ou input direto) e marcam `paymentStatus` inicial.
UI ganhou `PaymentBadge` (SessionCard), `PlanBalanceBadge` + ação "Registrar pagamento"
no `TreatmentPlanCard`, modal `RegisterPaymentModal`, seção "Financeiro" na ficha do
paciente e campo `expectedFee` (ou texto "Coberta pelo pacote") no `SessionForm`. Soft
delete via `status=REFUNDED`. Seed demo com pacote Pilates 600/1500 pago, sessão
ortopédica avulsa paga e sessões pendentes.

**Phase 15 — Plano de Tratamento concluída**
Modelo `TreatmentPlan` criado com `TherapyArea` expandido, enums `Specialty`,
`PricingModel` e `PlanStatus`, vínculo opcional de `Session.treatmentPlanId` e backfill
SQL em duas migrations (`phase15a_treatment_plans` e `phase15b_drop_legacy_fields`).
`Patient.area`, `Session.type` e `SessionType` foram removidos; `Session.workplaceId` e
`Session.attendanceType` agora são obrigatórios. Módulo `treatment-plans` completo com
CRUD/status REST, use cases e testes. Ficha do paciente ganhou seção "Planos de
tratamento", páginas de novo/editar plano, `SessionForm` ganhou seletor de plano/avulso,
agenda/e-mails/Google Calendar/documentos/dashboard passaram a usar `attendanceType` e
área do plano. Seed demo mostra paciente com dois planos, paciente com estética domiciliar
e paciente com sessões avulsas.

**Phase 14 — Locais de Trabalho concluída**
Enum `WorkplaceKind` (`OWN_CLINIC`, `PARTNER_CLINIC`, `PARTICULAR`, `ONLINE`) e enum
`AttendanceType` (`CLINIC`, `HOME_CARE`, `HOSPITAL`, `CORPORATE`, `ONLINE`) adicionados.
Modelo `Workplace` criado; `Session` ganhou `workplaceId` e `attendanceType` (nullable).
Migration `phase14_workplaces` com backfill SQL: 1 workplace default por usuário + sessões
vinculadas. Módulo `workplaces` completo (domain, dto, infra, application). CRUD REST em
`/api/workplaces`. Página `/configuracoes/locais`. `SessionForm` seleciona workplace e
modalidade; `SessionCard` exibe nome do local. Sidebar com link "Locais". Seed demo com
"Clínica Movimento" e "Atendimento Particular".

**Phase 13 — Polimento de UI e Componentes concluída**
`ThemedSelect` e `DateTimePicker` temáticos substituem todos os controles nativos do navegador.
`SessionCard` refatorado com menu flutuante `...` (Confirmar exposto, demais ações no menu).
Bug de sidebar mobile corrigido via `useRef` de pathname. Emoji 👋 removido do dashboard.

**Phase 12 — Integração com Google Calendar implementada**
OAuth Google Calendar, armazenamento criptografado de tokens, página
`/configuracoes/integracoes`, seleção de agenda padrão, sync manual por sessão, checkbox
no formulário de atendimento e atualização/remoção tolerante a falhas em criação/edição/
cancelamento de sessões. Migration `phase12_google_calendar` criada.

**Phase 11 — E-mails com Gmail App Password concluída**
Migration `phase11_email_notifications` (modelos `EmailSettings`/`EmailMessage` +
3 enums), helper `aes-256-gcm` em `src/lib/crypto.ts`, módulo `server/modules/email/`
com use cases de salvar/teste/envio de documento/envio de lembrete e 5 endpoints REST.
Página `/configuracoes/email` com formulário, guia de Senha de App e teste; modal de
documento com checkbox de envio; `SessionCard` e `SessionForm` ganham opção de aviso.
`.env.example` documenta `INTEGRATION_ENCRYPTION_KEY` (32 bytes em base64).

**Phase 10 — Edição SOAP e Agenda em Calendário concluída**
`SessionForm` em modo create/edit, rota `/atendimentos/[id]/editar` para revisar/atualizar
campos SOAP e dados do atendimento, e nova visão `/agenda?view=calendar&month=YYYY-MM` com
calendário mensal, contagem por dia, indicadores de status e painel lateral de sessões do
dia selecionado. `DomiciliarToggle` agora preserva os demais params; limite do
`listSessionsDTO` elevado para 500.

**Phase 9 — Polimento UX e Documentos v1.1 concluída**
Cards contextuais no topo de `/documentos`, tooltip de período no modal de geração,
QuickActions com botões mais visíveis, `DomiciliarToggle` com loading, botão "Cancelar"
em terracota e substituição de "Portal Restaurativo" por "Experiência Clínica Fluida"
em sidebar/topbar/login/register. `ENCAMINHAMENTO` ficou apenas como card "em breve",
sem alterar enum/templates.

**Phase 8 — Logística Domiciliar concluída**
Campos de endereço e prioridade no modelo `Patient`, seção de logística na ficha e no formulário de edição, badge de prioridade no `SessionCard`, e visão domiciliar na agenda (`/agenda?domiciliar=1`) com ordenação por prioridade. Migration `phase8_homecare_logistics` aplicada.

**PhysioFlow v1 completo**: Cadastro → Atendimento SOAP → Evolução → Documentação → Logística Domiciliar.

## Próximo Passo Planejado

**Phase 17 — Dashboard Financeiro** — [task file](tasks/phase-17-finance-dashboard.md)
Consumir `Payment` e `Session.expectedFee` para agregar recebido vs previsto, série
temporal, quebras por local/área e lista de pendências.

Pendências operacionais:

- Validar integrações em ambiente real (Phase 11/12) e preparar deploy na Vercel
- Configurar `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALENDAR_REDIRECT_URI`
  e `INTEGRATION_ENCRYPTION_KEY` (esta última gerada com `openssl rand -base64 32`)

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

### Tasks planejadas

- `.docs/tasks/phase-17-finance-dashboard.md` — Dashboard financeiro (recebido vs previsto)
- `.docs/decisions/ADR-005-multi-modalidade-financeiro.md` — Decisão proposta para
  multi-modalidade clínica e acompanhamento financeiro

### Tasks já concluídas (referência)

- `.docs/tasks/phase-14-workplaces.md` — Locais de trabalho (`Workplace`, `AttendanceType`, CRUD + UI)
- `.docs/tasks/phase-15-treatment-plans.md` — Plano de tratamento e multi-modalidade
- `.docs/tasks/phase-16-payments.md` — Pagamentos e cobrança (avulso e pacote)
- `.docs/tasks/phase-9-ux-polish.md` — Polimentos visuais e de microinteração
- `.docs/tasks/phase-10-clinical-agenda-flow.md` — Edição SOAP e visualização mensal da agenda
- `.docs/tasks/phase-11-email-notifications.md` — Gmail App Password e envios
- `.docs/tasks/phase-12-google-calendar.md` — OAuth Google Calendar
- `.docs/tasks/phase-13-ui-polish.md` — `ThemedSelect`, `DateTimePicker` e refatoração do `SessionCard`

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
  - `POST/DELETE /api/sessions/:id/calendar-sync` para sincronizar/remover evento Google Calendar
  - Módulo `server/modules/sessions/` com application, domain, http e infra
  - Páginas `/atendimentos`, `/agenda` e `/pacientes/:id/sessoes/nova`
  - Componentes `SessionCard`, `StatusBadge` e `SessionForm`
  - Seed demo com histórico, agendamentos e atendimento domiciliar
  - Testes unitários cobrindo create/list/update do módulo
- **Planos de Tratamento (Phase 15)**:
  - Modelo `TreatmentPlan` com área, especialidades, modalidade, local, status e modelo
    de cobrança preparatório para a Phase 16
  - `POST/GET /api/patients/:id/treatment-plans`, `GET/PUT/DELETE /api/treatment-plans/:id`
    e ações `pause`, `resume`, `complete`
  - Ficha do paciente com cards de planos e ações de editar/pausar/concluir/cancelar
  - Formulário de plano em `/pacientes/:id/planos/novo` e `/pacientes/:id/planos/:planId/editar`
  - `SessionForm` com seletor de plano ativo ou atendimento avulso
  - Filtros de pacientes/sessões por área usando planos ativos/vínculo de plano
  - Seed demo com multi-modalidade e sessões avulsas
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
- **Google Calendar (Phase 12)**:
  - Dependências `googleapis` e `server-only`
  - Enums `CalendarProvider` e `CalendarSyncStatus`
  - Modelos `CalendarConnection` e `CalendarEventLink` no Prisma
  - `GET/PUT/DELETE /api/integrations/google-calendar`
  - `GET /api/integrations/google-calendar/connect`
  - `GET /api/integrations/google-calendar/callback`
  - `GET /api/integrations/google-calendar/calendars`
  - Módulo `server/modules/calendar/` com camadas application, domain, http e infra
  - Tokens OAuth criptografados com `INTEGRATION_ENCRYPTION_KEY`
  - Página `/configuracoes/integracoes` protegida pelo proxy
  - Badge e ações de sync no `SessionCard`
  - Checkbox de sync no `SessionForm`
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
- **Google Calendar** exige envs server-side: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `GOOGLE_CALENDAR_REDIRECT_URI` e `INTEGRATION_ENCRYPTION_KEY`
- **Clientes Google/OAuth** são inicializados dentro de funções, nunca em module scope
- Migrations ainda precisam ser executadas contra a `DATABASE_URL` real para validar o fluxo completo com Neon

## Modelos de Banco

- `User` — id, email, name, password, createdAt, updatedAt
- `Patient` — cadastro clínico base, classificação, observações, endereço (address, neighborhood, city), homeCareNotes, homeCarePriority, `isActive`
- `ClinicalRecord` — prontuário inicial vinculado 1:1 ao paciente
- `TreatmentPlan` — plano/modalidade clínica do paciente com área, especialidades,
  local, modalidade, status e modelo de cobrança
- `Session` — atendimento clínico com data, duração, status, plano opcional, local,
  modalidade e campos SOAP
- `Document` — metadados do documento gerado (tipo, título, período, patientId, userId), `isActive`
- `CalendarConnection` — conexão Google Calendar por usuário, com tokens criptografados e agenda padrão
- `CalendarEventLink` — vínculo entre uma sessão e um evento externo Google Calendar
- `Workplace` — local de trabalho do fisioterapeuta (OWN_CLINIC, PARTNER_CLINIC, PARTICULAR, ONLINE)
- `Payment` — pagamento (avulso vinculado a `Session` ou de pacote vinculado a `TreatmentPlan`),
  com `amount`, `method`, `status`, `paidAt`, `dueAt` e XOR via constraint SQL

## Realidade Arquitetural Atual

```
UI → Route Handlers (API) → Use Cases → Domain → Repositories (Prisma) → DB
```

Módulo `auth` completo com camadas: application, domain, http, infra
Módulo `patients` segue a mesma estrutura em `src/server/modules/patients/`
Módulo `sessions` segue o mesmo padrão em `src/server/modules/sessions/`
Módulo `documents` segue o mesmo padrão em `src/server/modules/documents/`
Módulo `calendar` segue o mesmo padrão em `src/server/modules/calendar/`
Módulo `workplaces` segue o mesmo padrão em `src/server/modules/workplaces/`
Módulo `treatment-plans` segue o mesmo padrão em `src/server/modules/treatment-plans/`
Módulo `payments` segue o mesmo padrão em `src/server/modules/payments/`

## Pendências Conhecidas

- Validar Phase 12 com conta Google real depois de configurar OAuth no Google Cloud Console
- Executar `npx prisma migrate dev` para aplicar `phase12_google_calendar` na base real
- Validar decisão do `ENCAMINHAMENTO`: card "em breve" ou documento PDF gerável com enum/template próprios
- Rodar `npx prisma migrate dev` e `npx prisma db seed` contra a base real (phases 4 e 5 dependem disso para validação completa)
- Reiniciar o `npm run dev` local após o `prisma generate` para carregar `prisma.session`
- Validar no browser: `/dashboard`, `/pacientes`, `/atendimentos`, `/agenda` e `/pacientes/:id/sessoes/nova`
- Confirmar o fluxo completo com o usuário demo `demo@phisioflow.com`

## Decisões Chave

- [ADR-001](decisions/ADR-001-tech-stack.md) — Tech Stack
- [ADR-002](decisions/ADR-002-soap-notes.md) — Estrutura SOAP
- [ADR-003](decisions/ADR-003-auth-approach.md) — Estratégia de Auth
- [ADR-004](decisions/ADR-004-integracoes-externas.md) — Integrações externas de e-mail e calendário
- [ADR-005](decisions/ADR-005-multi-modalidade-financeiro.md) — Multi-modalidade clínica e acompanhamento financeiro
