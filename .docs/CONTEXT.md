# PhysioFlow — Contexto Atual

> Estado vivo do projeto. Ler antes de iniciar qualquer task. Atualizar ao concluir qualquer task.

## Fase Atual
**Phase 0 — Pré-projeto**
Documentação inicial criada. Nenhum código implementado ainda.

## Próximo Passo Planejado
**Phase 1 — Foundation**
Inicializar repositório Next.js 15, configurar Tailwind v4 com tokens OKLCH (Sálvia + Terracota), instalar shadcn/ui, configurar fontes Fraunces + Plus Jakarta Sans, criar layout base com sidebar de navegação.

## O Que Existe

### Infraestrutura
- Documentação inicial (README, CONTEXT, vision, ADRs fundacionais)
- Nenhuma feature implementada

### Features
- (nenhuma)

## Modelos de Banco
(nenhum criado)

## Realidade Arquitetural Atual
Projeto ainda não inicializado. O alvo é Clean Architecture com camadas:
`UI → Route Handlers → Use Cases → Domain → Repositories → DB`

## Camadas de Documentação
- Visão: `.docs/vision.md`
- Arquitetura: `.docs/architecture/README.md`
- Domínio: `.docs/domain/`
- API: `.docs/api/`
- Dados: `.docs/data/`
- Decisões: `.docs/decisions/`
- Tasks: `.docs/tasks/`
- Changelog: `.docs/CHANGELOG.md`

## Roadmap de Documentação
1. Phase 1 — Foundation
2. Phase 2 — Auth
3. Phase 3 — CRM de Pacientes
4. Phase 4 — Registro SOAP
5. Phase 5 — Timeline de Evolução
6. Phase 6 — Dashboard & KPIs
7. Phase 7 — Central de Documentos
8. Phase 8 — Logística Domiciliar

## Decisões Chave
- [ADR-001](decisions/ADR-001-tech-stack.md) — Tech Stack
- [ADR-002](decisions/ADR-002-soap-notes.md) — Estrutura SOAP
- [ADR-003](decisions/ADR-003-auth-approach.md) — Estratégia de Auth
