# Task: Phase 16 — Pagamentos e Cobrança

## Status

- [ ] Todo
- [ ] In Progress
- [x] Done

## Contexto

Com `TreatmentPlan` em produção (Phase 15), o usuário consegue agrupar sessões em planos
avulsos ou pacotes — mas ainda não há valores reais nem pagamentos. Esta fase introduz
o modelo `Payment` e snapshots de valor na sessão (`expectedFee`), permitindo registrar
quando e como o paciente pagou.

A decisão arquitetural está em
[ADR-005](../decisions/ADR-005-multi-modalidade-financeiro.md). Pré-requisito: Phase 15
concluída.

## Objetivo

Permitir que o usuário:

1. Defina valores em planos (sessão avulsa) ou em pacotes (valor total + número de sessões)
2. Registre pagamentos vinculados a uma sessão (avulso) ou a um plano (pacote)
3. Suporte pagamento à vista ou parcelado em planos do tipo PACKAGE
4. Veja status de pagamento por sessão e por plano (saldo, pago, pendente)

## Escopo

### Backend — Migration

- [ ] Criar enum `PaymentMethod` com `PIX`, `CASH`, `CREDIT_CARD`, `DEBIT_CARD`,
      `BANK_TRANSFER`, `INSURANCE`, `OTHER`
- [ ] Criar enum `PaymentStatus` com `PAID`, `PENDING`, `PARTIAL`, `REFUNDED`
- [ ] Criar modelo `Payment`
- [ ] Adicionar `expectedFee: Decimal?` em `Session`
- [ ] Adicionar `paymentStatus: PaymentStatus?` em `Session` (cache derivado)
- [ ] Adicionar relação reversa `payments` em `User`, `TreatmentPlan` e `Session`
- [ ] Constraint: `Payment.treatmentPlanId` ou `Payment.sessionId` precisa ser
      preenchido (XOR — exatamente um dos dois)

### Backend — Backfill / cálculo de `expectedFee`

- [ ] Para sessões existentes vinculadas a um plano `PER_SESSION`:
  - copiar `plan.sessionPrice` para `Session.expectedFee`
- [ ] Para sessões vinculadas a plano `PACKAGE`:
  - `Session.expectedFee = NULL` (já coberta pelo pacote)
- [ ] Para sessões avulsas (sem plano):
  - `Session.expectedFee = workplace.defaultSessionPrice` ou `NULL`
- [ ] Inicializar `Session.paymentStatus`:
  - `PAID` se houver `Payment(PAID)` vinculado
  - `PENDING` em todos os outros casos onde `expectedFee > 0`
  - `NULL` quando coberta por pacote sem custo direto na sessão

### Backend — Use Cases

- [ ] `registerPaymentUseCase` — cria `Payment` (avulso ou de pacote)
- [ ] `voidPaymentUseCase` — marca `Payment` como `REFUNDED` (não deleta)
- [ ] `listPaymentsUseCase` — filtros por período, plano, paciente, status
- [ ] `getTreatmentPlanFinancialsUseCase` — retorna saldo do plano:
      `{ totalDue, totalPaid, totalPending, sessionsUsed, sessionsRemaining }`
- [ ] `recomputeSessionPaymentStatusUseCase` — chamado após criar/editar payment
- [ ] Atualizar `createSessionUseCase`:
  - quando vinculada a plano PER_SESSION, snapshotar `expectedFee = plan.sessionPrice`
  - quando avulsa, aceitar `expectedFee` no DTO (com default do workplace se omitido)
  - quando vinculada a plano PACKAGE, gravar `expectedFee = null`
- [ ] Atualizar `createTreatmentPlanUseCase` para PACKAGE:
  - aceitar parâmetro opcional `installments` (1 = à vista, N = parcelas)
  - se à vista, criar 1 `Payment(PENDING)` com `dueAt=startsAt` e
    `amount=packageAmount`
  - se parcelado, criar N `Payment(PENDING)` com `dueAt` distribuído mensalmente
  - alternativamente: deixar criação dos pagamentos opt-in via fluxo de UI separado
    (ver Decisões abaixo)

### Backend — HTTP

