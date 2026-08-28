---
name: global
description: Regras globais do PhysioFlow para qualquer subagente ou alteração no repositório.
---

## Propósito

Manter consistência arquitetural, isolamento entre usuários e rastreabilidade das mudanças num SaaS clínico fullstack que é executado como um único aplicativo Next.js.

## Escopo

Todo o repositório: `src/`, `prisma/`, `physioflow-design-system/`, `.docs/`, `docs/` e `.agents/`.

## Práticas exigidas

- Route Handlers em `src/app/api/**/route.ts` devem permanecer adaptadores finos.
- Use cases ficam em `src/server/modules/**/application/`; regras puras ficam em `domain/`; acesso Prisma fica em `infra/`.
- Toda query clínica/financeira deve filtrar por `userId` da sessão autenticada.
- Zod valida inputs de API e formulário.
- Alterações de schema geram nova migration em `prisma/migrations/`; migrations existentes não são editadas.
- A UI segue o design system em `physioflow-design-system/project/` e o tema Sálvia + Terracota, sem roxo.
- Contratos públicos e decisões relevantes são registrados em `.agents/decisions/` e refletidos em `.docs/` ou `docs/`.

## Práticas proibidas

- Frontend acessar Prisma ou banco diretamente.
- Receber `userId`/tenant confiável pelo body, query string ou path quando ele deve vir da sessão.
- Logar segredos, tokens OAuth, senhas de app ou dados clínicos desnecessários.
- Editar migration aplicada ou usar `migrate dev` contra o Neon.
- Executar `migrate deploy`, seed real, deploy ou efeitos externos reais sem confirmação explícita.

## Documentos necessários antes de alterar código

- `.agents/context/CONTEXT.md`
- Papel relevante em `.claude/agents/`
- Task ativa em `.agents/tasks/active/`, se houver
- `.docs/` para contratos e decisões existentes

## Comandos de validação

```bash
npm run build
npm run test
npm run lint
npm run format:check
```

## Condições de atualização

Revisar quando uma nova camada, integração, regra de tenant, padrão de UI ou ADR aceito mudar as práticas acima.
