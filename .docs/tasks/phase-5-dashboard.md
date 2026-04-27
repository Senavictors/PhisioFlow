# Task: Phase 5 — Dashboard & KPIs

## Status

- [x] Todo
- [x] In Progress
- [x] Done

## Contexto

Com pacientes (Phase 3) e sessões (Phase 4) registrados, temos dados suficientes para
construir o Dashboard — a tela de entrada do sistema e o principal ponto de visibilidade
clínica para o fisioterapeuta.

Tela de referência exata: `physioflow-design-system/project/ui_kits/portal/index.html` → aba "Dashboard (Visão Geral)"

Nenhuma migration nova é necessária — todos os dados vêm de `Patient` e `Session`.

## Objetivo

Dashboard `/dashboard` com KPIs em tempo real, gráfico de evolução semanal, ações rápidas
e lista de atendimentos recentes. Redirecionar a rota `/` para `/dashboard`.

## Escopo

### Backend — Endpoint de métricas

- [ ] `GET /api/dashboard/metrics` — retorna todos os KPIs em uma única requisição
- [ ] Módulo `server/modules/dashboard/` (application + http)
- [ ] Sem infra própria — chama repositories de `patients` e `sessions`

### Frontend

- [ ] Página `/dashboard` fiel ao design system (ver spec abaixo)
- [ ] Redirect `/` → `/dashboard`
- [ ] Componente `KpiCard`
- [ ] Componente `WeeklyChart`
- [ ] Componente `QuickActions`
- [ ] Componente `RecentSessions`
- [ ] Componente `AttentionAlert`

---

## Contrato HTTP

```
GET /api/dashboard/metrics
Headers: Cookie (sessão autenticada)
Response 200:
{
  activePatients: number,          -- Patient where isActive=true AND userId
  sessionsToday: number,           -- Session where date=hoje AND status=REALIZADO
  patientsWithoutReturn: number,   -- Patients sem sessão REALIZADA nos últimos 30 dias
  weeklySessions: {                -- últimos 7 dias
    day: string,                   -- "Ter", "Qua", ...
    count: number
  }[],
  recentSessions: {
    id: string,
    patientName: string,
    type: string,
    area: string,
    date: string,
    status: SessionStatus,
    isHomeCare: boolean
  }[]                              -- últimas 5 sessões
}
```

---

## Lógica de Cálculo das Métricas

```typescript
// activePatients
prisma.patient.count({ where: { userId, isActive: true } })

// sessionsToday
const today = startOfDay(new Date())
prisma.session.count({
  where: { userId, status: 'REALIZADO', date: { gte: today, lt: endOfDay(today) } },
})

// patientsWithoutReturn (atenção clínica — 30+ dias sem atendimento)
// Pacientes ativos cuja sessão mais recente (REALIZADO) tem date < 30 dias atrás
// OU que nunca tiveram sessão REALIZADO
const thirtyDaysAgo = subDays(new Date(), 30)
// → query com subquery ou groupBy + having

// weeklySessions: agrupar sessions REALIZADO dos últimos 7 dias por dia da semana

// recentSessions: últimas 5 sessions, qualquer status, include patient.name
```

---

## UI — Spec do Dashboard

Referência: `physioflow-design-system/project/ui_kits/portal/index.html` aba Dashboard

### Estrutura da Página

```
┌─ Saudação ─────────────────────────────────────────────────┐
│  Data: "quinta-feira, 23 de abril"  (text-[13px] muted)    │
│  "Olá, bem-vindo de volta 👋"       (font-display 38px)    │
└────────────────────────────────────────────────────────────┘

┌─ Grid 3 colunas — KPI Cards ───────────────────────────────┐
│  [Pacientes ativos]  [Atendimentos hoje]  [Sem retorno]    │
└────────────────────────────────────────────────────────────┘

┌─ Grid 2fr | 1fr ───────────────────────────────────────────┐
│  [Evolução semanal — gráfico]  │  [Ações rápidas — sage]   │
└────────────────────────────────────────────────────────────┘

┌─ Grid 2fr | 1fr ───────────────────────────────────────────┐
│  [Atendimentos recentes]       │  [Atenção — terracotta]   │
└────────────────────────────────────────────────────────────┘
```

