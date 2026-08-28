# Teste de Sanidade — PhysioFlow

Este arquivo tem duas seções com propósitos diferentes. Não misture o conteúdo delas — um `bootstrap-audit` futuro precisa poder checar as duas separadamente.

## Constituição do projeto

Nenhuma restrição adicional foi declarada pelo usuário nesta inicialização. As regras técnicas já confirmadas do projeto estão em `AGENTS.md`, `.claude/rules/global.md`, `.docs/CONTEXT.md` e nos ADRs existentes; uma nova restrição inegociável só deve ser adicionada aqui após declaração explícita do usuário.

## Perguntas de sanidade

1. Qual é a direção permitida entre `src/app/api/`, `application/`, `domain/` e `infra/`, e por que um Route Handler não deve acessar Prisma diretamente?
2. De onde vem o `userId` confiável e qual filtro toda query clínica ou financeira precisa carregar?
3. Qual papel deve revisar e vetar `migrate deploy`, seed no Neon, exclusões amplas ou outra operação destrutiva de banco?
