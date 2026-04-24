# Task: Phase 1 — Foundation

## Status
- [x] Todo
- [x] In Progress
- [x] Done

## Contexto
Ponto de partida absoluto. Nenhum código existe ainda.
O design system já está documentado em `physioflow-design-system/project/` — todos os tokens,
componentes e telas de referência estão disponíveis ali. A implementação deve seguir exatamente
aquele design.

ADR relacionado: [ADR-001](../decisions/ADR-001-tech-stack.md)

## Objetivo
Repositório Next.js 15 funcional com dev server rodando, design tokens aplicados, fontes carregadas,
layout base com sidebar e área de conteúdo, e Prisma configurado. Nenhuma feature clínica.

## Escopo
- [ ] Inicializar projeto: `npx create-next-app@latest physioflow --typescript --tailwind --app --src-dir --import-alias "@/*"`
- [ ] Configurar Tailwind v4 com o `@theme` completo do design system (ver abaixo)
- [ ] Configurar fontes via `next/font/google` (Fraunces + Plus Jakarta Sans)
- [ ] Instalar e inicializar shadcn/ui: `npx shadcn@latest init`
- [ ] Instalar Lucide React: `npm install lucide-react`
- [ ] Instalar e configurar Vitest: `npm install -D vitest @vitest/coverage-v8` (ver config abaixo)
- [ ] Criar layout base `(app)/layout.tsx` com sidebar + topbar + área de conteúdo
- [ ] Criar componente `Sidebar` fiel ao design system (ver referência abaixo)
- [ ] Criar componente `Topbar` fiel ao design system
- [ ] Páginas stub: `/dashboard`, `/pacientes`, `/atendimentos`, `/agenda`, `/documentos`
- [ ] Páginas stub auth: `/login`, `/register` (visuais apenas, sem lógica)
- [ ] Configurar ESLint + Prettier
- [ ] Instalar Prisma: `npm install prisma @prisma/client` + `npx prisma init`
- [ ] Schema Prisma inicial com modelo `User`
- [ ] Criar `src/lib/prisma.ts` (singleton)
- [ ] Criar `.env.example` com `DATABASE_URL` e `SESSION_SECRET`
- [ ] Estrutura de pastas conforme arquitetura (ver abaixo)

## Fora de Escopo
- Lógica de auth (Phase 2)
- Qualquer feature clínica (Phase 3+)
- Deploy em produção

---

## Referência de Design
Design system completo em: `physioflow-design-system/project/`
- Tokens: `colors_and_type.css`
- Componentes: `ui_kits/portal/kit.css`
- Telas: `ui_kits/portal/index.html` (abrir no browser para referência visual)
- Sidebar + Topbar: `ui_kits/portal/Chrome.jsx`

---

## `src/app/globals.css` — Bloco `@theme` Completo