- [ ] `POST /api/treatment-plans/:id/payments` — registrar pagamento de pacote
- [ ] `POST /api/sessions/:id/payments` — registrar pagamento avulso
- [ ] `GET /api/payments?from&to&patientId&planId&status` — listar pagamentos
- [ ] `GET /api/treatment-plans/:id/financials` — saldo do plano
- [ ] `PUT /api/payments/:id` — editar (data, método, valor)
- [ ] `DELETE /api/payments/:id` — soft delete (marca como `REFUNDED`)

### Frontend

- [ ] No `TreatmentPlanCard`:
  - badge de saldo (PACKAGE: "R$ 350 / R$ 1.200 pago", PER_SESSION: "8 sessões pagas")
  - botão "Registrar pagamento"
- [ ] Modal `RegisterPaymentModal`:
  - campos: amount, method, paidAt (default hoje), notes
  - quando aberto a partir de plano PACKAGE com pagamentos PENDING, oferece
    "marcar parcela como paga" (preenche amount e dueAt automaticamente)
- [ ] No `SessionCard`:
  - badge de pagamento: `Pago`, `Pendente`, `Parcial` (cores: verde/âmbar/cinza)
  - se sessão avulsa pendente, ação rápida "Registrar pagamento"
- [ ] No `SessionForm`:
  - se plano PER_SESSION ou avulso, mostrar campo `expectedFee` editável
  - se plano PACKAGE, mostrar texto "Coberta pelo pacote" (não editável)
- [ ] Aba "Financeiro" na ficha `/pacientes/:id`:
  - histórico de pagamentos do paciente
  - saldo aberto agregado
- [ ] Componentes:
  - `PaymentBadge`
  - `PlanBalanceBadge`
  - `RegisterPaymentModal`
  - `PaymentHistoryTable`

### Seed

- [ ] Atualizar `prisma/seed.ts` com cenário financeiro:
  - paciente com pacote 10 sessões, 4 já pagas, 4 pendentes (à vista, parcelado)
  - paciente com avulso PER_SESSION, mistura de sessões pagas e pendentes
  - paciente com plano PACKAGE 100% pago

## Fora de Escopo

- Dashboard agregado (Phase 17)
- Notificação automática de parcela vencida
- Cobrança via gateway (Pix QR Code, link de pagamento)
- Conciliação bancária
- Emissão de recibo / nota fiscal
- Multi-moeda
- Comissão líquida nos relatórios (`defaultCommissionPct` ainda só armazenada)
- Reembolso parcial vinculado a pacotes (RBR avançada)

## Decisões Arquiteturais

- [ADR-005](../decisions/ADR-005-multi-modalidade-financeiro.md) — Multi-modalidade
  clínica e acompanhamento financeiro

### Decisões locais desta fase

- **Geração de parcelas para PACKAGE:** primeira versão **não** cria pagamentos pendentes
  automaticamente ao criar o plano. O usuário registra cada pagamento manualmente. Isso
  evita pendências fantasma para casos onde o paciente paga "como der". Caso o usuário
  precise de schedule de parcelas, virá em fase posterior.
- **`Session.paymentStatus` é cache derivado**, não fonte da verdade. Verdade está em
  `Payment` + `Session.expectedFee`. O cache existe só para evitar joins em listagens.
- **`expectedFee` é snapshot.** Mudar o `sessionPrice` do plano não retroage em sessões
  já criadas.
- **Soft delete em Payment** via `status=REFUNDED`. Manter histórico para auditoria.

## Contratos

### HTTP

```
POST /api/treatment-plans/:id/payments
Body: {
  amount: number,        // valor em reais (decimal)
  method: PaymentMethod,
  paidAt: string,        // ISO date
  notes?: string
}
Response 201: { payment: Payment, plan: TreatmentPlan }
```

```
POST /api/sessions/:id/payments
Body: {
  amount: number,
  method: PaymentMethod,
  paidAt: string,
  notes?: string
}
Response 201: { payment: Payment, session: Session }
```

```
GET /api/payments?from=YYYY-MM-DD&to=YYYY-MM-DD&patientId=&planId=&status=
Response 200: { payments: Payment[] }
```

```
GET /api/treatment-plans/:id/financials
Response 200: {
  totalDue: number,         // packageAmount ou soma de expectedFee de sessões
  totalPaid: number,
  totalPending: number,
  sessionsUsed: number,
  sessionsRemaining: number,
  payments: Payment[]
}
```

```
PUT /api/payments/:id
Body: Partial<{ amount, method, paidAt, notes, status }>
Response 200: { payment: Payment }
```

```
DELETE /api/payments/:id
Response 200: { payment: Payment }   // status = REFUNDED
```

