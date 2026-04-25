# Task: Phase 11 — E-mails com Gmail App Password

## Status

- [x] Todo
- [ ] In Progress
- [ ] Done

## Contexto

O usuário quer enviar e-mails pelo próprio Gmail, usando o código/senha de app gerado na
conta Google. Os envios devem cobrir dois fluxos:

- enviar ao paciente um relatório/documento gerado;
- avisar o paciente sobre dia e horário de atendimento.

O fisioterapeuta precisa configurar isso sozinho, entender como obter a senha de app e
decidir em cada fluxo se deseja enviar ou não o e-mail.

## Objetivo

Criar uma configuração de e-mail por usuário, com envio via Gmail SMTP, passo a passo de
configuração, teste de conexão, envio de documento por e-mail e aviso de atendimento.

## Escopo

### Dependências

- [ ] Adicionar biblioteca de SMTP:
  - recomendada: `nodemailer`
  - tipos: `@types/nodemailer` se necessário
- [ ] Criar helper server-side para criptografia de credenciais
- [ ] Usar getter lazy para transporter SMTP, nunca inicializar em module scope

### Backend — Migration

- [ ] Criar enum `EmailProvider`
- [ ] Criar enum `EmailMessageType`
- [ ] Criar enum `EmailMessageStatus`
- [ ] Criar modelo `EmailSettings`
- [ ] Criar modelo `EmailMessage`
- [ ] Adicionar relações reversas nos modelos `User`, `Patient`, `Document` e `Session`
- [ ] Adicionar índices por `userId`, `patientId`, `documentId`, `sessionId` quando aplicável

### Backend — API

- [ ] `GET /api/settings/email` — retorna configuração sem senha
- [ ] `PUT /api/settings/email` — salva remetente, Gmail user e App Password criptografada
- [ ] `POST /api/settings/email/test` — envia e-mail de teste para o próprio usuário
- [ ] `POST /api/documents/:id/email` — envia PDF gerado ao paciente
- [ ] `POST /api/sessions/:id/email-reminder` — envia aviso de atendimento ao paciente
- [ ] Todos os endpoints devem exigir sessão autenticada e filtrar por `userId`

### Backend — Use Cases

- [ ] `saveEmailSettingsUseCase`
- [ ] `testEmailSettingsUseCase`
- [ ] `sendDocumentEmailUseCase`
- [ ] `sendSessionReminderEmailUseCase`
- [ ] `createEmailMessageLogUseCase` ou logging dentro dos use cases de envio
- [ ] Garantir que paciente sem e-mail retorne erro amigável
- [ ] Garantir que configuração incompleta bloqueie envio com instrução clara

### Frontend — Configurações

- [ ] Criar rota protegida:
  - recomendada: `/configuracoes/email`
- [ ] Adicionar item de navegação se fizer sentido no shell
- [ ] Atualizar `src/proxy.ts` para proteger `/configuracoes`
- [ ] Formulário de configuração:
  - nome do remetente
  - e-mail Gmail
  - Gmail App Password
  - defaults de envio
- [ ] Passo a passo para o usuário:
  - ativar verificação em duas etapas na conta Google;
  - acessar "Senhas de app";
  - criar uma senha para o PhysioFlow;
  - copiar a senha de 16 caracteres;
  - colar no campo do PhysioFlow.
- [ ] Mostrar alerta de segurança: a senha de app pode ser revogada no Google a qualquer momento.
- [ ] Botão "Enviar teste".

### Frontend — Documentos

- [ ] No modal "Gerar documento", adicionar opção:
  - "Enviar por e-mail ao paciente"
- [ ] Mostrar e-mail do paciente selecionado quando disponível
- [ ] Permitir assunto/mensagem curta opcional
- [ ] Se o paciente não tiver e-mail, desabilitar envio e explicar
- [ ] Após gerar o documento, enviar e-mail quando a opção estiver marcada
- [ ] Manter download do PDF disponível independentemente do envio
- [ ] Em documento já gerado, adicionar ação "Enviar por e-mail"

### Frontend — Atendimentos

- [ ] Ao criar/agendar atendimento, adicionar opção:
  - "Enviar aviso por e-mail ao paciente"
- [ ] No `SessionCard`, adicionar ação secundária "Enviar aviso" para sessões agendadas
- [ ] O e-mail deve conter:
  - nome do paciente
  - data e horário do atendimento
  - duração
  - tipo presencial/domiciliar
  - endereço se for domiciliar e houver cadastro
  - assinatura com nome do fisioterapeuta

## Fora de Escopo

- Envio automático futuro com fila/cron N horas antes
- Templates customizados pelo usuário
- Anexos além do PDF gerado pelo sistema
- WhatsApp/SMS
- OAuth Gmail para envio
- Uso do plugin Gmail do Codex como integração do produto

## Decisões Arquiteturais

