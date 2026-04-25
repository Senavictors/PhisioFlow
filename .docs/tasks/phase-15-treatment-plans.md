# Task: Phase 15 — Plano de Tratamento e Multi-modalidade

## Status

- [ ] Todo
- [ ] In Progress
- [x] Done

## Contexto

O paciente real é atendido em **múltiplas modalidades simultaneamente** (Pilates +
Ortopédica + Estética, por exemplo). O modelo `Patient.area: TherapyArea` força um único
valor e impede esse mundo. Esta fase introduz o `TreatmentPlan` como o lugar onde área,
especialidades, tipo de atendimento e local convivem por tratamento — não por paciente.

A documentação clínica de referência está em `.docs/fisioterapia-areas.md`. A decisão
arquitetural completa está em [ADR-005](../decisions/ADR-005-multi-modalidade-financeiro.md).

Pré-requisito: Phase 14 concluída (Workplaces existem, sessões já têm `workplaceId` e
`attendanceType`).

## Objetivo

Permitir que cada paciente tenha **N planos de tratamento** ativos, cada um com uma área,
especialidades, tipo de atendimento, local e modelo de cobrança (avulso ou pacote — sem
o financeiro real ainda, que vem na Phase 16). Todas as sessões existentes ficam
vinculadas a um plano legado. Remover `Patient.area` e `Session.type` do schema.

## Escopo

### Backend — Migration

- [x] Expandir enum `TherapyArea` com `ORTOPEDICA`, `NEUROLOGICA`, `CARDIORESPIRATORIA`,
      `ESTETICA`, `ESPORTIVA`, `PELVICA`, `PEDIATRICA`, `GERIATRICA`, `PREVENTIVA`, `OUTRA`
- [x] Criar enum `Specialty` com `PILATES`, `RPG`, `ACUPUNTURA`, `LIBERACAO_MIOFASCIAL`,
      `VENTOSATERAPIA`, `DRY_NEEDLING`, `TERAPIA_MANUAL`, `OUTRA`
- [x] Criar enum `PricingModel` com `PER_SESSION`, `PACKAGE`
- [x] Criar enum `PlanStatus` com `ACTIVE`, `COMPLETED`, `CANCELED`, `PAUSED`
- [x] Criar modelo `TreatmentPlan`
- [x] Adicionar `treatmentPlanId: String?` em `Session`
- [x] Adicionar relação reversa `treatmentPlans` em `User` e `Patient`
- [x] Adicionar relação reversa `sessions` em `TreatmentPlan`

### Backend — Backfill

Em script idempotente executado depois da migration:

- [x] Para cada `Patient` ativo, criar 1 `TreatmentPlan` legado:
  - `area` derivado do `Patient.area` antigo:
    - `MOTOR` → `ORTOPEDICA`
    - `AESTHETIC` → `ESTETICA`
    - `PILATES` → `ORTOPEDICA` com `specialties=[PILATES]`
    - `HOME_CARE` → `ORTOPEDICA` com `attendanceType=HOME_CARE`
  - `specialties` derivadas conforme regra acima (lista vazia se nada se encaixa)
  - `attendanceType` herdado da maioria das sessões do paciente, ou `CLINIC` como fallback
  - `workplaceId` = workplace default do usuário (criado na Phase 14)
  - `pricingModel = PER_SESSION`
  - `status = ACTIVE`
  - `notes` carrega marca "Plano legado migrado de v14"
- [x] Vincular todas as `Session` existentes do paciente ao plano legado
- [x] Validar que toda sessão tem `treatmentPlanId` antes de prosseguir

### Backend — Migration de fechamento

- [x] Remover `Patient.area`
- [x] Remover `Session.type` e enum `SessionType`
- [x] Tornar `Session.workplaceId` `NOT NULL`
- [x] Tornar `Session.attendanceType` `NOT NULL`
- [x] Descontinuar valores antigos do enum `TherapyArea` (`MOTOR`, `AESTHETIC`, `PILATES`,
      `HOME_CARE`) — substituir por nova versão do enum

### Backend — Use Cases

- [x] `createTreatmentPlanUseCase`
- [x] `listPatientTreatmentPlansUseCase`
- [x] `getTreatmentPlanUseCase`
- [x] `updateTreatmentPlanUseCase`
- [x] `archiveTreatmentPlanUseCase`
- [x] `pauseTreatmentPlanUseCase`
- [x] `completeTreatmentPlanUseCase`
- [x] Atualizar `createSessionUseCase` para aceitar `treatmentPlanId?` (opcional)
  - se preenchido, valida ownership + que o plano não está `COMPLETED`/`CANCELED`
  - se preenchido, herda `area`/`workplaceId`/`attendanceType` do plano (overridable)
  - se omitido, sessão é avulsa (caminho permitido)
- [x] Atualizar `updateSessionUseCase` para aceitar mudança de plano
- [x] Multi-tenant: toda query de plan filtra por `userId`

### Backend — HTTP

