# PhysioFlow — Arquitetura

## Visão Geral

```
┌─────────────────────────────────────┐
│           UI (React / RSC)          │
└──────────────────┬──────────────────┘
                   │ HTTP
┌──────────────────▼──────────────────┐
│    Route Handlers  (app/api/**)     │  ← Adaptadores HTTP finos
└──────────────────┬──────────────────┘
                   │ Chama
┌──────────────────▼──────────────────┐
│         Use Cases (Application)     │  ← Toda lógica clínica aqui
└──────────────────┬──────────────────┘
                   │ Usa
┌──────────────────▼──────────────────┐
│         Domain (Entities/Rules)     │  ← Regras puras de negócio
└──────────────────┬──────────────────┘
                   │ Persiste via
┌──────────────────▼──────────────────┐
│     Repositories (Prisma / Infra)   │  ← Acesso ao banco
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│         PostgreSQL (Neon)           │
└─────────────────────────────────────┘
```

## Princípios Chave

1. **Route Handlers como adaptadores** — Apenas parseiam request, chamam Use Case, retornam response. Sem lógica.
2. **Use Cases como orquestradores** — Toda regra clínica vive aqui. Testáveis de forma isolada.
3. **Repository Pattern** — Implementações Prisma ficam em `/infra`. Use Cases dependem de interfaces.
4. **Multi-tenant** — Todo modelo clínico tem `userId`. Toda query filtra por `userId`.
5. **Validação nas bordas** — Zod valida input no Route Handler. Nunca confiar em dados sem validar.

## Estrutura de Módulos

```
src/server/modules/
├── patients/
│   ├── application/
│   │   ├── create-patient.ts
│   │   ├── list-patients.ts
│   │   └── get-patient.ts
│   ├── domain/
│   │   ├── patient.entity.ts
│   │   └── patient.rules.ts
│   ├── http/
│   │   └── patient.dto.ts
│   └── infra/
│       └── patient.repository.ts
├── sessions/
└── documents/
```

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 App Router |
| Linguagem | TypeScript 5 |
| Estilização | Tailwind CSS v4 + shadcn/ui |
| ORM | Prisma |
| Banco | PostgreSQL via Neon |
| Validação | Zod |
| Deploy | Vercel |

## Camadas de Documentação

- `.docs/vision.md` — Problema e personas
- `.docs/architecture/` — Diagramas e fluxos
- `.docs/domain/` — Regras de negócio por entidade
- `.docs/api/` — Contratos de endpoints
- `.docs/data/` — Schema e dicionário de dados
- `.docs/decisions/` — ADRs
- `.docs/tasks/` — Tasks de execução por fase
