# Instruções para Claude Code — PhysioFlow

`AGENTS.md` é a fonte de verdade unificada deste projeto. Leia-o primeiro e não replique suas regras aqui.

Leia nesta ordem:

1. `AGENTS.md`
2. `.agents/context/CONTEXT.md`
3. task ativa em `.agents/tasks/active/`, se houver
4. papel especializado relevante em `.claude/agents/`
5. documentação primária em `.docs/` e documentação arquitetural complementar em `docs/`

Papéis especializados:

- `frontend-ui` — UI, acessibilidade, responsividade e design system
- `clinical-domain` — pacientes, sessões SOAP e planos de tratamento
- `financial-data` — dados, migrations, pagamentos e financeiro
- `auth-security` — autenticação, sessões, autorização e segurança de tenant
- `integrations` — Google Calendar, Gmail SMTP, PDFs e efeitos externos

Regras globais: `.claude/rules/global.md`

Estado, tasks, decisões, handoffs e teste de sanidade ficam em `.agents/`. Este arquivo é apenas o adaptador do Claude Code; registre continuidade no hub versionado.
