# Arquitetura — [Nome do Fluxo]

## Visão Geral
[Descrição do fluxo ou componente arquitetural]

## Camadas Envolvidas

| Camada | Arquivo | Responsabilidade |
|--------|---------|-----------------|
| UI | `components/*/` | |
| Route Handler | `app/api/*/route.ts` | |
| Use Case | `server/modules/*/application/` | |
| Repository | `server/modules/*/infra/` | |

## Diagrama de Sequência

```mermaid
sequenceDiagram
    participant UI
    participant API as Route Handler
    participant UC as Use Case
    participant Repo as Repository
    participant DB

    UI->>API: POST /api/...
    API->>UC: execute(dto)
    UC->>Repo: save(entity)
    Repo->>DB: INSERT
    DB-->>Repo: record
    Repo-->>UC: entity
    UC-->>API: result
    API-->>UI: 201 Created
```

## Trade-offs
- **Vantagem**:
- **Desvantagem**:

## Performance
[Notas sobre N+1, índices, cache necessário]
