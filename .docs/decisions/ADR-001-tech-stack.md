# ADR-001: Tech Stack

## Status
Aceito

## Contexto
PhysioFlow é um SaaS clínico fullstack que precisa de:
- Desenvolvimento rápido (solo dev)
- Type safety end-to-end
- Deploy simples e barato
- UI customizável para o design editorial definido (Sálvia + Terracota, Fraunces)

## Decisão

- **Next.js 15 App Router**: Full-stack sem backend separado. RSC para performance. Route Handlers como API.
- **TypeScript**: Segurança de tipos em todas as camadas.
- **Tailwind CSS v4**: Tokens OKLCH nativos, dark mode, design system sólido.
- **shadcn/ui**: Componentes headless acessíveis, fáceis de customizar com os tokens do PhysioFlow.
- **Prisma + PostgreSQL**: ORM type-safe, migrations versionadas, excelente DX.
- **Zod**: Validação com inferência de tipos, funciona em cliente e servidor.
- **Vercel + Neon**: Deploy zero-config + Postgres serverless no free tier.

## Consequências

**Positivo:**
- Stack coerente, sem context switching
- Type safety do banco até o componente
- Deploy automático a cada push em main

**Negativo:**
- Acoplamento ao ecossistema Vercel/Next.js
- Neon free tier tem limitações de conexões simultâneas
