# Changelog

Todas as mudanças notáveis neste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
e o projeto segue [Conventional Commits](https://www.conventionalcommits.org/) em PT-BR.

## [Unreleased]

### Added

- Documentação inicial do projeto (README, CONTEXT, vision, ADRs fundacionais, templates)
- CRM de pacientes com rotas `/api/patients` e `/api/patients/:id`
- Páginas `/pacientes`, `/pacientes/new`, `/pacientes/:id` e `/pacientes/:id/editar`
- Seed demo com três pacientes e usuário `demo@phisioflow.com`
- Documentação de domínio e API do módulo patients

### Changed

- Phase 3 passou a criar e editar prontuário base junto com o cadastro do paciente
- Datas de nascimento agora usam helpers UTC-safe para evitar drift de fuso
- E-mail do paciente passou a ser validado como único por fisioterapeuta entre registros ativos