```css
@import "tailwindcss";

@theme {
  /* Paleta principal */
  --color-background:             oklch(0.985 0.008 85);
  --color-foreground:             oklch(0.27 0.02 160);
  --color-primary:                oklch(0.52 0.05 160);
  --color-primary-hover:          oklch(0.46 0.05 160);
  --color-primary-foreground:     oklch(0.985 0.008 85);
  --color-accent:                 oklch(0.72 0.09 45);
  --color-accent-hover:           oklch(0.66 0.1 45);
  --color-accent-foreground:      oklch(0.99 0.005 85);
  --color-card:                   oklch(1 0 0);
  --color-card-foreground:        oklch(0.27 0.02 160);
  --color-border:                 oklch(0.9 0.012 85);
  --color-input:                  oklch(0.94 0.01 85);
  --color-muted:                  oklch(0.95 0.01 85);
  --color-muted-foreground:       oklch(0.5 0.015 160);
  --color-ring:                   oklch(0.52 0.05 160 / 0.35);

  /* Superfícies tintadas */
  --color-primary-soft:           oklch(0.92 0.028 160);
  --color-primary-soft-fg:        oklch(0.42 0.05 160);
  --color-accent-soft:            oklch(0.93 0.035 45);
  --color-accent-soft-fg:         oklch(0.55 0.09 45);

  /* Semânticos */
  --color-success:                oklch(0.62 0.09 160);
  --color-success-soft:           oklch(0.93 0.03 160);
  --color-warning:                oklch(0.72 0.09 45);
  --color-warning-soft:           oklch(0.94 0.035 45);
  --color-danger:                 oklch(0.58 0.16 25);
  --color-danger-soft:            oklch(0.94 0.04 25);

  /* Compatibilidade shadcn/ui */
  --color-secondary:              oklch(0.92 0.015 160);
  --color-secondary-foreground:   oklch(0.27 0.02 160);
  --color-popover:                oklch(1 0 0);
  --color-popover-foreground:     oklch(0.27 0.02 160);
  --color-destructive:            oklch(0.58 0.16 25);
  --color-destructive-foreground: oklch(0.99 0.005 85);

  /* Tipografia — variáveis injetadas via next/font em layout.tsx */
  --font-display: var(--font-fraunces), ui-serif, Georgia, serif;
  --font-body:    var(--font-jakarta), ui-sans-serif, system-ui, sans-serif;
  --font-mono:    ui-monospace, 'SF Mono', 'JetBrains Mono', monospace;

  /* Escala tipográfica */
  --text-label: 10.5px;
  --text-kpi:   68px;

  /* Raios */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   18px;
  --radius-xl:   24px;
  --radius-full: 9999px;
  --radius:      12px;

  /* Sombras */
  --shadow-xs:          0 1px 1px oklch(0 0 0 / 0.03);
  --shadow-sm:          0 1px 2px oklch(0 0 0 / 0.03), 0 1px 3px oklch(0 0 0 / 0.04);
  --shadow-md:          0 4px 10px -4px oklch(0 0 0 / 0.06), 0 2px 4px oklch(0 0 0 / 0.04);
  --shadow-lg:          0 12px 28px -12px oklch(0 0 0 / 0.10);
  --shadow-glow:        0 10px 24px -10px oklch(0.52 0.05 160 / 0.45), 0 2px 6px oklch(0.52 0.05 160 / 0.15);
  --shadow-accent-glow: 0 10px 24px -10px oklch(0.72 0.09 45 / 0.45);

  /* Motion */
  --ease-out:      cubic-bezier(0.2, 0.7, 0.2, 1);
  --duration-fast: 120ms;
  --duration:      180ms;
  --duration-slow: 280ms;
}

@layer base {
  html, body {
    background-color: theme(--color-background);
    color: theme(--color-foreground);
    -webkit-font-smoothing: antialiased;
    font-feature-settings: 'ss01', 'cv11';
  }

  .dark {
    --color-background:             oklch(0.14 0.012 160);
    --color-foreground:             oklch(0.93 0.01 85);
    --color-primary:                oklch(0.62 0.05 160);
    --color-primary-hover:          oklch(0.68 0.05 160);
    --color-primary-foreground:     oklch(0.14 0.012 160);
    --color-card:                   oklch(0.18 0.012 160);
    --color-card-foreground:        oklch(0.93 0.01 85);
    --color-border:                 oklch(0.25 0.01 160);
    --color-input:                  oklch(0.22 0.01 160);
    --color-muted:                  oklch(0.22 0.01 160);
    --color-muted-foreground:       oklch(0.62 0.015 160);
    --color-ring:                   oklch(0.62 0.05 160 / 0.4);
    --color-primary-soft:           oklch(0.22 0.025 160);
    --color-primary-soft-fg:        oklch(0.72 0.04 160);
    --color-accent-soft:            oklch(0.22 0.025 45);
    --color-accent-soft-fg:         oklch(0.78 0.08 45);
    --color-success:                oklch(0.68 0.09 160);
    --color-success-soft:           oklch(0.22 0.025 160);
    --color-danger:                 oklch(0.65 0.16 25);
    --color-danger-soft:            oklch(0.22 0.025 25);
    --color-secondary:              oklch(0.22 0.015 160);
    --color-secondary-foreground:   oklch(0.93 0.01 85);
    --color-popover:                oklch(0.18 0.012 160);
    --color-popover-foreground:     oklch(0.93 0.01 85);
    --color-destructive:            oklch(0.65 0.16 25);
    --color-destructive-foreground: oklch(0.99 0.005 85);
  }
}
```

---

## `src/app/layout.tsx` — Configuração de Fontes

```typescript
import type { Metadata } from 'next'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-fraunces',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PhisioFlow',
  description: 'O ecossistema completo para o fisioterapeuta moderno.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fraunces.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

---

## Spec do Componente Sidebar

Referência visual: `physioflow-design-system/project/ui_kits/portal/Chrome.jsx`

```
Layout: grid 220px | 1fr
Sidebar:
  - background: bg-background
  - border-right: border-r border-border
  - position: sticky, top-0, h-screen
  - padding: p-4 pt-[22px]

Logo (topo):
  - Badge sálvia 38×38px, rounded-[11px], bg-primary
  - Ícone heartbeat branco 22px (Lucide: Activity)
  - "PhisioFlow" font-display text-lg font-bold tracking-tight
  - "PORTAL RESTAURATIVO" text-[8.5px] uppercase tracking-[0.22em] text-muted-foreground

