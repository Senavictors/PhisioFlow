# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
e o projeto segue [Conventional Commits](https://www.conventionalcommits.org/) em PT-BR.

## [Unreleased]

### Added

- **Phase 17 — Dashboard Financeiro**
  - Módulo `finance` com `getFinanceSummaryUseCase` (apenas leitura): agrega
    recebido (`Payment.status` PAID/PARTIAL no período), previsto por sessões
    (`Session.AGENDADO` com `expectedFee` e `paymentStatus` PENDING/PARTIAL) e por
    parcelas de pacote (`Payment.PENDING` com `dueAt` no período); calcula delta
    contra o período anterior, série temporal por dia/semana/mês, breakdowns por
    `Workplace` e por `TherapyArea`, e top 50 pendências ordenadas por `dueAt`
  - Endpoint `GET /api/finance/summary?from&to&granularity&workplaceIds&areas`
    (Decimal serializado como string para precisão)
  - Página `/financeiro` (server component) com `FinancePeriodPicker` (presets
    hoje / 7d / 30d / mês atual / mês anterior + granularidade dia/semana/mês),
    três `FinanceSummaryCard` (recebido, previsto com quebra sessão+pacote,
    período anterior), `FinanceTimelineChart` SVG nativo (linha recebido vs
    previsto), `FinanceBreakdownPanel` por local e por área, e
    `PendingPaymentsTable` com ação "Marcar pago" abrindo `RegisterPaymentModal`
  - Mini-cards "Caixa do mês" e "A receber este mês" no `/dashboard` linkando
    para `/financeiro?preset=month`
  - Sidebar com novo link "Financeiro" (ícone `CircleDollarSign`)
  - Proxy autenticado cobrindo `/financeiro/**`
  - Testes unitários do `getFinanceSummaryUseCase` (cenário com dados e cenário
    vazio)
  - **PhysioFlow v2** (multi-modalidade + financeiro) entregue ao final desta fase

- **Phase 16 — Pagamentos**
  - Enums `PaymentMethod` (`PIX`, `CASH`, `CREDIT_CARD`, `DEBIT_CARD`, `BANK_TRANSFER`,
    `INSURANCE`, `OTHER`) e `PaymentStatus` (`PAID`, `PENDING`, `PARTIAL`, `REFUNDED`)
  - Modelo `Payment` com vínculo XOR a `Session` ou `TreatmentPlan` (constraint SQL)
  - `Session.expectedFee` (snapshot Decimal) e `Session.paymentStatus` (cache derivado)
  - Migration `phase16_payments` com backfill: snapshot de `expectedFee` em sessões
    existentes (PER_SESSION → `plan.sessionPrice`, avulso → `workplace.defaultSessionPrice`)
    e inicialização do `paymentStatus` como `PENDING` quando há valor a cobrar
  - Módulo `payments` com use cases: `registerPaymentUseCase`, `updatePaymentUseCase`,
    `voidPaymentUseCase`, `listPaymentsUseCase`, `getTreatmentPlanFinancialsUseCase`,
    `getPatientFinancialsUseCase` e `recomputeSessionPaymentStatus`
  - Endpoints REST:
    `POST /api/treatment-plans/:id/payments`,
    `POST /api/sessions/:id/payments`,
    `GET /api/payments`, `PUT/DELETE /api/payments/:id`,
    `GET /api/treatment-plans/:id/financials`,
    `GET /api/patients/:id/financials`
  - `createSessionUseCase` e `updateSessionUseCase` snapshotam `expectedFee` (do plano
    PER_SESSION, default do workplace ou input do usuário) e marcam `paymentStatus` inicial
  - UI: `PaymentBadge` no `SessionCard`, `PlanBalanceBadge` + ação "Registrar pagamento"
    no `TreatmentPlanCard`, modal `RegisterPaymentModal`, seção "Financeiro" na ficha do
    paciente, campo `expectedFee` (ou texto "Coberta pelo pacote") no `SessionForm`
  - Seed demo com pacote Pilates 600/1500 pago, sessão ortopédica avulsa paga e sessões
    avulsas/PER_SESSION pendentes
  - Soft delete de `Payment` via `status=REFUNDED` (preserva histórico para auditoria)

- **Phase 15 — Plano de Tratamento**
  - Modelo `TreatmentPlan` com `area`, `specialties`, `attendanceType`, `workplaceId`,
    `pricingModel`, status e campos preparatórios de cobrança por sessão/pacote
  - Enums `Specialty`, `PricingModel` e `PlanStatus`; enum `TherapyArea` expandido para
    áreas clínicas atuais
  - Migrations `phase15a_treatment_plans` e `phase15b_drop_legacy_fields` com backfill
    de planos legados, vínculo de sessões existentes e remoção de `Patient.area`,
    `Session.type` e `SessionType`
  - Módulo `treatment-plans` com use cases, repository, DTOs Zod e testes unitários
  - Endpoints REST:
    `GET/POST /api/patients/:id/treatment-plans`,
    `GET/PUT/DELETE /api/treatment-plans/:id`,
    `POST /api/treatment-plans/:id/pause|resume|complete`
  - Ficha do paciente com seção "Planos de tratamento", cards com contagem de sessões e
    ações de editar, pausar, retomar, concluir e cancelar
  - Páginas `/pacientes/:id/planos/novo` e `/pacientes/:id/planos/:planId/editar`
  - `SessionForm` com seletor de plano ativo ou atendimento avulso, herdando local e
    modalidade do plano quando selecionado
  - Seed demo com paciente multi-modalidade, paciente de estética domiciliar e paciente
    com sessões avulsas

- **Phase 14 — Locais de Trabalho**
  - Enum `WorkplaceKind` (`OWN_CLINIC`, `PARTNER_CLINIC`, `PARTICULAR`, `ONLINE`)
  - Enum `AttendanceType` (`CLINIC`, `HOME_CARE`, `HOSPITAL`, `CORPORATE`, `ONLINE`)
  - Modelo `Workplace` no schema Prisma com `defaultAttendanceType`, `defaultSessionPrice`,
    `defaultCommissionPct`, `address`, `notes` e `isActive`
  - `Session.workplaceId` (nullable) e `Session.attendanceType` (nullable)
  - Migration `phase14_workplaces` com backfill SQL: 1 workplace default por usuário e
    vinculação automática de todas as sessões existentes
  - Módulo `workplaces` completo: `domain/`, `http/`, `infra/`, `application/` com
    create, list, get, update e archive; testes unitários incluídos
  - `POST/GET /api/workplaces` e `GET/PUT/DELETE /api/workplaces/:id`
  - Página `/configuracoes/locais` com lista e CRUD inline (`WorkplacesManager`,
    `WorkplaceCard`, `WorkplaceForm`)
  - `SessionForm` com seletor de workplace (popula attendanceType default) e seletor de
    modalidade (`AttendanceType`)
  - `SessionCard` exibe nome do local de trabalho abaixo do horário
  - Link "Locais" na sidebar (secundário, com ícone `MapPin`)
  - Seed demo com "Clínica Movimento" (OWN_CLINIC) e "Atendimento Particular" (PARTICULAR)
  - `createSessionUseCase` busca workplace default do usuário quando `workplaceId` omitido

- **Phase 13 — Polimento de UI e Componentes**
  - Componente `ThemedSelect` (`src/components/ui/themed-select.tsx`): select customizado
    com botão trigger, lista flutuante, checkmark no item ativo, hover/focus na paleta
    sálvia; fecha em clique fora / `Esc`
  - Componente `DateTimePicker` (`src/components/ui/datetime-picker.tsx`): picker de
    data/hora temático com grid mensal, navegação de mês, highlight do dia selecionado
    (`bg-primary`) e hoje (`border-primary/40`), seletores de hora/minuto em passo de 5 min,
    botão "Pronto", links "Hoje" e "Limpar"; modos `datetime` e `date`
  - `SessionCard` refatorado: botão primário "Confirmar" exposto + botão `...` circular
    que abre menu flutuante com Cancelar, Enviar aviso, Sincronizar agenda, Remover do Google,
    Editar SOAP e Abrir paciente; lógica absorvida inline eliminando dependência de
    `SendSessionReminderButton` e `SyncSessionCalendarButton` como botões visíveis

### Fixed

- Sidebar mobile: `useEffect` corrigido com `useRef` de pathname — o menu não fecha mais
  imediatamente ao ser aberto; fecha apenas após navegação bem-sucedida
- Selects nativos substituídos por `ThemedSelect` em: `PatientFilters`, `DocumentFilters`,
  `SessionForm` (Tipo, Status), `PatientForm` (Área, Classificação, Prioridade),
  `NovoDocumentoModal` (Paciente, Tipo), `GoogleCalendarSettingsCard` (Agenda padrão)
- Input `datetime-local` e `date` substituídos por `DateTimePicker` em `SessionForm` e
  `PatientForm`
- Emoji 👋 removido da saudação do dashboard

- **Phase 10 — Edição SOAP e Agenda em Calendário**
  - `SessionForm` refatorado para suportar `mode="create" | "edit"` com `initialValues`,
    incluindo opção de status `CANCELADO` em edição
  - Nova rota `/atendimentos/[id]/editar` carrega a sessão via `getSessionUseCase` e
    persiste alterações com `PUT /api/sessions/:id` (mantém validação de data passada
    para `AGENDADO`)
  - Botão "Editar SOAP" no `SessionCard` apontando para a nova rota de edição
  - Componente `AgendaViewToggle` com tabs "Lista" e "Calendário" preservando filtro
    domiciliar e mês corrente
  - Componente `MonthCalendar` (client) com grid 6×7, navegação de mês via Link, destaque
    do dia atual, contagem por dia, indicadores de status e ícone de domiciliar; clique
    em um dia exibe as sessões do dia em painel lateral
  - `/agenda?view=calendar` busca sessões do mês via `listSessionsUseCase`
    (`from`/`to` calculados a partir do parâmetro `month=YYYY-MM`)
  - `DomiciliarToggle` agora preserva os demais query params ao alternar visão
  - Limite máximo de `listSessionsDTO` aumentado de 100 para 500 para suportar a visão mensal

- **Phase 11 — E-mails com Gmail App Password**
  - Migration `phase11_email_notifications`: enums `EmailProvider`, `EmailMessageType`,
    `EmailMessageStatus` e modelos `EmailSettings` (1:1 com User) + `EmailMessage`
    (log de envios)
  - Helper `src/lib/crypto.ts` com `aes-256-gcm` para criptografar a Senha de App
    do Gmail antes de gravar; chave em `INTEGRATION_ENCRYPTION_KEY`
  - Módulo `server/modules/email/` com domain (errors), http (DTOs), infra
    (repository + transporter `nodemailer`) e use cases:
    `saveEmailSettings`, `getEmailSettings`, `sendTestEmail`,
    `sendDocumentEmail`, `sendSessionReminder`
  - 5 endpoints REST autenticados com filtro por `userId`:
    `GET/PUT /api/settings/email`, `POST /api/settings/email/test`,
    `POST /api/documents/:id/email`, `POST /api/sessions/:id/email-reminder`
  - Página `/configuracoes/email` com formulário (`EmailSettingsForm`),
    passo a passo `GmailAppPasswordGuide` e botão de envio de teste; rota
    protegida pelo `proxy.ts`
  - Modal de gerar documento com checkbox "Enviar por e-mail ao paciente",
    mensagem opcional e download do PDF mantido em paralelo ao envio
  - Botão "Enviar aviso" no `SessionCard` para sessões `AGENDADO` (com cache
    leve do status de configuração) e checkbox no `SessionForm` durante o
    agendamento
  - `.env.example` documenta `INTEGRATION_ENCRYPTION_KEY`
  - Sidebar passa a apontar para `/configuracoes/email`

- **Phase 12 — Integração com Google Calendar**
  - Dependências `googleapis` e `server-only`
  - Migration `phase12_google_calendar` com `CalendarConnection` e `CalendarEventLink`
  - Helper `src/lib/crypto.ts` para criptografia AES-256-GCM de tokens
  - Módulo `server/modules/calendar/` com OAuth, repositories, use cases e integração com Google Calendar API
  - Endpoints OAuth/configuração: `/api/integrations/google-calendar`, `/connect`, `/callback` e `/calendars`
  - Endpoint manual de sessão: `POST/DELETE /api/sessions/:id/calendar-sync`
  - Página `/configuracoes/integracoes` com card de conexão, seleção de agenda padrão e toggle de sync automático
  - `SessionForm` com checkbox "Sincronizar" pré-marcado conforme configuração do usuário
  - `SessionCard` com badge de status de sync e ações para sincronizar, atualizar ou remover evento
  - Sincronização tolerante a falhas em criação/edição/cancelamento de sessões
  - Proteção de `/configuracoes` no `src/proxy.ts`
  - Documentação de API em `.docs/api/google-calendar.md`

- **Phase 9 — Polimento UX e Documentos v1.1**
  - Componente `DocumentTypeCards` com faixa de cards contextuais no topo de `/documentos`
    (Relatório de evolução, Laudo fisioterapêutico, Encaminhamento "em breve" e Declaração de horas)
  - Componente `PeriodInfoTooltip` no modal "Gerar documento" explicando o campo Período
    via hover/foco/clique
  - Labels públicos atualizados no modal: "Relatório de evolução", "Laudo fisioterapêutico",
    "Declaração de horas"
  - `QuickActions` redesenhado: botão "Cadastrar paciente" com borda visível, "Agendar sessão"
    em terracota com contraste alto e link "Ver atendimentos" com seta animada
  - `DomiciliarToggle` agora exibe spinner de loading ao trocar de visão e tem hover/focus
    visíveis também no estado ativo
  - Botão "Cancelar" do `SessionCard` migrado para variante terracota (danger-soft) para
    diferenciar claramente do botão "Abrir paciente"
  - Substituição de "Portal Restaurativo" por "Experiência Clínica Fluida" na sidebar
    desktop/mobile, topbar, login e register

- Planejamento do próximo ciclo:
  - Task `phase-9-ux-polish` para polimentos de UX, cards de documentos, microinterações e troca de naming
  - Task `phase-10-clinical-agenda-flow` para edição SOAP e visualização mensal da agenda
  - Task `phase-11-email-notifications` para Gmail App Password, envio de documentos e avisos de atendimento
  - Task `phase-12-google-calendar` para OAuth e sincronização unidirecional com Google Calendar
  - ADR-004 para registrar decisões de segurança e arquitetura das integrações externas

- **Phase 8 — Logística Domiciliar**
  - Enum `HomeCarePriority` (NORMAL / HIGH / URGENT) + migration `phase8_homecare_logistics`
  - Campos novos no modelo `Patient`: `address`, `neighborhood`, `city`, `homeCareNotes`, `homeCarePriority`
  - `PUT /api/patients/:id` aceita e persiste os novos campos de logística
  - Seção "Logística Domiciliar" no formulário de edição/criação de paciente com endereço, bairro, cidade, instruções de acesso e prioridade
  - Seção "Logística Domiciliar" na ficha do paciente (`/pacientes/:id`), visível apenas para `area = HOME_CARE`, com badge de prioridade e instruções de acesso
  - Badge de prioridade no `SessionCard`: Urgente (terracota) e Prioritário (amarelo) para sessões HOME_CARE
  - Exibição opcional de endereço nos cards de sessão domiciliar (prop `showAddress`)
  - Componente `DomiciliarToggle` na agenda — alterna entre visão geral e visão domiciliar
  - Visão domiciliar (`/agenda?domiciliar=1`): filtra sessões HOME_CARE, ordena por prioridade (URGENT → HIGH → NORMAL) depois por horário

- **Phase 7 — Central de Documentos**
  - Enum `DocumentType` + modelo `Document` no Prisma (migration `phase7_documents`)
  - `POST /api/documents` — cria registro e retorna metadados
  - `GET /api/documents` — listagem com filtro por tipo e paciente
  - `GET /api/documents/:id/download` — gera PDF on-demand via `@react-pdf/renderer` e faz stream
  - `DELETE /api/documents/:id` — soft delete
  - Módulo `server/modules/documents/` com camadas application, domain, http e infra
  - Templates PDF: `LaudoTemplate`, `RelatorioTemplate`, `DeclaracaoTemplate`
  - Módulo `src/lib/pdf/` com estilos base e função `renderDocumentPDF`
  - Componentes `DocumentCard`, `DocumentFilters`, `NovoDocumentoModal`
  - Página `/documentos` com header, filtros, lista de cards e modal de geração
  - Download automático do PDF ao criar o documento
- **Phase 6 — Timeline de Evolução**
  - `GET /api/patients/:id/sessions` com validação de ownership e paginação
  - Página `/pacientes/:id/evolucao` com timeline cronológica reversa
  - Componente `TimelineEntry` com dot colorido por status e linha vertical
  - Componente `SoapAccordion` colapsável (auto-abre em sessões REALIZADO com conteúdo)
  - Link "Ver evolução" inserido na ficha do paciente
  - Paginação via search param `?page=N`
- **Phase 5 — Dashboard & KPIs**
  - `GET /api/dashboard/metrics` com KPIs em tempo real (pacientes ativos, atendimentos hoje, sem retorno, sessões semanais, recentes)
  - Módulo `server/modules/dashboard/application/get-metrics.ts` (sem migration, consulta Patient + Session)
  - Página `/dashboard` com saudação, grid de 3 KPI cards, gráfico semanal SVG, ações rápidas e atendimentos recentes
  - Componentes `KpiCard`, `WeeklyChart`, `QuickActions`, `RecentSessions`, `AttentionAlert`
  - `AttentionAlert` exibe-se automaticamente quando há pacientes sem retorno há 30+ dias
- Documentação inicial do projeto (README, CONTEXT, vision, ADRs fundacionais, templates)
- CRM de pacientes com rotas `/api/patients` e `/api/patients/:id`
- Páginas `/pacientes`, `/pacientes/new`, `/pacientes/:id` e `/pacientes/:id/editar`
- Seed demo com três pacientes e usuário `demo@phisioflow.com`
- Documentação de domínio e API do módulo patients

### Changed

- Pacientes não têm mais área terapêutica própria; filtros e badges usam planos ativos.
- Sessões usam `attendanceType` para modalidade e `treatmentPlanId` opcional para vínculo
  clínico; e-mails, Google Calendar, agenda, dashboard e documentos foram atualizados para
  esse modelo.
- Phase 3 passou a criar e editar prontuário base junto com o cadastro do paciente
- Datas de nascimento agora usam helpers UTC-safe para evitar drift de fuso
- E-mail do paciente passou a ser validado como único por fisioterapeuta entre registros ativos
