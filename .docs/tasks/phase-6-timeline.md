# Task: Phase 6 — Timeline de Evolução

## Status

- [x] Todo
- [x] In Progress
- [x] Done

## Contexto

Com pacientes e sessões registradas (Phases 3 e 4), o fisioterapeuta precisa visualizar
a progressão clínica de um paciente ao longo do tempo. A timeline centraliza esse histórico
de forma visual e legível — cada sessão SOAP vira uma entrada cronológica na ficha do paciente.

Sem migration nova — usa o modelo `Session` existente.

Tela de referência: `physioflow-design-system/project/ui_kits/portal/index.html`
→ aba "Paciente / Evolução"

## Objetivo

Página `/pacientes/:id/evolucao` com timeline cronológica reversa das sessões SOAP do paciente,
mostrando data, status, campos SOAP preenchidos e indicadores de evolução funcional.
Link de acesso a partir da ficha do paciente (`/pacientes/:id`).

## Escopo

### Backend

- [ ] `GET /api/patients/:id/sessions` — lista sessões do paciente com paginação (reusa `listSessions` com filtro `patientId`)
- [ ] Sem use case novo — reutilizar `listSessionsUseCase` com `{ patientId, order: 'desc' }`

### Frontend

- [ ] Página `/pacientes/:id/evolucao` — timeline de sessões
- [ ] Componente `TimelineEntry` — entrada individual da timeline
- [ ] Componente `SoapAccordion` — campos SOAP colapsáveis por entrada
- [ ] Link "Ver evolução" na ficha do paciente (`/pacientes/:id`)
- [ ] Estado vazio: "Nenhuma sessão registrada ainda."

## Fora de Escopo

- Edição de sessões a partir da timeline (usar `/pacientes/:id/sessoes/nova`)
- Gráficos de métricas numéricas (EVA, ADM) — fase futura
- Comparativo entre sessões

---

## Contrato HTTP

```
GET /api/patients/:id/sessions?page=1&limit=20&order=desc
Headers: Cookie (sessão autenticada)
Response 200: {
  sessions: SessionWithPatient[],
  total: number
}
Errors: 401 (não autenticado), 403 (paciente de outro userId), 404 (paciente não encontrado)
```

Reutiliza o endpoint e use case existentes — apenas adicionar rota em `/api/patients/[id]/sessions/route.ts`.

---

## UI — Spec da Timeline

### Estrutura da Página

```
/pacientes/:id/evolucao

Breadcrumb: Pacientes → [Nome do Paciente] → Evolução

Header:
  Eyebrow: "HISTÓRICO CLÍNICO"
  Título: "Evolução de [Nome]"
  Subtítulo: "[N] sessões registradas"
  CTA: "Nova sessão" → /pacientes/:id/sessoes/nova

Timeline (lista vertical com linha de tempo à esquerda):
  [ TimelineEntry × N ]

Paginação: "Carregar mais" ou paginação numérica
```

### Componente `TimelineEntry`

```
Layout: linha vertical (border-l border-border) com dot (●) e card à direita

Dot:
  REALIZADO  → bg-success, ring-success-soft
  AGENDADO   → bg-primary, ring-primary-soft
  CANCELADO  → bg-muted, ring-muted

Card (bg-card, rounded-2xl, p-5, shadow-sm):
  Header do card:
    - Data longa em pt-BR  (font-display, 18px)
    - Hora (muted, 12px)
    - Duração em min (muted, 12px)
    - Badge de status (StatusBadge existente)
    - Badge "Domiciliar" (se HOME_CARE)

  SoapAccordion (colapsável, fechado por padrão em AGENDADO, aberto em REALIZADO):
    S — Subjetivo
    O — Objetivo
    A — Avaliação
    P — Plano
    (cada campo exibe placeholder muted se vazio)
```

### Componente `SoapAccordion`

```
Props: { subjective, objective, assessment, plan: string | null }
Layout: grid 2×2 ou lista vertical
  Cada campo:
    - Eyebrow: "S — SUBJETIVO" (text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground)
    - Conteúdo: font-body text-[14px] text-foreground (ou italic muted se vazio)
  Colapsável via estado local (useState)
```

---

## Checklist Final

- [ ] `GET /api/patients/:id/sessions` retorna sessões corretas do paciente autenticado
- [ ] Rota bloqueia acesso a paciente de outro `userId`
- [ ] Página `/pacientes/:id/evolucao` renderiza a timeline em ordem cronológica reversa
- [ ] TimelineEntry exibe dot colorido conforme status
- [ ] SoapAccordion abre/fecha por entry
- [ ] Link "Ver evolução" visível na ficha do paciente
- [ ] Estado vazio renderizado quando não há sessões
- [ ] `npm run build` passa sem erros
- [ ] `.docs/CONTEXT.md` atualizado
- [ ] `README.md` atualizado (Phase 6 marcada como ✅)
- [ ] `.docs/CHANGELOG.md` atualizado

## Notas para Próxima Sessão

Ao concluir, o ciclo clínico básico estará completo: cadastrar → atender → visualizar evolução.
A Phase 7 (Central de Documentos) adiciona geração de PDF a partir desses dados — laudo, relatório
de progresso e declaração de atendimento.
