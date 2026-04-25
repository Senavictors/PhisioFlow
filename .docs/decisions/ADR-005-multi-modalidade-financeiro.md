# ADR-005: Multi-modalidade Clínica e Acompanhamento Financeiro

## Status

Proposto

## Contexto

O PhysioFlow v1 tratava cada paciente como pertencente a **uma única área terapêutica**
(`Patient.area: TherapyArea`) e cada sessão como `PRESENTIAL` ou `HOME_CARE`. Esse modelo
veio do MVP e está engessado para a realidade do fisioterapeuta:

- Um mesmo paciente pode ser atendido em **várias modalidades simultâneas** — por exemplo,
  Pilates + Ortopédica pós-cirúrgica + Estética. O `Patient.area` força um único valor.
- O fisioterapeuta autônomo geralmente presta serviço em **múltiplos locais**: sua própria
  clínica, clínicas parceiras, atendimento particular (domiciliar) e online. Hoje não
  existe entidade de "Local de Trabalho", e isso impede segmentar agenda, valores e relatórios
  por onde o serviço foi prestado.
- O sistema **não registra valores nem pagamentos**, então o usuário não consegue ver
  "quanto recebi este mês" nem "quanto vou receber baseado nos atendimentos agendados".
- Pacotes de sessões (modelo de cobrança comum no mercado: "10 sessões por R$ X")
  também não têm representação.

A documentação `.docs/fisioterapia-areas.md` separa três níveis de classificação clínica:

- **Área de atuação** (Ortopédica, Neurológica, Estética, etc.) — macro
- **Especialidades / técnicas** (Pilates, RPG, Acupuntura, etc.) — multi-select
- **Tipo de atendimento** (Clínica, Domiciliar, Hospitalar, Corporativo, Online) — formato

Esses três níveis devem ser propriedades do **tratamento**, não do paciente.

## Decisão

### 1. Modelagem clínica

- Introduzir o conceito de **Plano de Tratamento** (`TreatmentPlan`) como elo entre
  paciente e sessões. Um paciente pode ter **N planos ativos**.
- Cada plano carrega **uma área**, **uma ou mais especialidades**, **um tipo de
  atendimento** e **um local**.
- Sessões passam a referenciar opcionalmente um plano. **Sessão avulsa é permitida** —
  o usuário pode atender sem plano formal e cobrar pontualmente.
- Remover `Patient.area` no fechamento da migração legada. A "área do paciente" passa a
  ser uma view derivada das áreas dos planos ativos.

### 2. Local de trabalho

- Introduzir entidade `Workplace` por usuário com `kind` (OWN_CLINIC | PARTNER_CLINIC |
  PARTICULAR | ONLINE), endereço opcional, tipo de atendimento default, valor padrão
  por sessão e percentual de comissão default (campo previsto mas sem uso operacional na
  primeira entrega).
- Toda sessão referencia um `workplaceId` (obrigatório após migração legada).
- Toda sessão tem `attendanceType` próprio (default herdado do plano/local mas
  sobrescritível na sessão).

### 3. Enums

- `TherapyArea` é **expandido** para cobrir todas as áreas do `.docs/fisioterapia-areas.md`:
  ORTOPEDICA, NEUROLOGICA, CARDIORESPIRATORIA, ESTETICA, ESPORTIVA, PELVICA, PEDIATRICA,
  GERIATRICA, PREVENTIVA, OUTRA. Os valores antigos (`PILATES`, `MOTOR`, `AESTHETIC`,
  `HOME_CARE`) são **descontinuados** e migrados (Pilates → especialidade, MOTOR →
  ORTOPEDICA, AESTHETIC → ESTETICA, HOME_CARE → tipo de atendimento).
- `Specialty` é um **enum fechado** na primeira versão: PILATES, RPG, ACUPUNTURA,
  LIBERACAO_MIOFASCIAL, VENTOSATERAPIA, DRY_NEEDLING, TERAPIA_MANUAL, OUTRA. Caso a
  necessidade real apareça, migrar para tabela `Specialty(userId)` em fase futura.
- `AttendanceType`: CLINIC, HOME_CARE, HOSPITAL, CORPORATE, ONLINE.
- `PricingModel`: PER_SESSION, PACKAGE.
- `PlanStatus`: ACTIVE, COMPLETED, CANCELED, PAUSED.
- `PaymentMethod`: PIX, CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, INSURANCE, OTHER.
- `PaymentStatus`: PAID, PENDING, PARTIAL, REFUNDED.

