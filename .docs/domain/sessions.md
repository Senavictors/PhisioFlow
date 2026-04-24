# Domínio de Sessões

## Objetivo

Registrar cada atendimento clínico com estrutura SOAP:

- **S**ubjetivo
- **O**bjetivo
- **A**valiação
- **P**lano

## Regras atuais

- Toda sessão pertence a um `userId`
- Toda sessão pertence a um `patientId` do mesmo `userId`
- Sessões removidas são arquivadas com `isActive = false`
- Sessões com status `AGENDADO` não podem ser criadas ou atualizadas no passado
- Os campos SOAP são opcionais para permitir preenchimento progressivo

## Status e tipo

### `SessionStatus`

- `AGENDADO`
- `REALIZADO`
- `CANCELADO`

### `SessionType`

- `PRESENTIAL`
- `HOME_CARE`

## Superfícies de UI

- `/atendimentos` — histórico cronológico
- `/agenda` — próximos agendamentos
- `/pacientes/:id/sessoes/nova` — criação de atendimento via ficha do paciente