- [ADR-004](../decisions/ADR-004-integracoes-externas.md) — SMTP Gmail, credenciais criptografadas e envio opt-in

## Contratos

### HTTP

```
GET /api/settings/email
Response 200:
{
  settings: {
    provider: "GMAIL_SMTP",
    fromName: string,
    smtpUser: string,
    isEnabled: boolean,
    sendDocumentsByDefault: boolean,
    sendSessionRemindersByDefault: boolean,
    hasAppPassword: boolean
  } | null
}
```

```
PUT /api/settings/email
Body: {
  fromName: string,
  smtpUser: string,
  appPassword?: string,
  isEnabled: boolean,
  sendDocumentsByDefault: boolean,
  sendSessionRemindersByDefault: boolean
}
Response 200: { settings: EmailSettingsSafe }
```

```
POST /api/settings/email/test
Body: { to?: string }
Response 200: { messageId: string }
```

```
POST /api/documents/:id/email
Body: {
  subject?: string,
  message?: string
}
Response 200: { email: EmailMessage }
```

```
POST /api/sessions/:id/email-reminder
Body: {
  subject?: string,
  message?: string
}
Response 200: { email: EmailMessage }
```

### Interno

```typescript
sendDocumentEmailUseCase(input: {
  userId: string
  documentId: string
  subject?: string
  message?: string
}): Promise<EmailMessage>
```

```typescript
sendSessionReminderEmailUseCase(input: {
  userId: string
  sessionId: string
  subject?: string
  message?: string
}): Promise<EmailMessage>
```

## Migrations

```prisma
enum EmailProvider {
  GMAIL_SMTP
}

enum EmailMessageType {
  DOCUMENT
  SESSION_REMINDER
  TEST
}

enum EmailMessageStatus {
  SENT
  FAILED
}

// Adicionar ao modelo User:
// emailSettings EmailSettings?
// emailMessages  EmailMessage[]

// Adicionar ao modelo Patient:
// emailMessages EmailMessage[]

// Adicionar ao modelo Document:
// emailMessages EmailMessage[]

// Adicionar ao modelo Session:
// emailMessages EmailMessage[]

model EmailSettings {
  id                            String        @id @default(cuid())
  userId                        String        @unique
  provider                      EmailProvider @default(GMAIL_SMTP)
  fromName                      String
  smtpUser                      String
  encryptedAppPassword          String
  isEnabled                     Boolean       @default(false)
  sendDocumentsByDefault        Boolean       @default(false)
  sendSessionRemindersByDefault Boolean       @default(false)
  createdAt                     DateTime      @default(now())
  updatedAt                     DateTime      @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
}

model EmailMessage {
  id           String             @id @default(cuid())
  userId       String
  patientId    String?
  documentId   String?
  sessionId    String?
  type         EmailMessageType
  status       EmailMessageStatus
  to           String
  subject      String
  providerId   String?
  errorMessage String?
  createdAt    DateTime           @default(now())

  user     User      @relation(fields: [userId], references: [id])
  patient  Patient?  @relation(fields: [patientId], references: [id])
  document Document? @relation(fields: [documentId], references: [id])
  session  Session?  @relation(fields: [sessionId], references: [id])

  @@index([userId])
  @@index([userId, patientId])
  @@index([userId, documentId])
  @@index([userId, sessionId])
}
```

## UI

- [ ] Página: `/configuracoes/email`
- [ ] Página: `/documentos`
- [ ] Página: `/atendimentos`
- [ ] Página: `/pacientes/:id/sessoes/nova`
- [ ] Componente: `EmailSettingsForm`
- [ ] Componente: `GmailAppPasswordGuide`
- [ ] Componente: `SendDocumentEmailDialog`
- [ ] Componente: `SendSessionReminderButton`

## Checklist Final

- [ ] Usuário consegue salvar Gmail + App Password
- [ ] App Password nunca aparece em resposta HTTP
- [ ] Credencial fica criptografada no banco
- [ ] Teste de e-mail funciona
- [ ] Documento pode ser enviado por e-mail ao paciente
- [ ] Aviso de atendimento pode ser enviado por e-mail
- [ ] Fluxos bloqueiam envio quando paciente não tem e-mail
- [ ] Fluxos bloqueiam envio quando configuração está incompleta
- [ ] Logs registram sucesso e falha
- [ ] Multi-tenant mantido em todas as queries
- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` passa sem erros
- [ ] `.docs/CONTEXT.md` atualizado
- [ ] `README.md` atualizado
- [ ] `.docs/CHANGELOG.md` atualizado
- [ ] Validação manual com e-mail de teste

## Notas para Próxima Sessão

Não usar uma conta Gmail global do projeto. O envio precisa sair do Gmail configurado pelo
próprio fisioterapeuta. Para lembretes automáticos em horário futuro, criar fase posterior
com cron/fila; esta fase entrega envio sob demanda e envio imediato no fluxo de agendamento.
