# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
e o projeto segue [Conventional Commits](https://www.conventionalcommits.org/) em PT-BR.

## [Unreleased]

### Added

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

- Phase 3 passou a criar e editar prontuário base junto com o cadastro do paciente
- Datas de nascimento agora usam helpers UTC-safe para evitar drift de fuso
- E-mail do paciente passou a ser validado como único por fisioterapeuta entre registros ativos
