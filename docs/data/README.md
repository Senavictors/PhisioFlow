# Dados

O modelo vigente está em [`../../prisma/schema.prisma`](../../prisma/schema.prisma), com evolução em [`../../prisma/migrations/`](../../prisma/migrations/). O banco de execução é PostgreSQL hospedado no Neon e a conexão é definida por `DATABASE_URL`.

## Regras transversais

- Modelos clínicos e financeiros carregam `userId` e as consultas devem filtrar por esse campo.
- Alterações de schema usam nova migration; migrations aplicadas não são editadas.
- `Payment` se vincula a `Session` ou `TreatmentPlan` com a constraint XOR criada na migration da Phase 16.
- Valores monetários usam `Decimal`; a camada de servidor serializa valores antes de entregá-los a Client Components.
- PDFs não são persistidos na v1; `Document.storagePath` permanece nulo.

O dicionário detalhado deve crescer junto das tasks que alterarem cada modelo, evitando duplicar o schema inteiro nesta pasta.
