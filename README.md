# 🌿 PhysioFlow

> **Gestão clínica fluida, resultados restaurativos.**

SaaS de alta performance para fisioterapeutas. Interface editorial e acolhedora que otimiza o fluxo **Cadastro → Atendimento → Evolução → Documentação**.

---

## O Problema

Fisioterapeutas desperdiçam tempo em burocracia: prontuários em papel, laudos manuais, planilhas desconexas. O resultado é menos tempo com o paciente e mais com papel.

## A Solução

PhysioFlow centraliza toda a operação clínica em uma interface única — do cadastro do paciente ao laudo final — com automação de documentos e acompanhamento visual da evolução.

---

## Funcionalidades

- **CRM de Pacientes** — Cadastro completo com classificação (Idoso, PCD, Pós-acidente) e filtros por área terapêutica
- **Registro SOAP** — Evolução clínica padronizada: Subjetivo, Objetivo, Avaliação e Plano
- **Timeline de Evolução** — Histórico cronológico visual do progresso do paciente
- **Dashboard de KPIs** — Pacientes ativos, atendimentos semanais, alertas de inatividade
- **Central de Documentos** — Geração de laudos e relatórios em PDF com dados do prontuário
- **Logística Domiciliar** — Gestão de atendimentos fora da clínica com tags de prioridade
- **Locais de Trabalho** — Cadastro de clínicas, particular e online com defaults próprios
- **Planos de Tratamento** — Multi-modalidade por paciente, com área, especialidades,
  modalidade, local e pacote/avulso preparatório para o financeiro
- **Pagamentos** — Registro de cobranças avulsas e pacotes com método, status e snapshot
  `expectedFee` por sessão; saldo do plano e do paciente, modal de registro

### Em desenvolvimento (ciclo Multi-modalidade + Financeiro)

- **Dashboard Financeiro** — Recebido vs previsto por dia/semana/mês e quebra por
  local/área

---

## Arquitetura

```
UI (React) → Route Handlers → Use Cases → Domain → Repositories → PostgreSQL
```

### Princípios

- Route Handlers são adaptadores HTTP finos (sem lógica de negócio)
- Use Cases encapsulam toda regra clínica
- Repository Pattern isola acesso ao banco
- Multi-tenant: toda query filtra por `userId`
- Validação com Zod em todas as bordas

---

## Estrutura de Pastas

```
src/
├── app/
│   ├── (auth)/           # Login, Register
│   ├── (app)/            # Dashboard, Pacientes, Sessões, Documentos
│   └── api/              # Route Handlers
├── components/
│   ├── ui/               # shadcn/ui base
│   ├── patients/         # Componentes do CRM
│   ├── sessions/         # Componentes de atendimento
│   └── shared/           # Reutilizáveis
├── server/
│   └── modules/
│       ├── patients/
│       │   ├── application/   # Use Cases
│       │   ├── domain/        # Entidades e regras
│       │   ├── http/          # DTOs e validators
│       │   └── infra/         # Repository Prisma
│       ├── sessions/
│       └── documents/
└── lib/                  # Prisma client, helpers
```

---

## Documentação

```
.docs/tasks/ → .docs/CONTEXT.md → README.md
```

| Camada      | Arquivo                         | Propósito                          |
| ----------- | ------------------------------- | ---------------------------------- |
| Visão       | `.docs/vision.md`               | Problema, personas, métricas       |
| Contexto    | `.docs/CONTEXT.md`              | Estado vivo do projeto             |
| Arquitetura | `.docs/architecture/README.md`  | Camadas e princípios               |
| Domínio     | `.docs/domain/*.md`             | Regras de negócio clínicas         |
| API         | `.docs/api/*.md`                | Contratos de endpoints             |
| Dados       | `.docs/data/data-dictionary.md` | Schema e enums                     |
| Decisões    | `.docs/decisions/ADR-*.md`      | Registro de decisões arquiteturais |
| Tasks       | `.docs/tasks/phase-*.md`        | Escopo de execução por fase        |

---

## Stack & Decisões

| Tecnologia            | Por quê                                           |
| --------------------- | ------------------------------------------------- |
| Next.js 16 App Router | Full-stack com RSC, sem backend separado          |
| TypeScript            | Segurança de tipos end-to-end                     |
| Tailwind CSS v4       | Tokens OKLCH nativos, design system sólido        |
| shadcn/ui             | Componentes acessíveis, headless, personalizáveis |
| Prisma + PostgreSQL   | ORM type-safe, migrations versionadas             |
| Zod                   | Validação com inferência de tipos                 |
| Vercel + Neon         | Deploy zero-config + Postgres serverless          |

