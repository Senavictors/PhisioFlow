# Task: Phase 14 — Locais de Trabalho e Desacoplamento de Atendimento

## Status

- [x] Done

## Contexto

O fisioterapeuta autônomo geralmente atende em **mais de um local**: própria clínica,
clínicas parceiras, atendimento particular (domiciliar) e online. Hoje o PhysioFlow não
tem entidade de "Local de Trabalho", e o `Session.type` só distingue PRESENTIAL vs
HOME_CARE — insuficiente para representar Clínica X, Clínica Y, particular ou online.

Esta fase prepara o terreno para a Phase 15 (Plano de Tratamento) introduzindo o conceito
de **Workplace** e atualizando `Session` com `workplaceId` e `attendanceType`. Ainda mantém
`Patient.area` e `Session.type` em coexistência — esses serão removidos na Phase 15
junto com a criação dos planos.

## Objetivo

Permitir que o usuário cadastre seus locais de trabalho com defaults próprios (tipo de
atendimento, valor padrão, comissão default) e que toda sessão criada/editada referencie
um local. Manter operação atual sem regressão.

## Escopo

### Backend — Migration

- [ ] Criar enum `WorkplaceKind` com `OWN_CLINIC`, `PARTNER_CLINIC`, `PARTICULAR`, `ONLINE`
- [ ] Criar enum `AttendanceType` com `CLINIC`, `HOME_CARE`, `HOSPITAL`, `CORPORATE`, `ONLINE`
- [ ] Criar modelo `Workplace`
- [ ] Adicionar `workplaceId: String?` em `Session` (nullable nesta fase)
- [ ] Adicionar `attendanceType: AttendanceType?` em `Session` (nullable nesta fase)
- [ ] Adicionar relação reversa `workplaces` no modelo `User`
- [ ] Adicionar relação reversa `sessions` no modelo `Workplace`
- [ ] Manter `Session.type: SessionType` por compatibilidade (será removido na Phase 15)

### Backend — Backfill

- [ ] Script de backfill que para cada `User` ativo:
  - cria 1 `Workplace` default com `name="Meu consultório"`,
    `kind=OWN_CLINIC`, `defaultAttendanceType=CLINIC`, `isActive=true`
- [ ] Script de backfill em `Session`:
  - vincula todas as sessões ao workplace default do usuário
  - copia `Session.type` para `Session.attendanceType`:
    - `PRESENTIAL` → `CLINIC`
    - `HOME_CARE` → `HOME_CARE`
- [ ] Backfill executado dentro da própria migration (raw SQL em
      `prisma/migrations/.../migration.sql`) ou em script separado idempotente

### Backend — Use Cases

- [ ] `createWorkplaceUseCase`
- [ ] `listWorkplacesUseCase`
- [ ] `getWorkplaceUseCase`
- [ ] `updateWorkplaceUseCase`
- [ ] `archiveWorkplaceUseCase` (soft delete via `isActive`)
- [ ] Atualizar `createSessionUseCase` para aceitar `workplaceId` e `attendanceType`
  - se omitido, usa o primeiro workplace ativo do usuário
- [ ] Atualizar `updateSessionUseCase` para permitir mudar `workplaceId` e `attendanceType`
- [ ] Validação de ownership: `workplaceId` da sessão deve pertencer ao mesmo `userId`

### Backend — HTTP

- [ ] `POST /api/workplaces`
- [ ] `GET /api/workplaces`
- [ ] `GET /api/workplaces/:id`
- [ ] `PUT /api/workplaces/:id`
- [ ] `DELETE /api/workplaces/:id` (archive)
- [ ] Atualizar DTOs Zod de `POST /api/sessions` e `PUT /api/sessions/:id` para incluir
      `workplaceId` (opcional) e `attendanceType` (opcional)

### Frontend

- [ ] Criar página `/configuracoes/locais` (lista + CRUD)
- [ ] Atualizar `src/proxy.ts` (já protege `/configuracoes`)
- [ ] Componente `WorkplaceCard` com nome, kind badge, tipo default, ações editar/arquivar
- [ ] Componente `WorkplaceForm` (criar/editar)
- [ ] Adicionar seletor de workplace no `SessionForm` (atendimento)
- [ ] Adicionar seletor de `attendanceType` no `SessionForm` (com default do workplace)
- [ ] No `SessionCard`, mostrar nome do workplace em texto secundário
- [ ] Link "Locais de trabalho" na sidebar (dentro de Configurações)

### Seed

- [ ] Atualizar `prisma/seed.ts` para criar pelo menos 2 workplaces no usuário demo:
  - "Clínica Movimento" (OWN_CLINIC)
  - "Atendimento Particular" (PARTICULAR)
- [ ] Vincular sessões existentes do seed aos workplaces de forma plausível

## Fora de Escopo

