---
estado: real
fonte: src/app, src/server/modules, src/proxy.ts, prisma/schema.prisma, .docs/vision.md
ultima-revisao: 2026-08-27 bootstrap-init
---

# Contexto do Sistema

## Propósito

PhysioFlow ajuda fisioterapeutas a administrar pacientes, prontuários, atendimentos SOAP, planos de tratamento, agenda, documentos, pagamentos e indicadores financeiros. O sistema atende uma clínica/profissional por conta e mantém os dados clínicos e financeiros isolados pelo usuário autenticado.

## Atores

| Ator | Papel |
|---|---|
| Fisioterapeuta | Cadastra pacientes, registra sessões, gerencia planos, agenda, documentos e financeiro. |
| Usuário autenticado | Representa a conta dona dos dados; sua sessão define o `userId` das operações. |
| Google Calendar | Agenda externa opcional para sincronização de sessões via OAuth. |
| Gmail SMTP | Provedor opcional para lembretes, documentos e e-mails de teste. |

## Fronteiras do sistema

- **Navegador** — acessa páginas Next.js e endpoints HTTP; não acessa o banco.
- **Google Calendar** — recebe/cria/atualiza/remove eventos quando o usuário autoriza a integração.
- **Gmail SMTP** — envia mensagens quando configurações válidas estão habilitadas.
- **Neon PostgreSQL** — persiste contas, dados clínicos, documentos, conexões, eventos e pagamentos via Prisma.

## Fora do escopo deste contexto

- Gateways de pagamento e cobrança automática ainda não fazem parte da implementação.
- WhatsApp, portal do paciente e armazenamento persistente de PDFs não estão implementados.
- O processamento de dados não substitui julgamento clínico do fisioterapeuta.
