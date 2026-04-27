# Task: Phase 8 — Logística Domiciliar

## Status

- [ ] Todo
- [ ] In Progress
- [ ] Done

## Contexto

Sessões do tipo `HOME_CARE` já existem desde a Phase 4, mas carecem de um fluxo dedicado.
O fisioterapeuta que atende em domicílio precisa gerenciar endereços, rotas e prioridades —
informações que hoje não cabem no modelo de Sessão genérico.

A Phase 8 adiciona campos de logística ao paciente e uma visão específica de home care
na agenda, sem quebrar o fluxo existente.

Tela de referência: `physioflow-design-system/project/ui_kits/portal/index.html`
→ aba "Agenda" (filtro Domiciliar)

## Objetivo

Enriquecer pacientes HOME_CARE com endereço e prioridade. Criar visão dedicada de agenda
domiciliar (`/agenda?tipo=domiciliar`) com ordenação por prioridade e distância.
Badge visual de prioridade nos cards de sessão domiciliar.

## Escopo

### Backend — Migration

- [ ] Campos novos no modelo `Patient` (migration `phase8_homecare_logistics`):
  - `address`: `String?` — logradouro + número
  - `neighborhood`: `String?` — bairro
  - `city`: `String?` — cidade
  - `homeCareNotes`: `String?` — instruções de acesso, portaria, etc.
  - `homeCarePriority`: `HomeCarepriority` enum — `NORMAL | HIGH | URGENT`

### Backend — API

- [ ] `PUT /api/patients/:id` aceita os novos campos (atualizar DTO Zod)
- [ ] `GET /api/sessions?type=HOME_CARE` já funciona — confirmar filtro existente
- [ ] `GET /api/sessions?type=HOME_CARE&order=priority` — ordenação por prioridade

### Frontend

- [ ] Campos de logística no formulário de edição do paciente (`/pacientes/:id/editar`)
  - Endereço, bairro, cidade, instruções de acesso, prioridade
- [ ] Badge de prioridade no `SessionCard` e na agenda (URGENTE → terracota / HIGH → amarelo)
- [ ] Filtro "Domiciliar" na página `/agenda` que exibe apenas HOME_CARE, ordenado por prioridade
- [ ] Seção "Logística" na ficha do paciente (`/pacientes/:id`) quando `area = HOME_CARE`

## Fora de Escopo

- Integração com Google Maps / cálculo de rota real
- Otimização automática de rota entre múltiplos endereços
- Notificações push de lembrete de visita
- App mobile (web-first)

---

## Migration

```prisma
enum HomeCarePriority {
  NORMAL
  HIGH
  URGENT
}

// Adicionar ao modelo Patient:
address          String?
neighborhood     String?
city             String?
homeCareNotes    String?
homeCarepriority HomeCarePriority @default(NORMAL)
```

---

## Contratos HTTP

```
PUT /api/patients/:id
Body (novos campos aceitos):
{
  address?: string,
  neighborhood?: string,
  city?: string,
  homeCareNotes?: string,
  homeCarepriority?: 'NORMAL' | 'HIGH' | 'URGENT'
}
Response 200: { patient: Patient }

GET /api/sessions?type=HOME_CARE&order=priority&from=2026-04-24
Response 200: { sessions: SessionWithPatient[], total: number }
```

---

## UI — Spec

### Seção "Logística" na ficha do paciente

```
Visível apenas quando patient.area === 'HOME_CARE'

Card com título "Logística Domiciliar":
  - Endereço completo (address + neighborhood + city)
  - Instruções de acesso (homeCareNotes)
  - Badge de prioridade:
      NORMAL  → bg-muted text-muted-foreground
      HIGH    → bg-warning-soft text-warning
      URGENT  → bg-accent-soft text-accent-soft-fg + "URGENTE" uppercase
  - Link "Editar informações" → /pacientes/:id/editar
```

### Badge de Prioridade no SessionCard

```
HOME_CARE com priority = URGENT:
  Badge terracota "URGENTE" ao lado do badge "Domiciliar"
HOME_CARE com priority = HIGH:
  Badge amarelo "PRIORITÁRIO"
HOME_CARE com priority = NORMAL:
  Apenas badge "Domiciliar" padrão
```

### Filtro Domiciliar na Agenda

```
/agenda — adicionar toggle "Domiciliar" no header:
  OFF → comportamento atual (todos)
  ON  → filtra type=HOME_CARE, ordena por prioridade (URGENT > HIGH > NORMAL) e depois por hora

Quando filtro ativo:
  Eyebrow: "ATENDIMENTOS DOMICILIARES"
  Mostrar endereço do paciente abaixo do nome no SessionCard (quando disponível)
```

### Formulário de Edição do Paciente (novos campos)

```
Seção "Logística Domiciliar" (visível para todos os pacientes, destacada para HOME_CARE):
  - Endereço: input text
  - Bairro: input text
  - Cidade: input text
  - Instruções de acesso: textarea
  - Prioridade: select (Normal / Prioritário / Urgente)
```

---

## Checklist Final

- [ ] Migration `phase8_homecare_logistics` aplicada sem erros
- [ ] Edição de paciente aceita e persiste os novos campos
- [ ] Seção "Logística" aparece na ficha de pacientes HOME_CARE
- [ ] Badge de prioridade aparece no SessionCard conforme o nível
- [ ] Filtro "Domiciliar" na agenda funciona e ordena por prioridade
- [ ] Multi-tenant mantido em todas as queries novas
- [ ] `npm run build` passa sem erros
- [ ] `.docs/CONTEXT.md` atualizado
- [ ] `README.md` atualizado (Phase 8 marcada como ✅)
- [ ] `.docs/CHANGELOG.md` atualizado

## Notas para Próxima Sessão

Ao concluir a Phase 8, o produto PhysioFlow v1 está completo:
Cadastro → Atendimento SOAP → Evolução → Documentação → Logística Domiciliar.
Próximo ciclo: melhorias de UX, notificações, multi-usuário por clínica (multi-tenant expandido)
e integração com calendários externos (Google Calendar).
