# Task: Phase 1 — Foundation

## Status
- [ ] Todo
- [ ] In Progress
- [ ] Done

## Contexto
Primeira fase do projeto. Nenhum código existe ainda.
Precisamos de uma base sólida antes de implementar features.

ADR relacionado: [ADR-001](../decisions/ADR-001-tech-stack.md)

## Objetivo
Repositório funcional com dev server rodando, design system configurado e layout base com sidebar.

## Escopo
- [ ] Inicializar Next.js 15 com TypeScript e App Router (`npx create-next-app@latest`)
- [ ] Configurar Tailwind CSS v4 com tokens OKLCH (Sálvia + Terracota)
- [ ] Instalar e configurar shadcn/ui
- [ ] Configurar fontes: Fraunces (display) + Plus Jakarta Sans (sans) via next/font
- [ ] Criar variáveis CSS para o design system em `globals.css`
- [ ] Layout base: sidebar de navegação + área de conteúdo (`(app)/layout.tsx`)
- [ ] Estrutura de pastas conforme arquitetura definida
- [ ] Configurar ESLint + Prettier
- [ ] Configurar Prisma + `.env.example`
- [ ] Schema Prisma inicial com modelo `User`

## Fora de Escopo
- Auth (Phase 2)
- Qualquer feature clínica
- Deploy (pode ser feito após Phase 2)

## Tokens de Design

```css
/* globals.css — Tailwind v4 */
@theme {
  --color-background: oklch(0.985 0.008 85);   /* Off-white quente */
  --color-primary: oklch(0.52 0.05 160);        /* Verde Sálvia */
  --color-accent: oklch(0.72 0.09 45);          /* Terracota suave */

  --font-display: 'Fraunces', serif;
  --font-sans: 'Plus Jakarta Sans', sans-serif;
}
```

## Estrutura de Pastas Esperada

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx        ← sidebar aqui
│   │   ├── dashboard/page.tsx
│   │   ├── patients/page.tsx
│   │   ├── sessions/page.tsx
│   │   └── documents/page.tsx
│   ├── api/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                   ← shadcn
│   └── shared/
├── server/
│   └── modules/
└── lib/
    └── prisma.ts
```

## Schema Prisma Inicial

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Checklist Final
- [ ] `npm run dev` roda sem erros em localhost:3000
- [ ] `npm run build` passa sem erros
- [ ] `npm run lint` sem warnings
- [ ] Design tokens aplicados e visíveis no browser
- [ ] Sidebar renderiza com links: Dashboard, Pacientes, Sessões, Documentos
- [ ] `.docs/CONTEXT.md` atualizado (Phase 1 concluída)
- [ ] `README.md` atualizado (Phase 1 marcada como ✅)
- [ ] `CHANGELOG.md` atualizado

## Notas para Próxima Sessão
Ao concluir, a Phase 2 (Auth) pode começar. O dev server deve estar em localhost:3000 com layout base visível. O `lib/prisma.ts` deve exportar o PrismaClient singleton.