### 4. Cobrança e pagamentos

- Modelo `Payment` com `amount`, `method`, `status`, `paidAt`, `dueAt?`, vinculável a
  `treatmentPlanId` (pacotes) **ou** a `sessionId` (avulso).
- `Session.expectedFee` é **snapshot** do valor esperado da sessão no momento da criação.
  Mudanças de preço no plano não retroagem ao histórico.
- Pacote: criar `TreatmentPlan` com `pricingModel=PACKAGE`, `totalSessions`,
  `packageAmount`. Pagamento à vista cria 1 `Payment(PAID)`. Pagamento parcelado cria
  N `Payment(PENDING)` com `dueAt` por parcela. Sessões consumidas do pacote têm
  `expectedFee=null` (já cobertas).
- Avulso: cada sessão pode ter um `Payment` ligado a ela.

### 5. Visualização financeira

- Endpoint único `GET /api/finance/summary?from&to&granularity=day|week|month` retorna:
  - `totalReceived` — soma de `Payment(PAID).amount` no período
  - `totalForecast` — soma de previstos no período (ver §5.1)
  - `received` e `forecast` em série temporal por bucket
  - `byWorkplace` e `byArea` para breakdowns
- Granularidade configurável (dia/semana/mês). Sem persistir agregados — a primeira
  versão calcula sob demanda.

#### 5.1 Cálculo de previsto

- **Previsto por agendamento** (sessões PER_SESSION ainda não pagas): soma de
  `Session.expectedFee` no período onde `status=AGENDADO`, sem `Payment(PAID)`
  vinculado.
- **Previsto por pacote contratado**: soma de `Payment(PENDING).amount` com `dueAt`
  no período.
- Total previsto = soma das duas categorias. Sessões cobertas por pacote não entram em
  previsto (já contabilizadas como `Payment` do pacote).

### 6. Migração de dados

Estratégia em duas migrations, **não-destrutiva**:

- **Migration 1 (Phase 14)** — adiciona `Workplace`, `Session.workplaceId?`,
  `Session.attendanceType?`, novos enums. Backfill: 1 workplace default por usuário.
  `Patient.area` e `Session.type` ainda existem.
- **Migration 2 (Phase 15)** — adiciona `TreatmentPlan`, cria 1 plano legado por
  paciente vinculando todas as sessões existentes, **remove** `Patient.area` e
  `Session.type`. `Session.workplaceId` vira `NOT NULL`.

### 7. Princípios mantidos

- Multi-tenant: todas as tabelas novas têm `userId` e toda query filtra por ele.
- Clean Arch: módulos novos seguem o mesmo padrão `application/domain/http/infra` dos
  módulos existentes.
- Validação Zod nos DTOs de todos os novos endpoints.
- Tema sálvia + terracota nas telas novas. Dark mode mantido.

## Consequências

**Positivo:**

- Paciente pode ter múltiplos planos ativos em modalidades distintas sem hack.
- Atendimento em qualquer local (clínica própria, parceira, particular) fica mapeado.
- Financeiro mínimo cobre 80% das necessidades reais (valores, pacotes, recebido,
  previsto) sem virar ERP.
- Snapshot de `expectedFee` preserva histórico financeiro auditável.

**Negativo:**

- Requer migração de dados em duas etapas, com janela onde modelos novos coexistem com
  os legados.
- UI ganha conceito novo ("plano de tratamento") que precisa ser ensinado ao usuário —
  exige onboarding mínimo para não confundir.
- Cálculo de previsto sob demanda pode ficar pesado conforme a base cresce. Mitigação:
  cache em memória por (userId, range) na fase 17 e materialização futura se preciso.

## Fora de Escopo da Decisão

- Comissão real da clínica parceira aplicada nos relatórios (líquido vs bruto). O campo
  `defaultCommissionPct` fica disponível em `Workplace`, mas o cálculo de líquido entra
  em fase posterior.
- Conciliação bancária / importação de extrato.
- Emissão de nota fiscal.
- Lembretes automáticos de pagamento ou cobrança via WhatsApp/e-mail.
- Suporte a múltiplas moedas.
- Especialidades cadastráveis pelo usuário (tabela própria) — começa como enum.
- Multi-usuário por clínica (gerente + recepcionista + fisios).
