# Task: Phase 17 — Dashboard Financeiro (Recebido e Previsto)

## Status

- [ ] Todo
- [ ] In Progress
- [x] Done

## Contexto

Com `Payment` e `expectedFee` em produção (Phase 16), o usuário consegue registrar
dinheiro entrando — mas ainda olha tudo isso disperso na ficha do paciente. Esta fase
entrega a **visão consolidada**: quanto entrou no dia/semana/mês e quanto está previsto
entrar com base nas sessões agendadas e parcelas a vencer.

A decisão arquitetural está em
[ADR-005](../decisions/ADR-005-multi-modalidade-financeiro.md). Pré-requisito: Phase 16
concluída.

## Objetivo

Entregar uma página `/financeiro` com:

1. Cards de "Recebido" (hoje, semana, mês) com comparativo do período anterior
2. Cards de "Previsto" (próximos 7 dias, próximos 30 dias)
3. Gráfico série temporal de recebido vs previsto
4. Quebra por **local de trabalho** (workplace) e por **área** (TherapyArea)
5. Tabela de pagamentos pendentes ordenada por `dueAt`

E expor um endpoint único `GET /api/finance/summary` que serve a página.

## Escopo

### Backend — Use Case

- [ ] Criar módulo `src/server/modules/finance/`
- [ ] `getFinanceSummaryUseCase` que retorna a estrutura completa do dashboard
- [ ] Cálculo de **recebido** no período: soma de `Payment.amount`
  - filtro: `userId`, `status=PAID`, `paidAt IN [from, to]`
- [ ] Cálculo de **previsto por agendamento**:
  - filtro: `Session.userId`, `status=AGENDADO`, `date IN [from, to]`,
    `expectedFee > 0`, sem `Payment(PAID)` vinculado
  - somar `Session.expectedFee`
- [ ] Cálculo de **previsto por pacote**:
  - filtro: `Payment.userId`, `status=PENDING`, `dueAt IN [from, to]`
  - somar `Payment.amount`
- [ ] Série temporal: agrupamento por `bucket` conforme `granularity`:
  - `day` → `date_trunc('day', ...)`
  - `week` → `date_trunc('week', ...)` (segunda-feira ISO)
  - `month` → `date_trunc('month', ...)`
- [ ] Breakdowns:
  - `byWorkplace`: soma recebido + previsto por `workplaceId` (join via plan/session)
  - `byArea`: soma recebido + previsto por `area` (do plano associado)
- [ ] Lista de pendências: top N `Payment(PENDING)` ordenados por `dueAt` ascendente
- [ ] Cache em memória opcional por `(userId, fromIso, toIso, granularity)` com TTL curto

### Backend — HTTP

- [ ] `GET /api/finance/summary?from=&to=&granularity=`
- [ ] Validação Zod do query (datas obrigatórias, granularity opcional default `day`)
- [ ] Resposta com `Decimal` serializado como string para precisão

### Frontend

- [ ] Página `/financeiro` protegida pelo proxy
- [ ] Link "Financeiro" na sidebar
- [ ] Layout:
  - linha 1: 3 cards "Recebido" (hoje / esta semana / este mês) com delta vs período
    anterior
  - linha 2: 2 cards "Previsto" (próximos 7 dias / próximos 30 dias)
  - linha 3: gráfico série temporal (linhas: recebido vs previsto)
  - linha 4: 2 painéis lado a lado — "Por local" e "Por área"
  - linha 5: tabela "Pagamentos pendentes" com nome do paciente, plano, valor, vencimento
- [ ] Filtro de período no topo (presets: hoje, 7d, 30d, mês atual, mês anterior, custom)
- [ ] Filtro de granularidade no gráfico (dia, semana, mês)
- [ ] Filtro de workplace e de área (toggleable, multi-select)
- [ ] Componentes:
  - `FinanceSummaryCard` (card de KPI com delta colorido)
  - `FinanceTimelineChart` (SVG ou Recharts; manter peso baixo)
  - `FinanceBreakdownPanel`
  - `PendingPaymentsTable`
  - `FinancePeriodPicker`
- [ ] Ações na tabela de pendências:
  - "Marcar como pago" (abre `RegisterPaymentModal` da Phase 16)
  - "Ver paciente" (link para ficha)

### Dashboard principal

- [ ] Adicionar 1 mini-card "Caixa do mês" no `/dashboard` ligando ao `/financeiro`
- [ ] Adicionar 1 mini-card "A receber este mês" no `/dashboard`
- [ ] Manter o KPI clínico existente intacto

## Fora de Escopo

- Exportação CSV/PDF do relatório financeiro (futuro)
- Cálculo de líquido com comissão da clínica parceira (futuro)
- Comparação entre múltiplos períodos lado a lado
- Forecast estatístico baseado em histórico (apenas previsto contratado)
- Conciliação bancária
- Múltiplas moedas
- Materialização de agregados em tabela (cache em memória basta na primeira versão)

## Decisões Arquiteturais

- [ADR-005](../decisions/ADR-005-multi-modalidade-financeiro.md) — Multi-modalidade
  clínica e acompanhamento financeiro

### Decisões locais desta fase

- **Cálculo on-demand** sem persistir agregados. Postgres + índices já existentes
  resolvem em base pequena/média. Materialização vira fase posterior se houver
  performance issue real.
