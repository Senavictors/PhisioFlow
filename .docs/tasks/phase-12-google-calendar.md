# Task: Phase 12 — Integração com Google Calendar

## Status

- [x] Todo
- [x] In Progress
- [x] Done

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

- [x] Adicionar SDK/API client do Google:
  - recomendada: `googleapis`
- [x] Criar helpers de OAuth e Calendar com inicialização lazy
- [x] Definir envs em `.env.example`:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_CALENDAR_REDIRECT_URI`
  - `INTEGRATION_ENCRYPTION_KEY`

### Backend — Migration

- [x] Criar enum `CalendarProvider`
- [x] Criar enum `CalendarSyncStatus`
- [x] Criar modelo `CalendarConnection`
- [x] Criar modelo `CalendarEventLink`
- [x] Adicionar relações reversas nos modelos `User` e `Session`
- [x] Não acoplar `externalEventId` diretamente em `Session` para preservar flexibilidade futura

### Backend — OAuth/API

- [x] `GET /api/integrations/google-calendar/connect` — redireciona para consentimento Google
- [x] `GET /api/integrations/google-calendar/callback` — troca code por tokens e salva conexão
- [x] `GET /api/integrations/google-calendar` — retorna status seguro da conexão
- [x] `PUT /api/integrations/google-calendar` — salva agenda padrão e defaults de sync
- [x] `DELETE /api/integrations/google-calendar` — desconecta e remove tokens
- [x] `GET /api/integrations/google-calendar/calendars` — lista agendas disponíveis
- [x] `POST /api/sessions/:id/calendar-sync` — cria/atualiza evento manualmente
- [x] `DELETE /api/sessions/:id/calendar-sync` — remove vínculo/evento externo

### Backend — Use Cases

- [x] `connectGoogleCalendarUseCase`
- [x] `disconnectGoogleCalendarUseCase`
- [x] `listGoogleCalendarsUseCase`
- [x] `saveCalendarSettingsUseCase`
- [x] `syncSessionToGoogleCalendarUseCase`
- [x] `removeSessionFromGoogleCalendarUseCase`
- [x] Atualizar fluxo de criação/edição/cancelamento de sessão para respeitar default de sync
- [x] Em cancelamento de sessão:
  - remover evento externo ou marcar como cancelado, conforme decisão final de UX
- [x] Registrar falhas de sync sem quebrar o salvamento clínico da sessão

### Frontend

- [x] Criar rota protegida:
  - recomendada: `/configuracoes/integracoes`
- [x] Atualizar `src/proxy.ts` para proteger `/configuracoes`
- [x] Card "Google Calendar":
  - estado desconectado
  - botão conectar
  - conta conectada
  - seletor de agenda padrão
  - toggle "Sincronizar novos atendimentos automaticamente"
  - botão desconectar
- [x] No formulário de atendimento, adicionar checkbox:
  - "Adicionar ao Google Calendar"
  - pré-marcado conforme configuração do usuário
- [x] No `SessionCard`, mostrar estado de sync:
  - sincronizado
  - pendente/falhou
  - não sincronizado
- [x] Ação manual "Sincronizar com Google Calendar" em sessão agendada
- [x] Não remover a agenda interna do PhysioFlow.

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

- [x] Usuário conecta Google Calendar com OAuth
- [x] Tokens nunca aparecem no cliente
- [x] Tokens ficam criptografados no banco
- [x] Usuário seleciona agenda padrão
- [x] Sessão pode ser sincronizada manualmente
- [x] Novo atendimento respeita default de sync
- [x] Edição de data/hora atualiza evento externo
- [x] Cancelamento remove ou marca evento como cancelado
- [x] Falha de sync não impede salvar atendimento no PhysioFlow
- [x] Badges mostram estado de sync
- [x] Multi-tenant mantido em todas as queries
- [x] `npm run lint` passa sem erros
- [x] `npm run build` passa sem erros
- [x] `.docs/CONTEXT.md` atualizado
- [x] `README.md` atualizado
- [x] `.docs/CHANGELOG.md` atualizado
- [ ] Validação manual com conta Google de teste

## Notas para Próxima Sessão

Implementação concluída fora da ordem originalmente planejada. O primeiro release ficou
unidirecional PhysioFlow → Google Calendar; importação/bidirecionalidade deve virar fase
própria se realmente for necessária.

Pendente apenas validação manual com conta Google real, pois exige credenciais OAuth no
Google Cloud Console e `INTEGRATION_ENCRYPTION_KEY` configurada no ambiente.
