# Task: Phase 12 — Integração com Google Calendar

## Status

- [x] Todo
- [ ] In Progress
- [ ] Done

## Contexto

A agenda interna do PhysioFlow será mais útil quando puder sincronizar atendimentos com o
Google Calendar do fisioterapeuta. Essa integração precisa respeitar consentimento,
multi-tenant e segurança de tokens.

O plugin Google Calendar disponível no ambiente do Codex pode ajudar em tarefas pessoais do
usuário, mas a implementação do produto deve usar OAuth 2.0 próprio para cada usuário final
do PhysioFlow.

## Objetivo

Permitir que o usuário conecte uma conta Google, escolha uma agenda e sincronize sessões do
PhysioFlow como eventos no Google Calendar, mantendo controle por sessão e por configuração
global.

## Escopo

### Dependências

- [ ] Adicionar SDK/API client do Google:
  - recomendada: `googleapis`
- [ ] Criar helpers de OAuth e Calendar com inicialização lazy
- [ ] Definir envs:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_CALENDAR_REDIRECT_URI`
  - `INTEGRATION_ENCRYPTION_KEY`

### Backend — Migration

- [ ] Criar enum `CalendarProvider`
- [ ] Criar enum `CalendarSyncStatus`
- [ ] Criar modelo `CalendarConnection`
- [ ] Criar modelo `CalendarEventLink`
- [ ] Adicionar relações reversas nos modelos `User` e `Session`
- [ ] Não acoplar `externalEventId` diretamente em `Session` para preservar flexibilidade futura

### Backend — OAuth/API

- [ ] `GET /api/integrations/google-calendar/connect` — redireciona para consentimento Google
- [ ] `GET /api/integrations/google-calendar/callback` — troca code por tokens e salva conexão
- [ ] `GET /api/integrations/google-calendar` — retorna status seguro da conexão
- [ ] `PUT /api/integrations/google-calendar` — salva agenda padrão e defaults de sync
- [ ] `DELETE /api/integrations/google-calendar` — desconecta e remove tokens
- [ ] `GET /api/integrations/google-calendar/calendars` — lista agendas disponíveis
- [ ] `POST /api/sessions/:id/calendar-sync` — cria/atualiza evento manualmente
- [ ] `DELETE /api/sessions/:id/calendar-sync` — remove vínculo/evento externo

### Backend — Use Cases

- [ ] `connectGoogleCalendarUseCase`
- [ ] `disconnectGoogleCalendarUseCase`
- [ ] `listGoogleCalendarsUseCase`
- [ ] `saveCalendarSettingsUseCase`
- [ ] `syncSessionToGoogleCalendarUseCase`
- [ ] `removeSessionFromGoogleCalendarUseCase`
- [ ] Atualizar fluxo de criação/edição/cancelamento de sessão para respeitar default de sync
- [ ] Em cancelamento de sessão:
  - remover evento externo ou marcar como cancelado, conforme decisão final de UX
- [ ] Registrar falhas de sync sem quebrar o salvamento clínico da sessão

### Frontend

- [ ] Criar rota protegida:
  - recomendada: `/configuracoes/integracoes`
- [ ] Atualizar `src/proxy.ts` para proteger `/configuracoes`
- [ ] Card "Google Calendar":
  - estado desconectado
  - botão conectar
  - conta conectada
  - seletor de agenda padrão
  - toggle "Sincronizar novos atendimentos automaticamente"
  - botão desconectar
- [ ] No formulário de atendimento, adicionar checkbox:
  - "Adicionar ao Google Calendar"
  - pré-marcado conforme configuração do usuário
- [ ] No `SessionCard`, mostrar estado de sync:
  - sincronizado
  - pendente/falhou
  - não sincronizado
- [ ] Ação manual "Sincronizar com Google Calendar" em sessão agendada
- [ ] Não remover a agenda interna do PhysioFlow.

## Fora de Escopo

- Importar eventos externos para dentro do PhysioFlow
- Detectar conflito com eventos pessoais do Google
- Sincronização bidirecional em tempo real
- Webhooks/push notifications do Google
- Calendários Outlook/iCloud
- Criação de sala/reunião Google Meet

## Decisões Arquiteturais

- [ADR-004](../decisions/ADR-004-integracoes-externas.md) — OAuth Google Calendar, tokens criptografados e sync opt-in

## Contratos

### HTTP

```
GET /api/integrations/google-calendar
Response 200:
{
  connection: {
    connected: boolean,
    accountEmail?: string,
    calendarId?: string,
    calendarSummary?: string,
    syncNewSessionsByDefault: boolean
  }
}
```

```
PUT /api/integrations/google-calendar
Body: {
  calendarId: string,
  calendarSummary?: string,
  syncNewSessionsByDefault: boolean
}
Response 200: { connection: CalendarConnectionSafe }
```

```
GET /api/integrations/google-calendar/calendars
Response 200:
{
  calendars: {
    id: string,
    summary: string,
    primary: boolean
  }[]
}
```

```
POST /api/sessions/:id/calendar-sync
Body: { calendarId?: string }
Response 200: { link: CalendarEventLink }
```

```
DELETE /api/sessions/:id/calendar-sync
Response 200: {}
```

### Interno

```typescript
syncSessionToGoogleCalendarUseCase(input: {
  userId: string
  sessionId: string
  calendarId?: string
}): Promise<CalendarEventLink>
```

```typescript
removeSessionFromGoogleCalendarUseCase(input: {
  userId: string
  sessionId: string
}): Promise<void>
```

## Migrations

```prisma
enum CalendarProvider {
  GOOGLE
}