- [x] `POST /api/patients/:id/treatment-plans`
- [x] `GET /api/patients/:id/treatment-plans`
- [x] `GET /api/treatment-plans/:id`
- [x] `PUT /api/treatment-plans/:id`
- [x] `POST /api/treatment-plans/:id/pause`
- [x] `POST /api/treatment-plans/:id/complete`
- [x] `DELETE /api/treatment-plans/:id` (soft cancel via status `CANCELED`)
- [x] Atualizar `POST /api/sessions` e `PUT /api/sessions/:id` com `treatmentPlanId?`

### Frontend

- [x] Remover campo "Área" do `PatientForm`
- [x] Remover badge de área da listagem `/pacientes` e da ficha
- [x] Adicionar seção "Planos de tratamento" na ficha `/pacientes/:id`:
  - Lista os planos com badge de área, especialidades, tipo, local, status
  - Botão "Novo plano"
  - Em cada plano: contador "X de Y sessões" (se PACKAGE) e ações editar/pausar/concluir
- [x] Página `/pacientes/:id/planos/novo` — formulário de criação de plano
- [x] Página `/pacientes/:id/planos/:planId/editar`
- [x] Componentes:
  - `TreatmentPlanCard` (resumo do plano com badges)
  - `TreatmentPlanForm` (criar/editar)
  - `AreaBadge`, `SpecialtyBadges`, `AttendanceTypeBadge`
- [x] No `SessionForm`:
  - Após escolher paciente, dropdown "Plano" com planos ativos do paciente +
    opção "Avulso"
  - Se plano selecionado, área/especialidades/local/tipo são pré-preenchidos
    (campos exibidos como herdados; podem ser sobrescritos individualmente)
  - Se "Avulso", os campos são preenchidos manualmente
- [x] No `SessionCard`, mostrar badge de plano (área + especialidades em forma compacta)
      ou "Avulso"

### Filtros e listagens

- [x] Atualizar filtros de `/pacientes` para permitir buscar por área **dos planos
      ativos** (não mais `Patient.area`)
- [x] Atualizar filtros de `/atendimentos` para permitir filtrar por área e tipo de
      atendimento usando os campos atuais da sessão

### Seed

- [x] Atualizar `prisma/seed.ts` para criar planos demonstrando multi-modalidade:
  - 1 paciente com 2 planos ativos: Ortopédica (per session) + Pilates (pacote)
  - 1 paciente apenas com plano Estética
  - 1 paciente sem plano (sessões avulsas)
- [x] Vincular sessões existentes do seed aos planos

## Fora de Escopo

- Pagamentos / valores reais (Phase 16)
- Dashboard financeiro (Phase 17)
- Especialidades cadastráveis pelo usuário
- Templates de plano (planos padrão para reutilizar)
- Análise de evolução por plano específico
- Mudança de plano em sessões já realizadas (apenas plano em sessões agendadas)
- Notificações de plano expirando

## Decisões Arquiteturais

- [ADR-005](../decisions/ADR-005-multi-modalidade-financeiro.md) — Multi-modalidade clínica
  e acompanhamento financeiro

## Contratos

### HTTP

```
POST /api/patients/:id/treatment-plans
Body: {
  workplaceId: string,
  area: TherapyArea,
  specialties: Specialty[],
  attendanceType: AttendanceType,
  pricingModel: 'PER_SESSION' | 'PACKAGE',
  // se PER_SESSION:
  sessionPrice?: number,
  // se PACKAGE:
  totalSessions?: number,
  packageAmount?: number,
  startsAt?: string,
  endsAt?: string,
  notes?: string
}
Response 201: { plan: TreatmentPlan }
```

```
GET /api/patients/:id/treatment-plans?status=ACTIVE
Response 200: { plans: TreatmentPlan[] }
```

```
PUT /api/treatment-plans/:id
Body: Partial<CreateTreatmentPlanDTO>
Response 200: { plan: TreatmentPlan }
```

```
POST /api/treatment-plans/:id/pause
Response 200: { plan: TreatmentPlan }   // status = PAUSED
```

```
POST /api/treatment-plans/:id/complete
Response 200: { plan: TreatmentPlan }   // status = COMPLETED
```

```
DELETE /api/treatment-plans/:id
Response 200: { plan: TreatmentPlan }   // status = CANCELED
```

### Interno

```typescript
createTreatmentPlanUseCase(input: {
  userId: string
  patientId: string
  workplaceId: string
  area: TherapyArea
  specialties: Specialty[]
  attendanceType: AttendanceType
  pricingModel: PricingModel
  sessionPrice?: Decimal
  totalSessions?: number
  packageAmount?: Decimal
  startsAt?: Date
  endsAt?: Date
  notes?: string
}): Promise<TreatmentPlan>
```

```typescript
listPatientTreatmentPlansUseCase(input: {
  userId: string
  patientId: string
  status?: PlanStatus
}): Promise<TreatmentPlan[]>
```