- **Cache em memória** com TTL de ~60s por `(userId, range, granularity)` para abafar
  rajadas de filtro/troca de período. Não persistir entre requests independentes.
- **Decimal as string** no JSON: o cliente usa `Intl.NumberFormat` com locale `pt-BR`
  para apresentar.
- **Semana começa na segunda** (ISO 8601). Mês fechado dia 1.

## Contratos

### HTTP

```
GET /api/finance/summary?from=2026-04-01&to=2026-04-30&granularity=day&workplaceIds=&areas=

Response 200: {
  range: { from: '2026-04-01', to: '2026-04-30', granularity: 'day' },
  totalReceived: '7320.00',
  totalForecast: '2400.00',
  forecastBySource: {
    perSession: '900.00',
    packageInstallments: '1500.00'
  },
  delta: {
    receivedVsPreviousPeriod: '+12.4',  // percentual
    previousReceived: '6512.00'
  },
  series: [
    { bucket: '2026-04-01', received: '320.00', forecast: '0.00' },
    { bucket: '2026-04-02', received: '0.00',   forecast: '120.00' },
    ...
  ],
  byWorkplace: [
    { workplaceId: '...', name: 'Clínica Movimento', received: '4200.00', forecast: '900.00' },
    { workplaceId: '...', name: 'Atendimento Particular', received: '3120.00', forecast: '1500.00' }
  ],
  byArea: [
    { area: 'ORTOPEDICA', received: '4800.00', forecast: '1500.00' },
    { area: 'ESTETICA',   received: '2520.00', forecast: '900.00' }
  ],
  pendingPayments: [
    {
      id: '...',
      patientName: 'Maria Silva',
      planLabel: 'Pacote Pilates 10x',
      amount: '300.00',
      dueAt: '2026-05-05',
      method: 'PIX'
    }
  ]
}
```

### Interno

```typescript
getFinanceSummaryUseCase(input: {
  userId: string
  from: Date
  to: Date
  granularity: 'day' | 'week' | 'month'
  workplaceIds?: string[]
  areas?: TherapyArea[]
}): Promise<FinanceSummary>
```

## Migrations

Nenhuma. Phase 17 só lê dados produzidos pelas phases 14–16.

Eventualmente, se performance virar problema:

```prisma
// (futuro, fora do escopo)
model FinanceDailyRollup {
  id          String   @id @default(cuid())
  userId      String
  bucket      DateTime
  received    Decimal  @db.Decimal(12, 2)
  forecast    Decimal  @db.Decimal(12, 2)
  workplaceId String?
  area        TherapyArea?
  computedAt  DateTime @default(now())

  @@unique([userId, bucket, workplaceId, area])
  @@index([userId, bucket])
}
```

## UI

- [ ] Página: `/financeiro`
- [ ] Componente: `FinanceSummaryCard`
- [ ] Componente: `FinanceTimelineChart`
- [ ] Componente: `FinanceBreakdownPanel`
- [ ] Componente: `PendingPaymentsTable`
- [ ] Componente: `FinancePeriodPicker`
- [ ] Atualizar: `/dashboard` (mini-cards de caixa e a receber)
- [ ] Atualizar: sidebar (link "Financeiro")

## Checklist Final

- [ ] `getFinanceSummaryUseCase` implementado e testado
- [ ] Endpoint `/api/finance/summary` retorna estrutura completa
- [ ] Página `/financeiro` renderiza cards, gráfico, breakdowns e pendências
- [ ] Filtros de período, granularidade, workplace e área funcionam
- [ ] Tabela de pendências permite marcar como pago e ver paciente
- [ ] Mini-cards no `/dashboard` lincam para `/financeiro`
- [ ] Multi-tenant em todas as queries
- [ ] Tema sálvia/terracota aplicado, sem roxo
- [ ] Dark mode funcional
- [ ] Performance OK em base com 1000+ sessões e 500+ pagamentos (medir e anotar)
- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` passa sem erros
- [ ] Testes unitários cobrindo cálculo de recebido, previsto, série temporal e breakdowns
- [ ] `.docs/CONTEXT.md` atualizado
- [ ] `README.md` atualizado (PhysioFlow v2 entregue)
- [ ] `.docs/CHANGELOG.md` atualizado
- [ ] Validação manual no browser com dados reais (ou seed enriquecido)

## Notas para Próxima Sessão

Com Phase 17 entregue, o ciclo "multi-modalidade + financeiro" está completo: o usuário
consegue ter pacientes em N planos, gerenciar locais, registrar pagamentos e ver o caixa
em uma tela única.

Próximas extensões naturais (todas opcionais e fora deste ciclo):

- Phase 18 — Comissão líquida nos relatórios usando `Workplace.defaultCommissionPct`
- Phase 19 — Exportação CSV/PDF do dashboard financeiro
- Phase 20 — Lembrete automático de parcela a vencer (e-mail / WhatsApp)
- Phase 21 — Templates de plano de tratamento (planos padrão para reaproveitar)
- Phase 22 — Especialidades cadastráveis pelo usuário (migrar enum → tabela)

Antes de avançar para qualquer uma, validar com usuários reais quais doem mais.
