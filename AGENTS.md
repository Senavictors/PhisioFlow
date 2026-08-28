# Guia de Agentes — PhysioFlow

Este é o roteador unificado do projeto. As instruções específicas de cada ferramenta apontam para este arquivo; não duplique regras em `CLAUDE.md` ou nos adaptadores.

## Projeto

PhysioFlow é um SaaS de gestão clínica para fisioterapeutas. É um monólito fullstack em Next.js 16.2.4 com App Router e TypeScript: a UI, os Route Handlers e os módulos de aplicação/domínio/infra vivem no mesmo repositório e o PostgreSQL é hospedado no Neon.

## Fontes de verdade

- Contexto vivo: `.agents/context/CONTEXT.md`
- Estado de trabalho: `.agents/tasks/` e `.agents/handoffs/`
- Decisões arquiteturais dos agentes: `.agents/decisions/` (índice em `.agents/decisions/README.md`)
- Constituição e teste de sanidade: `.agents/test-onboarding.md`
- Documentação arquitetural complementar: `docs/`
- Documentação de produto existente e fonte primária funcional: `.docs/`

## Leitura obrigatória antes de alterar código

1. Leia `.agents/context/CONTEXT.md`.
2. Identifique uma task em `.agents/tasks/active/`, se houver.
3. Leia o papel especializado relevante em `.claude/agents/`.
4. Releia a seção Constituição de `.agents/test-onboarding.md`.
5. Consulte a documentação primária correspondente em `.docs/` antes de mudar comportamento clínico, API ou dados.

## Ciclo de vida de uma task

`bootstrap-plan` registra a proposta em `.agents/tasks/backlog/`; a execução move o arquivo para `active/`; `bootstrap-handoff` registra pausas; `bootstrap-complete` verifica evidências, atualiza documentação e move a task para `completed/`.

## Mapa do repositório

- `src/app/` — páginas App Router, layouts e Route Handlers em `src/app/api/`.
- `src/components/` — componentes de UI por domínio e componentes base em `src/components/ui/`.
- `src/server/modules/` — módulos `auth`, `patients`, `sessions`, `treatment-plans`, `payments`, `finance`, `documents`, `calendar`, `email` e `workplaces`, organizados em `application/`, `domain/`, `http/` e `infra/` quando aplicável.
- `src/lib/` — Prisma, sessão, criptografia, datas, erros e renderização server-side de PDFs.
- `src/proxy.ts` — proteção de rotas via sessão HTTP-only.
- `prisma/` — schema, seed e migrations versionadas.
- `physioflow-design-system/project/` — tokens, assets e previews do design system.
- `.docs/` — documentação de produto, domínio, API, ADRs e fases já existente.
- `docs/` — documentação arquitetural complementar criada pelo bootstrap.
- `.agents/` — estado versionado das tasks, decisões, handoffs e onboarding dos agentes.

## Papéis especializados (agentes)

- `.claude/agents/frontend-ui.md` — páginas, componentes, acessibilidade, responsividade e design system.
- `.claude/agents/clinical-domain.md` — pacientes, sessões SOAP e planos de tratamento.
- `.claude/agents/financial-data.md` — Prisma, migrations, pagamentos e agregações financeiras; veto operacional sobre banco.
- `.claude/agents/auth-security.md` — autenticação, sessões, autorização, isolamento por usuário e segredos.
- `.claude/agents/integrations.md` — Google Calendar, Gmail SMTP, documentos PDF e efeitos externos.

## Regras globais

- Route Handlers são adaptadores HTTP finos; lógica clínica e financeira fica em use cases e regras de domínio.
- Toda query clínica/financeira filtra por `userId` derivado da sessão autenticada; nunca aceite o tenant de um parâmetro do cliente.
- Todo input de API e formulário deve ser validado com Zod na borda apropriada.
- O schema só muda com uma nova migration em `prisma/migrations/`; migration aplicada nunca é editada.
- Não altere contratos públicos, regras clínicas ou decisões arquiteturais silenciosamente; registre a mudança em `.agents/decisions/` quando houver impacto.
- Preserve o tema Sálvia + Terracota e o design system existente; roxo não faz parte da linguagem visual.
- Não execute `migrate deploy`, seed contra o Neon, exclusões amplas, deploy ou efeitos externos reais sem confirmação humana explícita.
- Preserve alterações não relacionadas no working tree.

## Comandos reais

```bash
npm run build
npm run test
npm run lint
npm run format:check
npx prisma generate
```

Operações de banco disponíveis, com confirmação e ambiente corretos: `npx prisma migrate deploy` aplica migrations no Neon; `npx prisma db seed` executa o seed configurado em `prisma.config.ts`. Não usar `prisma migrate dev` contra o banco hospedado.

## Critérios de conclusão

- Código e documentação primária/complementar refletem o comportamento implementado.
- Build, testes, lint e/ou format check foram executados conforme a área alterada.
- Isolamento por `userId`, validação de entrada e efeitos externos foram revisados.
- Riscos, limitações de ambiente e validações não executadas estão declarados.
- Task, decisão ou handoff foi atualizado quando aplicável.

## Auditoria

Antes de concluir um bootstrap ou publicar uma alteração, rode `bootstrap-audit` para verificar estrutura, consistência entre adaptadores, índice de decisões e guardrails.
