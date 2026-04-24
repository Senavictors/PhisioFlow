# PhysioFlow — Contexto Atual

> Estado vivo do projeto. Ler antes de iniciar qualquer task. Atualizar ao concluir qualquer task.

## Fase Atual
**Phase 2 — Auth concluída**
Login, registro e sessões server-side implementados. Rotas `(app)/*` protegidas via `src/proxy.ts`.

## Próximo Passo Planejado
**Phase 3 — CRM de Pacientes** — ver task em `.docs/tasks/phase-3-patient-crm.md`

## O Que Existe

### Infraestrutura
- Next.js 16 + TypeScript + Tailwind v4 (design tokens OKLCH completos)
- Fontes Fraunces + Plus Jakarta Sans via next/font
- shadcn/ui + lucide-react + Vitest configurados
- Prisma 7 com adapter `@prisma/adapter-pg` (engine nova)
  - Cliente gerado em `src/generated/prisma/`
  - Configuração de conexão em `prisma.config.ts`
- ESLint + Prettier configurados
- Design system completo em `physioflow-design-system/project/`

### Features implementadas
- **Auth completa**: register, login, logout
  - Sessões HTTP-only via iron-session
  - Proteção de rotas via `src/proxy.ts` (Next.js 16)
  - Hash de senha com bcryptjs
  - Validação Zod nos endpoints
- **Layout base**: Sidebar fiel ao design system, Topbar com nome do usuário e logout
- **Páginas stub**: dashboard, pacientes, atendimentos, agenda, documentos, login, register

### Notas técnicas importantes
- **Prisma 7** usa engine `prisma-client` (novo) + adapter PG — não usa `prisma-client-js`
- **Middleware** renomeado para `proxy` (Next.js 16 convention): `src/proxy.ts`
- **Cliente Prisma** importado de `@/generated/prisma/client` (não de `@prisma/client`)
- Modelo `User` criado. Migrations pendentes até ter DATABASE_URL real (Neon)

## Modelos de Banco
- `User` — id, email, name, password, createdAt, updatedAt

## Realidade Arquitetural Atual
```
UI → Route Handlers (API) → Use Cases → Domain → Repositories (Prisma) → DB
```
Módulo `auth` completo com camadas: application, domain, http, infra

## Decisões Chave
- [ADR-001](decisions/ADR-001-tech-stack.md) — Tech Stack
- [ADR-002](decisions/ADR-002-soap-notes.md) — Estrutura SOAP
- [ADR-003](decisions/ADR-003-auth-approach.md) — Estratégia de Auth
