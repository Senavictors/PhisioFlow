# Módulos

Os módulos de servidor ficam em `src/server/modules/` e seguem, quando aplicável, `application/`, `domain/`, `http/` e `infra/`.

| Módulo | Responsabilidade | Código |
|---|---|---|
| `auth` | cadastro, login, logout e sessão | `src/server/modules/auth/` |
| `patients` | CRM, prontuário e arquivamento | `src/server/modules/patients/` |
| `sessions` | atendimentos SOAP e agenda | `src/server/modules/sessions/` |
| `treatment-plans` | planos, modalidades e status | `src/server/modules/treatment-plans/` |
| `payments` | pagamentos, estornos e saldos | `src/server/modules/payments/` |
| `finance` | resumo e agregações financeiras on-demand | `src/server/modules/finance/` |
| `documents` | metadados e documentos PDF | `src/server/modules/documents/` |
| `calendar` | OAuth e sincronização Google Calendar | `src/server/modules/calendar/` |
| `email` | Gmail SMTP, lembretes e envio de documentos | `src/server/modules/email/` |
| `workplaces` | locais e modalidades de atendimento | `src/server/modules/workplaces/` |

Cada task que alterar um módulo deve registrar o fluxo afetado, testes executados e documentação primária atualizada.