Nav items (sb-item):
  - display: flex, items-center, gap-3
  - padding: py-[11px] px-[14px], rounded-xl
  - font-body, text-[10.5px], font-bold, uppercase, tracking-[0.16em]
  - idle: text-muted-foreground
  - hover: bg-muted text-foreground
  - active: bg-primary text-white shadow-glow

Ícones nav: 18×18px, stroke-width 1.75, currentColor

Links de navegação:
  Dashboard    → /dashboard     ícone: LayoutDashboard
  Pacientes    → /pacientes     ícone: Users
  Atendimentos → /atendimentos  ícone: ClipboardList
  Agenda       → /agenda        ícone: Calendar
  Documentos   → /documentos    ícone: FileText

Footer (após flex-1 spacer):
  Configurações → /configuracoes  ícone: Settings
  Suporte       → /suporte        ícone: HelpCircle
```

---

## Estrutura de Pastas Esperada

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx          ← Sidebar + Topbar aqui
│   │   ├── dashboard/page.tsx
│   │   ├── pacientes/page.tsx
│   │   ├── atendimentos/page.tsx
│   │   ├── agenda/page.tsx
│   │   └── documentos/page.tsx
│   ├── api/
│   ├── globals.css
│   └── layout.tsx              ← Fontes + metadata
├── components/
│   ├── ui/                     ← shadcn/ui gerado
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   └── shared/
├── server/
│   └── modules/
└── lib/
    └── prisma.ts
```

---

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

---

## Configuração de Testes — Vitest

### Estratégia

| Camada | Testar | Ferramenta |
|---|---|---|
| Use Cases (`application/`) | **Sempre** — regra clínica não pode quebrar silenciosamente | Vitest |
| Domain entities/rules | **Sempre** — regras puras, alto retorno | Vitest |
| Route Handlers | Não — adaptadores finos sem lógica | — |
| Repositories (Prisma) | Não — confiar no Prisma + migrations | — |
| Componentes UI | Não por enquanto — custo alto, valor baixo em early-stage | — |

Cada Use Case tem um `*.test.ts` ao lado:
```
src/server/modules/patients/application/
  create-patient.ts
  create-patient.test.ts
```

### `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/server/modules/**/application/**', 'src/server/modules/**/domain/**'],
      exclude: ['**/*.test.ts'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

### Scripts em `package.json`

```json
"scripts": {
  "test":          "vitest run",
  "test:watch":    "vitest",
  "test:coverage": "vitest run --coverage"
}
```

### Exemplo de teste (referência para as phases seguintes)

```typescript
// src/server/modules/patients/application/create-patient.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPatient } from './create-patient'

const mockRepo = {
  create: vi.fn(),
  findByUserId: vi.fn(),
}

beforeEach(() => vi.clearAllMocks())

describe('createPatient', () => {
  it('cria paciente com dados válidos', async () => {
    mockRepo.create.mockResolvedValue({ id: 'p1', name: 'Gervasio' })

    const result = await createPatient(
      { name: 'Gervasio', area: 'PILATES', classification: 'STANDARD', userId: 'u1' },
      mockRepo
    )

    expect(mockRepo.create).toHaveBeenCalledOnce()
    expect(result.name).toBe('Gervasio')
  })
})
```

---

## `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## Checklist de Testes
- [ ] `npm test` roda sem erros (0 testes por enquanto — só verificar que o runner funciona)
- [ ] `vitest.config.ts` criado com alias `@/*` correto

## Checklist Final
- [ ] `npm run dev` roda sem erros em localhost:3000
- [ ] `npm run build` passa sem erros
- [ ] `npm run lint` sem warnings
- [ ] Sidebar renderiza com logo, links e footer (conferir visualmente com o design system)
- [ ] Fonte Fraunces aplicada nos títulos (verificar no DevTools → Computed)
- [ ] Fonte Plus Jakarta Sans aplicada no corpo
- [ ] bg-background é o bege quente (não branco puro)
- [ ] Card activo da sidebar tem bg-primary + shadow-glow
- [ ] `.docs/CONTEXT.md` atualizado (Phase 1 concluída)
- [ ] `README.md` atualizado (Phase 1 marcada como ✅)
- [ ] `.docs/CHANGELOG.md` atualizado

## Notas para Próxima Sessão
Ao concluir, o dev server roda em localhost:3000 com layout base visível e fiel ao design system.
A Phase 2 (Auth) começa com toda infraestrutura de UI pronta — apenas conectar lógica de sessão.
Referência para qualquer dúvida de UI: `physioflow-design-system/project/ui_kits/portal/index.html`.
