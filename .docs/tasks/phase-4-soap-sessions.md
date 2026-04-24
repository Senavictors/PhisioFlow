# Task: Phase 4 — Sessões SOAP (Atendimentos & Agenda)

## Status
- [ ] Todo
- [ ] In Progress
- [ ] Done

## Contexto
Com pacientes cadastrados (Phase 3), precisamos registrar os atendimentos.
Cada atendimento segue o padrão SOAP clínico (Subjetivo, Objetivo, Avaliação, Plano).
Um atendimento pode ser presencial ou domiciliar (`HOME_CARE`) — o badge "Domiciliar"
já existe no design system e deve aparecer na agenda e na lista de atendimentos.

ADR relacionado: [ADR-002](../decisions/ADR-002-soap-notes.md)

Telas de referência no design system:
- Atendimentos: `physioflow-design-system/project/ui_kits/portal/index.html` → aba "Atendimentos"
- Agenda: mesma fonte → aba "Agenda"

## Objetivo
CRUD completo de sessões com campos SOAP. Páginas de Atendimentos (lista cronológica)
e Agenda (próximos agendamentos). Formulário de registro acessível a partir da ficha do paciente.

## Escopo

### Backend
- [ ] Modelo `Session` no Prisma (ver abaixo)
- [ ] Migration
- [ ] `POST /api/sessions` — criar sessão
- [ ] `GET /api/sessions` — listar do usuário (filtros: patientId, status, area, data)
- [ ] `GET /api/sessions/:id` — buscar sessão com SOAP completo
- [ ] `PUT /api/sessions/:id` — atualizar (editar SOAP ou status)
- [ ] `DELETE /api/sessions/:id` — soft delete (`isActive = false`)
- [ ] Módulo `server/modules/sessions/` completo (application, domain, http, infra)
- [ ] Validação Zod em todos os endpoints

### Frontend
- [ ] Página `/atendimentos` — lista cronológica de sessões (design: lista com badges de status)
- [ ] Página `/agenda` — próximos agendamentos (design: agenda-item cards com hora + duração)
- [ ] Página `/pacientes/:id/sessoes/nova` — formulário de registro SOAP
- [ ] Componente `SessionCard` (agenda-item do design system)
- [ ] Componente `StatusBadge` (Agendado | Realizado | Cancelado)
- [ ] Badge "Domiciliar" em sessões `HOME_CARE`
- [ ] Link "Registrar atendimento" na ficha do paciente (Phase 3)

---

## Modelo Prisma

```prisma
enum SessionStatus {
  AGENDADO
  REALIZADO
  CANCELADO
}

enum SessionType {
  PRESENTIAL
  HOME_CARE
}

model Session {
  id         String        @id @default(cuid())
  userId     String
  patientId  String
  date       DateTime
  duration   Int           -- minutos
  type       SessionType   @default(PRESENTIAL)
  status     SessionStatus @default(AGENDADO)
  isActive   Boolean       @default(true)

  -- Campos SOAP
  subjective String?       -- S: queixa do paciente, sintomas relatados
  objective  String?       -- O: achados clínicos, testes realizados
  assessment String?       -- A: hipótese/diagnóstico funcional
  plan       String?       -- P: condutas, exercícios, próxima sessão

  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  user    User    @relation(fields: [userId], references: [id])
  patient Patient @relation(fields: [patientId], references: [id])

  @@index([userId])
  @@index([userId, patientId])
  @@index([userId, date])
  @@index([userId, status])
}
```

---

## Contratos HTTP

```
POST /api/sessions
Body: {
  patientId: string,
  date: string (ISO),
  duration: number,
  type: 'PRESENTIAL' | 'HOME_CARE',
  status?: 'AGENDADO' | 'REALIZADO',
  subjective?: string,
  objective?: string,
  assessment?: string,
  plan?: string,
}
Response 201: { session: Session }
Errors: 400 (Zod), 404 (paciente não encontrado ou não pertence ao userId)

GET /api/sessions?patientId=&status=&type=&from=&to=&page=1&limit=20
Response 200: { sessions: Session[], total: number }

GET /api/sessions/:id
Response 200: { session: Session & { patient: { name: string } } }

PUT /api/sessions/:id
Body: Partial<Session (campos SOAP + status + date + duration)>
Response 200: { session: Session }

DELETE /api/sessions/:id
Response 200: {} (soft delete: isActive = false)
```