enum CalendarSyncStatus {
  SYNCED
  FAILED
  REMOVED
}

// Adicionar ao modelo User:
// calendarConnections CalendarConnection[]
// calendarEventLinks  CalendarEventLink[]

// Adicionar ao modelo Session:
// calendarEventLinks CalendarEventLink[]

model CalendarConnection {
  id                         String           @id @default(cuid())
  userId                     String
  provider                   CalendarProvider @default(GOOGLE)
  accountEmail               String
  encryptedRefreshToken      String
  encryptedAccessToken       String?
  accessTokenExpiresAt       DateTime?
  calendarId                 String?
  calendarSummary            String?
  syncNewSessionsByDefault   Boolean          @default(false)
  createdAt                  DateTime         @default(now())
  updatedAt                  DateTime         @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, provider])
  @@index([userId])
}

model CalendarEventLink {
  id              String             @id @default(cuid())
  userId          String
  sessionId       String
  provider        CalendarProvider   @default(GOOGLE)
  externalEventId String
  calendarId      String
  status          CalendarSyncStatus @default(SYNCED)
  errorMessage    String?
  lastSyncedAt    DateTime?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  user    User    @relation(fields: [userId], references: [id])
  session Session @relation(fields: [sessionId], references: [id])

  @@unique([provider, externalEventId])
  @@unique([sessionId, provider])
  @@index([userId])
  @@index([userId, sessionId])
}
```

## UI

- [ ] Página: `/configuracoes/integracoes`
- [ ] Página: `/agenda`
- [ ] Página: `/atendimentos`
- [ ] Página: `/pacientes/:id/sessoes/nova`
- [ ] Componente: `GoogleCalendarSettingsCard`
- [ ] Componente: `CalendarSyncBadge`
- [ ] Componente: `SyncSessionCalendarButton`

## Checklist Final

- [ ] Usuário conecta Google Calendar com OAuth
- [ ] Tokens nunca aparecem no cliente
- [ ] Tokens ficam criptografados no banco
- [ ] Usuário seleciona agenda padrão
- [ ] Sessão pode ser sincronizada manualmente
- [ ] Novo atendimento respeita default de sync
- [ ] Edição de data/hora atualiza evento externo
- [ ] Cancelamento remove ou marca evento como cancelado
- [ ] Falha de sync não impede salvar atendimento no PhysioFlow
- [ ] Badges mostram estado de sync
- [ ] Multi-tenant mantido em todas as queries
- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` passa sem erros
- [ ] `.docs/CONTEXT.md` atualizado
- [ ] `README.md` atualizado
- [ ] `.docs/CHANGELOG.md` atualizado
- [ ] Validação manual com conta Google de teste

## Notas para Próxima Sessão

Executar depois da Phase 10 evita sincronizar um fluxo interno ainda incompleto. O primeiro
release deve ser unidirecional PhysioFlow → Google Calendar; importação/bidirecionalidade
deve virar fase própria se realmente for necessária.