## Migrations

### Migration 1 — Adições

```prisma
enum TherapyArea {
  ORTOPEDICA
  NEUROLOGICA
  CARDIORESPIRATORIA
  ESTETICA
  ESPORTIVA
  PELVICA
  PEDIATRICA
  GERIATRICA
  PREVENTIVA
  OUTRA
  // valores legados mantidos temporariamente:
  PILATES
  MOTOR
  AESTHETIC
  HOME_CARE
}

enum Specialty {
  PILATES
  RPG
  ACUPUNTURA
  LIBERACAO_MIOFASCIAL
  VENTOSATERAPIA
  DRY_NEEDLING
  TERAPIA_MANUAL
  OUTRA
}

enum PricingModel {
  PER_SESSION
  PACKAGE
}

enum PlanStatus {
  ACTIVE
  COMPLETED
  CANCELED
  PAUSED
}

model TreatmentPlan {
  id              String         @id @default(cuid())
  userId          String
  patientId       String
  workplaceId     String
  area            TherapyArea
  specialties     Specialty[]
  attendanceType  AttendanceType
  pricingModel    PricingModel   @default(PER_SESSION)
  status          PlanStatus     @default(ACTIVE)

  // PER_SESSION
  sessionPrice    Decimal?       @db.Decimal(10, 2)

  // PACKAGE
  totalSessions   Int?
  packageAmount   Decimal?       @db.Decimal(10, 2)

  startsAt        DateTime?
  endsAt          DateTime?
  notes           String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  user      User      @relation(fields: [userId], references: [id])
  patient   Patient   @relation(fields: [patientId], references: [id])
  workplace Workplace @relation(fields: [workplaceId], references: [id])
  sessions  Session[]

  @@index([userId])
  @@index([userId, patientId])
  @@index([userId, status])
  @@index([userId, patientId, status])
}

// Adicionar ao model Session:
// treatmentPlanId String?
// treatmentPlan   TreatmentPlan? @relation(fields: [treatmentPlanId], references: [id])
```

### Migration 2 — Fechamento (após backfill)

```sql
-- Remover Patient.area
ALTER TABLE "Patient" DROP COLUMN "area";

-- Remover Session.type
ALTER TABLE "Session" DROP COLUMN "type";
DROP TYPE "SessionType";

-- Tornar workplaceId e attendanceType obrigatórios
ALTER TABLE "Session" ALTER COLUMN "workplaceId" SET NOT NULL;
ALTER TABLE "Session" ALTER COLUMN "attendanceType" SET NOT NULL;

-- Limpar valores legados do enum TherapyArea (criar enum novo e migrar)
-- Postgres não permite remover valor de enum diretamente; criar enum novo e migrar.
```

## UI

- [x] Página: `/pacientes/:id` (seção "Planos de tratamento")
- [x] Página: `/pacientes/:id/planos/novo`
- [x] Página: `/pacientes/:id/planos/:planId/editar`
- [x] Componente: `TreatmentPlanCard`
- [x] Componente: `TreatmentPlanForm`
- [x] Componente: `AreaBadge`
- [x] Componente: `SpecialtyBadges`
- [x] Componente: `AttendanceTypeBadge`
- [x] Atualizar: `PatientForm` (remover campo área)
- [x] Atualizar: `SessionForm` (seletor de plano + override)
- [x] Atualizar: `SessionCard` (badge de plano)
- [x] Atualizar: filtros em `/pacientes` e `/atendimentos`

## Checklist Final

- [x] Migration `phase15a_treatment_plans` (adições) criada
- [x] Backfill implementado na migration (todo paciente com sessões recebe plano legado)
- [x] Migration `phase15b_drop_patient_area_and_session_type` criada
- [x] Patient sem campo `area`
- [x] Session sem campo `type`
- [x] Session com `workplaceId` e `attendanceType` NOT NULL
- [x] CRUD de plano funciona
- [x] `SessionForm` com seletor de plano (ou avulso)
- [x] Multi-tenant em todas as queries
- [x] Seed atualizado demonstrando multi-modalidade
- [x] `npm run lint` passa sem erros
- [x] `npm run build` passa sem erros
- [x] Testes unitários do módulo `treatment-plans`
- [x] `.docs/CONTEXT.md` atualizado
- [x] `README.md` atualizado
- [x] `.docs/CHANGELOG.md` atualizado
- [ ] Validação manual no browser

## Notas para Próxima Sessão

A Phase 16 entra com o financeiro real (`Payment`, `expectedFee` snapshot). Importante
deixar a entidade `TreatmentPlan` pronta para receber o vínculo com `Payment` mas **não**
criá-lo agora — manter o escopo enxuto desta phase.

Se o backfill encontrar paciente sem sessões, criar plano legado mesmo assim ou pular?
**Decisão:** pular pacientes sem sessões — eles podem cadastrar plano sob demanda.
Pacientes arquivados (`isActive=false`) também ficam sem plano legado.