---

## Módulo Interno

```
src/server/modules/sessions/
├── application/
│   ├── create-session.ts       → CreateSessionUseCase
│   ├── list-sessions.ts        → ListSessionsUseCase
│   ├── get-session.ts          → GetSessionUseCase
│   └── update-session.ts       → UpdateSessionUseCase
├── domain/
│   ├── session.entity.ts       → tipo Session + validações de negócio
│   └── session.rules.ts        → ex: não criar sessão no passado com status AGENDADO
├── http/
│   └── session.dto.ts          → CreateSessionDTO, UpdateSessionDTO (Zod)
└── infra/
    └── session.repository.ts   → queries Prisma
```

---

## UI — Spec dos Componentes

### Página `/atendimentos`
```
Eyebrow: "HISTÓRICO"
Título: "Atendimentos"
Subtítulo: "Histórico cronológico das suas sessões."

Lista cronológica de SessionCards (agenda-item do design system):
  - Hora (font-display, 22px)
  - Duração em minutos
  - Nome do paciente + tipo de atendimento
  - Badge Domiciliar (se HOME_CARE) → bg-accent-soft text-accent-soft-fg
  - Badge de status: Agendado (primary-soft) | Realizado (success-soft) | Cancelado (muted)
  - Botões de ação: ✓ Confirmar (Agendado→Realizado) | ✗ Cancelar

Estado vazio: card com "Nenhum atendimento registrado ainda. Vá até um paciente para registrar."
```

### Página `/agenda`
```
Eyebrow: "PRÓXIMOS"
Título: "Agenda"
Subtítulo: "Agendamentos e atendimentos domiciliares."
CTA: "Novo agendamento" (btn-secondary)

Lista de agenda-item por data:
  - Rótulo de data entre grupos (ex: "hoje, 23 de abril")
  - SessionCard por cada agendamento
```

### Formulário SOAP (`/pacientes/:id/sessoes/nova`)
```
Campos:
  Data e hora     → input datetime-local
  Duração (min)   → input number
  Tipo            → select (Presencial | Domiciliar)
  Status          → select (Agendado | Realizado)

Seção SOAP (tabs ou accordion):
  S — Subjetivo   → textarea "Queixa principal e sintomas relatados pelo paciente"
  O — Objetivo    → textarea "Achados clínicos, resultados de testes e medidas"
  A — Avaliação   → textarea "Diagnóstico funcional e hipótese clínica"
  P — Plano       → textarea "Condutas, exercícios prescritos e próximos passos"

Botões: "Cancelar" (ghost) | "Salvar atendimento" (btn-primary/accent)
```

---

## Testes

```
src/server/modules/sessions/application/
  create-session.test.ts   → cria sessão, rejeita patientId de outro userId
  update-session.test.ts   → atualiza campos SOAP, muda status Agendado→Realizado
  list-sessions.test.ts    → filtra por userId, por patientId, por status
```

Coberturas mínimas esperadas:
- `createSession`: dados válidos, `patientId` de outro usuário (deve lançar erro)
- `updateSession`: campos SOAP parciais salvos corretamente
- `listSessions`: isolamento multi-tenant verificado

---

## Seed — Extensão com Sessões

Adicionar ao `prisma/seed.ts` (após criação dos pacientes da Phase 3):

