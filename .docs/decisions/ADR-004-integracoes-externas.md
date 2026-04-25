# ADR-004: Integrações Externas de E-mail e Calendário

## Status

Proposto

## Contexto

O próximo ciclo do PhysioFlow precisa conectar o fluxo clínico a canais externos:

- Enviar documentos gerados por e-mail para pacientes
- Enviar aviso de dia e horário de atendimento
- Permitir que o fisioterapeuta configure o envio com credenciais próprias do Gmail
- Sincronizar atendimentos com Google Calendar

Essas integrações lidam com dados sensíveis: credenciais, tokens OAuth, dados clínicos e
informações de pacientes. A arquitetura precisa manter isolamento por `userId`, evitar
credenciais no cliente e permitir que cada envio/sincronização seja opcional.

## Decisão

### E-mail

- Usar SMTP com Gmail App Password na primeira versão.
- Cada usuário configura seu próprio remetente em uma tela de configurações.
- A senha de app do Gmail deve ser armazenada criptografada no banco.
- A senha nunca deve ser retornada em endpoints, logs ou payloads de UI.
- O usuário decide por ação:
  - enviar ou não o PDF por e-mail ao gerar um documento;
  - enviar ou não aviso de atendimento ao paciente.
- Manter defaults configuráveis por usuário, mas sempre permitir override no envio.
- Criar log de envio para auditoria e troubleshooting.

### Google Calendar

- Usar OAuth 2.0 do Google para conexão com Calendar.
- Armazenar refresh token criptografado por usuário.
- Não usar service account para calendários pessoais de fisioterapeutas.
- Criar vínculo entre `Session` e evento externo em uma tabela própria, em vez de
  acoplar o modelo clínico diretamente ao Google.
- Sincronização deve ser opt-in:
  - usuário conecta a conta;
  - escolhe agenda padrão;
  - decide se novos atendimentos devem criar eventos automaticamente.

### Segurança e Next.js

- Nenhum SDK externo deve ser inicializado em module scope.
- Clientes SMTP, Google OAuth e Calendar API devem ser criados via getters lazy.
- Route Handlers continuam finos: validam input e chamam use cases.
- Toda mutation deve filtrar por `userId`.
- Toda credencial deve depender de uma env server-side, por exemplo
  `INTEGRATION_ENCRYPTION_KEY`.

## Consequências

**Positivo:**

- Mantém o usuário no controle de envio e sincronização.
- Evita usar uma conta global do PhysioFlow para enviar e-mails de todos os usuários.
- Facilita expansão futura para outros provedores.
- Mantém auditoria básica por e-mail enviado e evento sincronizado.

**Negativo:**

- Configuração inicial de Gmail App Password exige um passo manual do usuário.
- OAuth adiciona tela de callback, armazenamento seguro de tokens e tratamento de expiração.
- Lembretes automáticos em horário futuro exigirão cron/fila em uma fase posterior se forem
  além de envio imediato de aviso.

## Fora de Escopo da Decisão

- Envio por WhatsApp
- Assinatura digital de documentos
- CalDAV/iCloud/Outlook Calendar
- Fila dedicada de jobs
- Multi-usuário por clínica com permissões granulares
