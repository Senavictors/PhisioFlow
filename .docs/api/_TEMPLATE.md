# API — [Módulo]

## Endpoints

| Método | Path | Descrição |
|--------|------|-----------|
| GET | `/api/[recurso]` | Listar |
| POST | `/api/[recurso]` | Criar |
| GET | `/api/[recurso]/:id` | Buscar por ID |
| PUT | `/api/[recurso]/:id` | Atualizar |
| DELETE | `/api/[recurso]/:id` | Remover |

## POST `/api/[recurso]`

### Request Body
```json
{
  "campo": "valor"
}
```

### Response `201`
```json
{
  "id": "cuid",
  "campo": "valor",
  "createdAt": "ISO8601"
}
```

## Filtros (GET)

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|

## Erros

| Código | Mensagem | Causa |
|--------|---------|-------|
| 400 | Validation error | Input inválido |
| 401 | Unauthorized | Sessão expirada |
| 404 | Not found | Recurso inexistente |

## Efeitos Colaterais
- [Side effect 1]
