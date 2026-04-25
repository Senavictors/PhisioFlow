# API de Google Calendar

## Visão Geral

Endpoints protegidos por sessão server-side. Todos operam no `userId` autenticado e nunca
retornam tokens OAuth ao cliente.

Variáveis exigidas no servidor:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALENDAR_REDIRECT_URI`
- `INTEGRATION_ENCRYPTION_KEY`

## Endpoints

### `GET /api/integrations/google-calendar/connect`

Redireciona o usuário autenticado para o consentimento OAuth do Google Calendar.

### `GET /api/integrations/google-calendar/callback`

Callback OAuth. Valida `state`, troca `code` por tokens, criptografa credenciais e salva a
conexão do usuário.

Redireciona para:

- `/configuracoes/integracoes?calendar=connected`
- `/configuracoes/integracoes?calendar=error`

### `GET /api/integrations/google-calendar`

Retorna status seguro da conexão.

```json
{
  "connection": {
    "connected": true,
    "accountEmail": "fisio@gmail.com",
    "calendarId": "primary",
    "calendarSummary": "Atendimentos",
    "syncNewSessionsByDefault": false
  }
}
```

### `PUT /api/integrations/google-calendar`

Salva agenda padrão e preferência de sincronização automática.

```json
{
  "calendarId": "primary",
  "calendarSummary": "Atendimentos",
  "syncNewSessionsByDefault": true
}
```

### `DELETE /api/integrations/google-calendar`

Revoga o refresh token em best-effort e remove a conexão local.

### `GET /api/integrations/google-calendar/calendars`

Lista agendas nas quais o usuário tem permissão de escrita.

```json
{
  "calendars": [
    {
      "id": "primary",
      "summary": "Principal",
      "primary": true
    }
  ]
}
```

### `POST /api/sessions/:id/calendar-sync`

Cria ou atualiza um evento do Google Calendar para a sessão.

```json
{
  "calendarId": "primary"
}
```

`calendarId` é opcional quando o usuário já tem agenda padrão configurada.

### `DELETE /api/sessions/:id/calendar-sync`

Remove o evento externo em best-effort e marca o vínculo local como `REMOVED`.

## Regras

- Sessões canceladas não são sincronizadas.
- Falha de sincronização não impede salvar dados clínicos da sessão.
- Ao cancelar uma sessão vinculada, o sistema tenta remover o evento externo.
- Tokens são criptografados com AES-256-GCM via `INTEGRATION_ENCRYPTION_KEY`.
