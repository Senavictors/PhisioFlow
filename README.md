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

```
User       → Patient (1:N)
Patient    → ClinicalRecord (1:1)
Patient    → Session (1:N)
Session    → (campos SOAP)
Patient    → Document (1:N)
Patient    → Attachment (1:N)
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

### 🗺️ Planejado

- Phase 12 — Integração com Google Calendar

### ➡️ Próximo Passo

Executar **Phase 12 — Integração com Google Calendar**.

Task restante em `.docs/tasks/phase-12-google-calendar.md`.
