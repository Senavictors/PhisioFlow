# Quarentena de skills externas — PhysioFlow

Skills de terceiros devem ser avaliadas antes de qualquer ativação em `.claude/skills/`.

## Processo

1. Coloque a skill em `.agents/quarantine/<nome>/SKILL.md.original`.
2. Rode `bootstrap-quarantine` para comparar a skill com a Constituição e os ADRs aceitos.
3. Revise o relatório e aprove, ajuste ou rejeite explicitamente.
4. Só após aprovação copie a skill para `.claude/skills/`; mantenha o original na quarentena.
