# Dados — [Nome do Modelo]

## Modelos Afetados

- `ModelName`

## Schema Prisma

```prisma
model ModelName {
  id        String   @id @default(cuid())
  userId    String
  // campos
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@index([userId])
}
```

## Relacionamentos

| De  | Para | Cardinalidade |
| --- | ---- | ------------- |

## Enums

```prisma
enum EnumName {
  VALUE_A
  VALUE_B
}
```

## Constraints

- [Constraint 1]

## ADR Relacionado

- [ADR-NNN](../decisions/ADR-NNN-nome.md)
