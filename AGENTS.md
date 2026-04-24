# PhysioFlow

SaaS de gestão clínica para fisioterapeutas — fullstack Next.js.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (Radix)
- **Database**: PostgreSQL (Neon) + Prisma
- **Validação**: Zod
- **Auth**: Custom server-side sessions (Phase 2)

## Commands

```bash
npm run dev          # Dev server (localhost:3000)
npm run build        # Build de produção
npm run lint         # ESLint
npm run format       # Prettier (write)
npm run format:check # Prettier (check only)
npx prisma studio    # GUI do banco
npx prisma migrate dev --name <name>  # Nova migration
npx prisma generate  # Regenera client
Architecture
UI → Route Handlers (API) → Use Cases → Domain → Repositories → DB
Route Handlers (app/api/**/route.ts) são adaptadores HTTP finos
Lógica de negócio em src/server/modules/**/application/
Regras de domínio em src/server/modules/**/domain/
Repos Prisma em src/server/modules/**/infra/
DTOs/validators em src/server/modules/**/http/
Conventions
Commits: Conventional Commits em PT-BR (feat:, fix:, chore:, docs:, refactor:, test:)
Multi-tenant: Toda tabela financeira/clínica tem userId. Toda query filtra por userId
Tema: Sálvia + Terracota. SEM roxo. Dark mode via classe .dark
Validação: Zod em todos os inputs de API e formulários
Documentação: Atualizar .docs/CONTEXT.md após toda task, e README.md sempre que uma task for criada ou concluída
Git Identity
user.name: Senavictors
user.email: victorsena760@gmail.com
Documentation
README.md — Roadmap público, próximo passo e fases concluídas
.docs/CONTEXT.md — Estado vivo do projeto (ler antes de qualquer task)
.docs/vision.md — Visão e objetivos do produto
.docs/architecture/README.md — Overview da arquitetura
.docs/domain/ — Documentação de domínio
.docs/api/ — Documentação de API
.docs/data/ — Dicionário de dados
.docs/decisions/ — ADRs (Architecture Decision Records)
.docs/tasks/ — Arquivos de task por fase
.docs/CHANGELOG.md — Changelog curado
---