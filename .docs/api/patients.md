# API — Patients

## Endpoints

| Método | Path                | Descrição                                     |
| ------ | ------------------- | --------------------------------------------- |
| GET    | `/api/patients`     | Lista pacientes ativos do usuário autenticado |
| POST   | `/api/patients`     | Cria paciente e prontuário base opcional      |
| GET    | `/api/patients/:id` | Busca ficha clínica do paciente               |
| PUT    | `/api/patients/:id` | Atualiza cadastro e prontuário                |
| DELETE | `/api/patients/:id` | Arquiva paciente (`isActive = false`)         |

## GET `/api/patients`

### Filtros

| Parâmetro        | Tipo   | Descrição                                   |
| ---------------- | ------ | ------------------------------------------- |
| `area`           | enum   | Filtra por área terapêutica                 |
| `classification` | enum   | Filtra por classificação clínica            |
| `search`         | string | Busca por nome (contains, case-insensitive) |

### Response `200`

```json
{
  "patients": [
    {
      "id": "clx123",
      "name": "Gervasio Mendes",
      "area": "PILATES",
      "classification": "ELDERLY",
      "isActive": true
    }
  ]
}
```

## POST `/api/patients`

### Request Body

```json
{
  "name": "Carla Souza",
  "birthDate": "1985-07-22",
  "phone": "(11) 99999-0002",
  "email": "carla.souza@exemplo.com",
  "classification": "STANDARD",
  "area": "AESTHETIC",
  "notes": "Prefere atendimento matinal",
  "mainComplaint": "Fibromialgia com pontos de dor difusos.",
  "medicalHistory": "Diagnóstico há 3 anos.",
  "medications": "Amitriptilina 25mg.",
  "allergies": "Dipirona"
}
```

### Response `201`

```json
{
  "patient": {
    "id": "clx123",
    "userId": "clu123",
    "name": "Carla Souza",
    "area": "AESTHETIC",
    "classification": "STANDARD",
    "clinicalRecord": {
      "mainComplaint": "Fibromialgia com pontos de dor difusos."
    }
  }
}
```

## GET `/api/patients/:id`

### Response `200`

```json
{
  "patient": {
    "id": "clx123",
    "name": "Rafael Teixeira",
    "clinicalRecord": {
      "mainComplaint": "Limitação de ADM em joelho direito."
    }
  }
}
```

## PUT `/api/patients/:id`

### Request Body

Aceita payload parcial com os mesmos campos do `POST`.

### Response `200`

```json
{
  "patient": {
    "id": "clx123",
    "updatedAt": "2026-04-24T03:00:00.000Z"
  }
}
```

## DELETE `/api/patients/:id`

### Response `200`

```json
{}
```

## Erros

| Código | Mensagem                                    | Causa                              |
| ------ | ------------------------------------------- | ---------------------------------- |
| 400    | Validation error                            | Input inválido                     |
| 401    | Não autorizado                              | Sessão ausente/expirada            |
| 404    | Paciente não encontrado                     | ID inexistente ou fora do `userId` |
| 409    | Já existe um paciente ativo com este e-mail | Conflito de unicidade lógica       |

## Efeitos Colaterais

- `POST` pode criar `ClinicalRecord` associado no mesmo transaction boundary do Prisma.
- `DELETE` não remove dados históricos; apenas marca o paciente como inativo.
