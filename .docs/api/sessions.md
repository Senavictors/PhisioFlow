# API de Sessões

## Endpoints

### `POST /api/sessions`

Cria uma nova sessão clínica vinculada a um paciente do `userId` autenticado.

```json
{
  "patientId": "string",
  "date": "2026-04-24T13:00:00.000Z",
  "duration": 50,
  "type": "PRESENTIAL",
  "status": "AGENDADO",
  "subjective": "string?",
  "objective": "string?",
  "assessment": "string?",
  "plan": "string?"
}
```

Regras:

- `patientId` deve pertencer ao usuário autenticado
- `status = AGENDADO` não pode usar uma data passada

### `GET /api/sessions`

Lista sessões ativas do usuário com suporte a filtros:

- `patientId`
- `status`
- `type`
- `area`
- `from`
- `to`
- `page`
- `limit`

Resposta:

```json
{
  "sessions": [],
  "total": 0
}
```

### `GET /api/sessions/:id`

Retorna uma sessão ativa com os dados básicos do paciente relacionado.

### `PUT /api/sessions/:id`

Atualiza data, duração, tipo, status e campos SOAP de uma sessão.

### `DELETE /api/sessions/:id`

Executa soft delete da sessão:

```json
{}
```
