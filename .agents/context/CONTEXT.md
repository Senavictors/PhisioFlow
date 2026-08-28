# Contexto Atual do Projeto — PhysioFlow

Última atualização: 2026-08-27

## Estado atual

PhysioFlow é um SaaS clínico fullstack para fisioterapeutas, em branch `main` alinhada a `origin/main` no momento da inicialização. O código atual usa Next.js 16.2.4, React 19, TypeScript, Tailwind CSS v4, Prisma 7 com adapter PostgreSQL e Vitest. A Phase 17 — dashboard financeiro — está concluída; as phases 1–17 cobrem autenticação, CRM de pacientes, SOAP, agenda, documentos, logística domiciliar, integrações, planos, pagamentos e financeiro. O banco é PostgreSQL hospedado no Neon. A documentação funcional existente em `.docs/` continua sendo a fonte primária; `docs/` documenta a arquitetura complementar criada neste bootstrap.

## Iniciativas ativas

- **Bootstrap da arquitetura de agentes** (branch `main`): criação do hub versionado `.agents/`, dos adaptadores Claude Code/Codex e da documentação arquitetural complementar. Esta iniciativa é a task corrente de preparação do projeto.

## Arquitetura vigente

`src/app/` contém páginas e Route Handlers; estes chamam use cases em `src/server/modules/**/application/`, que usam domínio e repositórios Prisma em `infra/`. A UI reutiliza `src/components/` e o design system em `physioflow-design-system/project/`. A visão estrutural está em [`docs/architecture/`](../../docs/architecture/README.md), e as regras operacionais estão nos papéis em `.claude/agents/`.

## Restrições importantes

- O tenant deve vir da sessão autenticada e toda query clínica/financeira deve filtrar por `userId`.
- Inputs de API e formulários devem ser validados com Zod.
- Migrations aplicadas não são editadas; mudanças de schema criam nova migration em `prisma/migrations/`.
- `migrate deploy`, seed contra o Neon, deploy e efeitos externos reais exigem confirmação humana explícita.
- O design usa Sálvia + Terracota e não usa roxo.
- Tokens OAuth e senhas de app são armazenados criptografados e nunca devem aparecer em logs.

## Dívida técnica conhecida

- Integrações da Phase 11/12 ainda precisam de validação com conta real e configuração dos envs no ambiente de hospedagem.
- Migrations e seed ainda precisam ser executados contra a base Neon real para evidência end-to-end; não executar isso automaticamente durante tarefas comuns.
- Validação visual autenticada das principais telas continua pendente conforme registrado em `.docs/CONTEXT.md`.

## Decisões recentes

- `.docs/decisions/ADR-001-tech-stack.md` — stack.
- `.docs/decisions/ADR-002-soap-notes.md` — estrutura SOAP.
- `.docs/decisions/ADR-003-auth-approach.md` — autenticação.
- `.docs/decisions/ADR-004-integracoes-externas.md` — e-mail e Google Calendar.
- `.docs/decisions/ADR-005-multi-modalidade-financeiro.md` — planos, modalidades e financeiro.

## Riscos atuais

- **Dados clínicos e financeiros**: impacto alto se houver falha de isolamento por `userId`; mitigar revisando repos e testes do módulo afetado.
- **Banco hospedado**: impacto alto em operações destrutivas ou migrations; mitigar com revisão do papel `financial-data` e confirmação humana.
- **Integrações externas**: falhas de OAuth/SMTP podem deixar sincronização ou envio incompleto; mitigar com tratamento tolerante a falhas e validação em conta controlada.

## Não fazer agora

- Não alterar regras de produto das phases 1–17 durante a criação dos agentes.
- Não migrar, substituir ou apagar a documentação existente em `.docs/`.
- Não criar extensões opcionais de `docs/` para UI, segurança ou qualidade sem confirmação posterior do usuário.
