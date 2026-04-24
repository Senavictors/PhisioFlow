# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
e o projeto segue [Conventional Commits](https://www.conventionalcommits.org/) em PT-BR.

## [Unreleased]

### Added

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