```typescript
const now = new Date()
const days = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000)

// Sessões do Gervasio — histórico + agendado
await prisma.session.createMany({
  data: [
    {
      userId: user.id, patientId: gervasio.id,
      date: days(14), duration: 60, type: 'PRESENTIAL', status: 'REALIZADO',
      subjective: 'Paciente relata melhora da dor lombar. EVA 4/10.',
      objective:  'Teste de Lasègue negativo bilateralmente. Força muscular 4/5 em flexores de tronco.',
      assessment: 'Evolução positiva. Mantendo ganho de ADM lombar.',
      plan:       'Progredir carga nos exercícios de estabilização. Manter frequência semanal.',
    },
    {
      userId: user.id, patientId: gervasio.id,
      date: days(7), duration: 60, type: 'PRESENTIAL', status: 'REALIZADO',
      subjective: 'Sem queixas de dor em repouso. Dor leve ao esforço (EVA 2/10).',
      objective:  'Mobilidade lombar 80% do esperado para a idade. Sem sinais neurológicos.',
      assessment: 'Alta funcional próxima. Considerar espaçamento das sessões.',
      plan:       'Iniciar programa de manutenção domiciliar. Retorno em 15 dias.',
    },
    {
      userId: user.id, patientId: gervasio.id,
      date: days(-3), duration: 60, type: 'PRESENTIAL', status: 'AGENDADO',
    },
  ],
})

// Sessões da Carla — domiciliar
await prisma.session.createMany({
  data: [
    {
      userId: user.id, patientId: carla.id,
      date: days(10), duration: 90, type: 'HOME_CARE', status: 'REALIZADO',
      subjective: 'Paciente relata fadiga intensa. Dor difusa 6/10.',
      objective:  'Pontos de dor em 12/18 locais. Sono não reparador.',
      assessment: 'Fibromialgia ativa. Resposta parcial ao tratamento.',
      plan:       'Técnicas de relaxamento miofascial. Orientar higiene do sono.',
    },
    {
      userId: user.id, patientId: carla.id,
      date: days(-1), duration: 90, type: 'HOME_CARE', status: 'AGENDADO',
    },
  ],
})

// Rafael — sem sessão recente (dispara alerta de 30+ dias no dashboard)
await prisma.session.create({
  data: {
    userId: user.id, patientId: rafael.id,
    date: days(45), duration: 45, type: 'PRESENTIAL', status: 'REALIZADO',
    subjective: 'Dor ao movimento ativo do joelho. EVA 5/10.',
    objective:  'ADM joelho D: flexão 90°, extensão -10°. Edema leve.',
    assessment: 'Pós-op LCA em fase subaguda. Evolução dentro do esperado.',
    plan:       'Crioterapia. Exercícios isométricos de quadríceps. Retorno em 1 semana.',
  },
})

console.log(`   Sessões: Gervasio (3), Carla (2), Rafael (1 — sem retorno há 45 dias)`)
```

**Após rodar o seed, o dashboard mostrará:**
- Pacientes ativos: 3
- Atendimentos hoje: 0
- Sem retorno (30+ dias): 1 (Rafael)
- Atendimentos recentes: últimas sessões de Gervasio e Carla

---

## Checklist Final
- [ ] Migration aplicada com sucesso (`npx prisma migrate dev`)
- [ ] `npx prisma db seed` estendido com sessões — roda sem erros
- [ ] Dashboard mostra Rafael no alerta de "sem retorno" após o seed
- [ ] `npm test` passa com todos os testes de sessions
- [ ] CRUD de sessões funciona via API (testar com curl)
- [ ] Página `/atendimentos` lista sessões com badges corretos
- [ ] Página `/agenda` agrupa por data e mostra próximos
- [ ] Formulário SOAP salva todos os 4 campos + metadados
- [ ] Badge "Domiciliar" aparece em sessões `HOME_CARE`
- [ ] Sessões isoladas por `userId` (multi-tenant verificado)
- [ ] `.docs/CONTEXT.md` atualizado
- [ ] `README.md` atualizado (Phase 4 marcada como ✅)
- [ ] `.docs/CHANGELOG.md` atualizado
- [ ] `.docs/api/sessions.md` criado
- [ ] `.docs/domain/sessions.md` criado

## Notas para Próxima Sessão
Com sessões registradas, a Phase 5 (Dashboard) pode agregar os dados:
`Session` é a fonte dos KPIs (atendimentos hoje, pacientes ativos, sem retorno).
O campo `date` + `status` é o que alimenta o gráfico de evolução semanal.