- Plano de tratamento (Phase 15)
- Pagamentos (Phase 16)
- Dashboard financeiro (Phase 17)
- Cálculo de comissão líquida (`defaultCommissionPct` é gravado mas não usado ainda)
- Remover `Patient.area` ou `Session.type` (acontece na Phase 15)
- Permissões para múltiplos usuários no mesmo workplace
- Geolocalização ou mapa do workplace

## Decisões Arquiteturais

- [ADR-005](../decisions/ADR-005-multi-modalidade-financeiro.md) — Multi-modalidade clínica
  e acompanhamento financeiro

## Contratos

### HTTP

```
POST /api/workplaces
Body: {
  name: string,
  kind: 'OWN_CLINIC' | 'PARTNER_CLINIC' | 'PARTICULAR' | 'ONLINE',
  defaultAttendanceType: 'CLINIC' | 'HOME_CARE' | 'HOSPITAL' | 'CORPORATE' | 'ONLINE',
  address?: string,
  defaultSessionPrice?: number,    // em centavos ou Decimal serializado
  defaultCommissionPct?: number,    // 0..100
  notes?: string
}
Response 201: { workplace: Workplace }
```

```
GET /api/workplaces?includeArchived=false
Response 200: { workplaces: Workplace[] }
```

```
PUT /api/workplaces/:id
Body: Partial<CreateWorkplaceDTO>
Response 200: { workplace: Workplace }
```

```
DELETE /api/workplaces/:id
Response 200: { workplace: Workplace }   // isActive=false
```

```
POST /api/sessions     (atualizado)
Body: {
  patientId: string,
  date: string,
  duration: number,
  workplaceId?: string,                                    // novo
  attendanceType?: 'CLINIC'|'HOME_CARE'|'HOSPITAL'|'CORPORATE'|'ONLINE',  // novo
  type?: 'PRESENTIAL'|'HOME_CARE',                          // legado, mantido
  status?: 'AGENDADO'|'REALIZADO'|'CANCELADO',
  ...campos SOAP
}
```

### Interno

```typescript
createWorkplaceUseCase(input: {
  userId: string
  name: string
  kind: WorkplaceKind
  defaultAttendanceType: AttendanceType
  address?: string
  defaultSessionPrice?: Decimal
  defaultCommissionPct?: number
  notes?: string
}): Promise<Workplace>
```

```typescript
archiveWorkplaceUseCase(input: {
  userId: string
  workplaceId: string
}): Promise<Workplace>
```

## Migrations

```prisma
enum WorkplaceKind {
  OWN_CLINIC
  PARTNER_CLINIC
  PARTICULAR
  ONLINE
}

enum AttendanceType {
  CLINIC
  HOME_CARE
  HOSPITAL
  CORPORATE
  ONLINE
}

model Workplace {
  id                    String          @id @default(cuid())
  userId                String
  name                  String
  kind                  WorkplaceKind
  defaultAttendanceType AttendanceType
  address               String?
  defaultSessionPrice   Decimal?        @db.Decimal(10, 2)
  defaultCommissionPct  Decimal?        @db.Decimal(5, 2)
  notes                 String?
  isActive              Boolean         @default(true)
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt

  user     User      @relation(fields: [userId], references: [id])
  sessions Session[]

  @@index([userId])
  @@index([userId, isActive])
}

// Adicionar ao model User:
// workplaces Workplace[]

// Adicionar ao model Session:
// workplaceId    String?
// attendanceType AttendanceType?
// workplace      Workplace? @relation(fields: [workplaceId], references: [id])
```

## UI

- [ ] Página: `/configuracoes/locais`
- [ ] Componente: `WorkplaceCard`
- [ ] Componente: `WorkplaceForm` (criar/editar)
- [ ] Atualizar: `SessionForm` (campo workplace + attendanceType)
- [ ] Atualizar: `SessionCard` (mostrar nome do workplace)
- [ ] Atualizar: sidebar (link em Configurações)

## Checklist Final

- [ ] Migration `phase14_workplaces` criada e aplicada
- [ ] Backfill executado (todo usuário tem ao menos 1 workplace, toda sessão tem
      `workplaceId` e `attendanceType` preenchidos)
- [ ] CRUD de workplace funciona (criar, listar, editar, arquivar)
- [ ] `SessionForm` permite escolher workplace e attendance type
- [ ] `SessionCard` mostra workplace
- [ ] Multi-tenant mantido em todas as queries
- [ ] Seed atualizado com workplaces demo
- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` passa sem erros
- [ ] Testes unitários do módulo `workplaces`
- [ ] `.docs/CONTEXT.md` atualizado
- [ ] `README.md` atualizado (roadmap, próximo passo)
- [ ] `.docs/CHANGELOG.md` atualizado
- [ ] Validação manual no browser

## Notas para Próxima Sessão

Phase 15 vai introduzir o `TreatmentPlan` e remover `Patient.area` + `Session.type`.
Importante manter os enums legados intactos até lá. Sessões criadas nessa fase devem
ficar consistentes nos dois mundos (campos antigos + novos preenchidos) para que a
migração seguinte possa derivar planos legados sem ambiguidade.
