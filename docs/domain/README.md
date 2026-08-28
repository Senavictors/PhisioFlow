# Domínio

O domínio clínico do PhysioFlow cobre paciente, prontuário, sessão SOAP, plano de tratamento, modalidade/local de atendimento, documentos e pagamentos.

## Fontes primárias

- [`../../.docs/domain/patients.md`](../../.docs/domain/patients.md) — regras e campos de pacientes.
- [`../../.docs/domain/sessions.md`](../../.docs/domain/sessions.md) — regras e campos de sessões.
- [`../../.docs/decisions/ADR-002-soap-notes.md`](../../.docs/decisions/ADR-002-soap-notes.md) — SOAP.
- [`../../.docs/decisions/ADR-005-multi-modalidade-financeiro.md`](../../.docs/decisions/ADR-005-multi-modalidade-financeiro.md) — modalidades e financeiro.
- `prisma/schema.prisma` — entidades, enums e relações vigentes.

Regras novas devem nascer no módulo correspondente em `src/server/modules/` e atualizar a fonte primária funcional, não apenas este índice.