### Interno

```typescript
registerPaymentUseCase(input: {
  userId: string
  treatmentPlanId?: string
  sessionId?: string         // exatamente um dos dois
  amount: Decimal
  method: PaymentMethod
  paidAt: Date
  notes?: string
}): Promise<Payment>
```

```typescript
getTreatmentPlanFinancialsUseCase(input: {
  userId: string
  planId: string
}): Promise<{
  totalDue: Decimal
  totalPaid: Decimal
  totalPending: Decimal
  sessionsUsed: number
  sessionsRemaining: number | null    // null se PER_SESSION sem totalSessions
  payments: Payment[]
}>
```

## Migrations

```prisma
enum PaymentMethod {
  PIX
  CASH
  CREDIT_CARD
  DEBIT_CARD
  BANK_TRANSFER
  INSURANCE
  OTHER
}

enum PaymentStatus {
  PAID
  PENDING
  PARTIAL
  REFUNDED
}

model Payment {
  id              String        @id @default(cuid())
  userId          String
  treatmentPlanId String?
  sessionId       String?

  amount   Decimal       @db.Decimal(10, 2)
  method   PaymentMethod
  status   PaymentStatus @default(PAID)
  paidAt   DateTime
  dueAt    DateTime?

  notes      String?
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt

  user          User           @relation(fields: [userId], references: [id])
  treatmentPlan TreatmentPlan? @relation(fields: [treatmentPlanId], references: [id])
  session       Session?       @relation(fields: [sessionId], references: [id])

  @@index([userId])
  @@index([userId, paidAt])
  @@index([userId, treatmentPlanId])
  @@index([userId, sessionId])
  @@index([userId, status, dueAt])
}

// Adicionar ao model Session:
// expectedFee   Decimal?       @db.Decimal(10, 2)
// paymentStatus PaymentStatus?
// payments      Payment[]

// Adicionar ao model TreatmentPlan:
// payments Payment[]

// Adicionar ao model User:
// payments Payment[]
```

Validação XOR de `treatmentPlanId` vs `sessionId` em raw SQL:

```sql
ALTER TABLE "Payment" ADD CONSTRAINT "payment_target_xor"
  CHECK (
    ("treatmentPlanId" IS NOT NULL AND "sessionId" IS NULL)
    OR
    ("treatmentPlanId" IS NULL AND "sessionId" IS NOT NULL)
  );
```

## UI

- [ ] Modal: `RegisterPaymentModal`
- [ ] Componente: `PaymentBadge`
- [ ] Componente: `PlanBalanceBadge`
- [ ] Componente: `PaymentHistoryTable`
- [ ] Página: `/pacientes/:id` (aba "Financeiro")
- [ ] Atualizar: `TreatmentPlanCard` (saldo + botão registrar pagamento)
- [ ] Atualizar: `SessionCard` (badge de pagamento + ação rápida)
- [ ] Atualizar: `SessionForm` (campo expectedFee ou texto "coberta pelo pacote")

## Checklist Final

- [ ] Migration `phase16_payments` criada e aplicada
- [ ] Backfill de `expectedFee` rodado
- [ ] CRUD de Payment funciona (criar, listar, editar, refund)
- [ ] Saldo do plano calcula corretamente
- [ ] Sessão avulsa permite registrar pagamento
- [ ] Sessão de pacote PACKAGE não permite pagamento direto (cobrado no plano)
- [ ] `Session.paymentStatus` atualiza após registrar/refund
- [ ] Multi-tenant em todas as queries
- [ ] Seed atualizado com cenários financeiros
- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` passa sem erros
- [ ] Testes unitários do módulo `payments`
- [ ] `.docs/CONTEXT.md` atualizado
- [ ] `README.md` atualizado
- [ ] `.docs/CHANGELOG.md` atualizado
- [ ] Validação manual no browser

## Notas para Próxima Sessão

A Phase 17 vai consumir essas tabelas para o dashboard financeiro. Garantir que os
índices `(userId, paidAt)` e `(userId, status, dueAt)` estão criados — são os principais
caminhos de leitura das agregações.

Considerar se `expectedFee` deveria virar tabela `SessionFee` separada para suportar
descontos parciais e múltiplos itens cobrados por sessão. **Decisão atual:** não, manter
campo único na sessão. Se aparecer necessidade real de itens, virar tabela depois.