---

## Modelo de Dados (simplificado)

Atual:

```
User       → Patient (1:N)
Patient    → ClinicalRecord (1:1)
Patient    → Session (1:N)
Session    → (campos SOAP)
Patient    → Document (1:N)
```

Após o ciclo Multi-modalidade + Financeiro (phases 14–17):

```
User       → Patient (1:N)
User       → Workplace (1:N)
Patient    → TreatmentPlan (1:N)              ← multi-modalidade
TreatmentPlan → Session (1:N)
TreatmentPlan → Payment (1:N)                 ← pacote
Session    → Payment (0:1)                    ← avulso
Session    → expectedFee (snapshot)
Workplace  → Session (1:N)
```

---

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Variáveis de ambiente
cp .env.example .env
# Preencher DATABASE_URL e SESSION_SECRET

# 3. Migrations
npx prisma migrate dev

# 4. Seed demo
npx prisma db seed

# 5. Dev server
npm run dev
```

### Usuário demo

Após o seed:

- `demo@phisioflow.com`
- `demo1234`

---

## Roadmap

### ✅ Concluído

- Phase 1 — Foundation
- Phase 2 — Auth
- Phase 3 — CRM de Pacientes
- Phase 4 — Registro SOAP (sessões, agenda, formulário SOAP)
- Phase 5 — Dashboard & KPIs
- Phase 6 — Timeline de Evolução
- Phase 7 — Central de Documentos (geração PDF)
- Phase 8 — Logística Domiciliar (endereço, prioridade, agenda domiciliar)
- Phase 9 — Polimento UX e Documentos v1.1 (cards contextuais, tooltip de período,
  QuickActions revisado, loading no filtro domiciliar, botão Cancelar terracota,
  rebrand "Experiência Clínica Fluida")
- Phase 10 — Edição SOAP e Agenda em Calendário (rota `/atendimentos/[id]/editar`,
  `SessionForm` em modo create/edit, visão `/agenda?view=calendar` com calendário mensal
  e painel de sessões do dia)
- Phase 11 — E-mails com Gmail App Password (configuração SMTP por usuário com
  Senha de App criptografada, envio de documento por e-mail e aviso de atendimento)
- Phase 12 — Integração com Google Calendar (OAuth, agenda padrão e sync unidirecional
  PhysioFlow → Google Calendar)
- Phase 13 — Polimento de UI e Componentes (`ThemedSelect`, `DateTimePicker`, refatoração
  do `SessionCard` com menu flutuante, correção do sidebar mobile, remoção de emoji no dashboard)
- Phase 14 — Locais de Trabalho (modelo `Workplace`, enums `WorkplaceKind`/`AttendanceType`,
  migration com backfill, CRUD `/configuracoes/locais`, seletor de local e modalidade no
  `SessionForm`, nome do local no `SessionCard`)
- Phase 15 — Plano de Tratamento (modelo `TreatmentPlan`, multi-modalidade por paciente,
  remoção de `Patient.area` e `Session.type`, CRUD/status de planos, seed multi-modalidade
  e seletor de plano/avulso no `SessionForm`)
- Phase 16 — Pagamentos (modelo `Payment` com vínculo XOR sessão/plano, snapshot
  `Session.expectedFee`, cache `paymentStatus`, CRUD REST de pagamentos, saldo do plano,
  saldo do paciente, badges/modal e seção financeira na ficha)

### 🗺️ Planejado — Ciclo "Multi-modalidade + Financeiro"

> Decisão arquitetural: [ADR-005](.docs/decisions/ADR-005-multi-modalidade-financeiro.md)

- **Phase 17 — Dashboard Financeiro** (recebido vs previsto, série temporal,
  breakdowns por local/área, lista de pendências)

### ➡️ Próximo Passo

Iniciar **Phase 17**: dashboard financeiro consumindo `Payment` e `Session.expectedFee`
com agregações por período, local e área.

Ainda pendente do ciclo anterior: configurar as variáveis de e-mail/Google na Vercel e
validar os fluxos reais de envio e sincronização.