### Componente `KpiCard`

```
Props: { icon: LucideIcon, value: number, label: string, sub?: string, variant?: 'default' | 'accent' }

Layout (card branco, rounded-2xl, p-6, shadow-sm):
  - Ícone: 40×40px, rounded-xl
      default → bg-primary-soft text-primary-soft-fg
      accent  → bg-accent-soft text-accent-soft-fg
  - Numeral: font-display, text-[68px], leading-none, tracking-tight (--text-kpi)
  - Label: font-body, text-[15px], font-semibold
  - Sub: font-body, text-[13px], text-muted-foreground

Exemplo accent (Sem retorno):
  - Tag "URGENTE" no canto superior direito: text-[10.5px] uppercase tracking-[0.16em] text-accent-soft-fg
  - ícone: TrendingUp
```

### Componente `WeeklyChart`

```
Card branco com título "Evolução semanal" (eyebrow "ÚLTIMOS 7 DIAS")
Gráfico simples com:
  - Grid de linhas horizontais (border, opacity sutil)
  - Linha baseline (bg-primary, height 2px) representando a média
  - Labels de dias da semana no eixo X (Ter, Qua, Qui, Sex, Sab, Dom, Seg)
  - Barras ou pontos representando contagem de sessões por dia

Nota: usar SVG simples ou recharts. Sem dependência pesada de chart lib na v1.
```

### Componente `QuickActions`

```
Card bg-primary (sálvia), text-white, rounded-2xl, p-6
  Título: "Ações rápidas" (font-display 20px)
  Sub: "Comece um fluxo em segundos." (text-[12.5px] white/78%)
  Botões (full-width, justify-start):
    - "Cadastrar paciente"  → /pacientes/novo       (btn-ghost-dark + UserPlus)
    - "Agendar sessão"      → /agenda/nova           (btn-secondary branco ou ghost-dark + Calendar)
  Footer: "Ver atendimentos →"  → /atendimentos    (link text, white/82%)
```

### Componente `RecentSessions`

```
Card branco, título "Atendimentos recentes"
Lista de linhas (border-b entre elas, sem borda na última):
  - Nome do paciente + área (font-semibold 15px + muted 12.5px)
  - Hora + duração (muted)
  - Badge status (Realizado / Agendado / Cancelado)
  - Badge Domiciliar (se HOME_CARE)

Estado vazio: texto muted centralizado
```

### Componente `AttentionAlert`

```
Card bg-accent-soft, text-accent-soft-fg, rounded-2xl, p-6
  - Ícone: 40×40px, rounded-xl, bg-card/60
  - Label: "ATENÇÃO" uppercase tracking-wide font-bold 15px
  - Numeral: font-display 52px (--text-kpi-sm)
  - Texto: "paciente(s) sem atendimento há 30+ dias"

Ocultar componente se patientsWithoutReturn === 0
```

---

## Checklist Final

- [ ] `/` redireciona para `/dashboard`
- [ ] `GET /api/dashboard/metrics` retorna dados corretos
- [ ] KPI cards mostram valores reais do banco
- [ ] Gráfico de evolução renderiza os 7 dias
- [ ] Ações rápidas navegam para as rotas corretas
- [ ] Atendimentos recentes listam as últimas 5 sessões
- [ ] AttentionAlert aparece apenas quando há pacientes sem retorno
- [ ] Saudação mostra o nome do usuário logado e a data atual em pt-BR
- [ ] `.docs/CONTEXT.md` atualizado
- [ ] `README.md` atualizado (Phase 5 marcada como ✅)
- [ ] `.docs/CHANGELOG.md` atualizado

## Notas para Próxima Sessão

O dashboard é a tela de maior impacto visual. Ao concluir, o sistema já tem um produto
usável: cadastrar paciente → registrar atendimento → ver no dashboard.
Próximas fases (6+) adicionam Timeline de Evolução, Central de Documentos e Logística Domiciliar.
