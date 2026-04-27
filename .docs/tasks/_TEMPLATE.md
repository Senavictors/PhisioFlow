# Task: Phase N — [Nome da Feature]

## Status

- [ ] Todo
- [ ] In Progress
- [ ] Done

## Contexto

[Por que essa task existe. Links para ADRs e specs relevantes.]

## Objetivo

[O que precisa ser entregue ao final dessa fase.]

## Escopo

- [ ] [Item 1]
- [ ] [Item 2]

## Fora de Escopo

- [O que explicitamente não entra nessa fase]

## Decisões Arquiteturais

- [ADR-NNN](../decisions/ADR-NNN-nome.md) — [Resumo]

## Contratos

### HTTP

```
POST /api/[recurso]
Body: { campo: string }
Response 201: { id: string, campo: string }
```

### Interno (Use Case)

```typescript
createRecurso(dto: CreateRecursoDTO): Promise<Recurso>
```

## Migrations

```prisma
// schema a adicionar
```

## UI

- [ ] Página: [path]
- [ ] Componente: [nome]

## Checklist Final

- [ ] Código implementado
- [ ] Build sem erros (`npm run build`)
- [ ] Lint sem erros (`npm run lint`)
- [ ] `.docs/CONTEXT.md` atualizado
- [ ] `README.md` atualizado (roadmap, próximo passo)
- [ ] ADR criado/atualizado se necessário
- [ ] Validação manual no browser

## Notas para Próxima Sessão

[Resumo do estado ao finalizar. O que ficou pendente. Contexto para o próximo dev/AI.]
