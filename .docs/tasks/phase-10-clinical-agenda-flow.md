# Task: Phase 10 — Edição SOAP e Agenda em Calendário

## Status

- [ ] Todo
- [ ] In Progress
- [x] Done

## Contexto

O backend já permite atualizar sessões via `PUT /api/sessions/:id`, incluindo campos SOAP.
Mesmo assim, a UI atual só oferece criação de atendimento e alteração rápida de status.
Depois que um atendimento é criado, o fisioterapeuta não tem um caminho claro para revisar
ou complementar a documentação clínica.

Na agenda, a listagem vertical funciona para próximos atendimentos, mas fica cansativa para
planejamento mensal. O usuário pediu uma visualização adicional em formato de calendário,
sem remover a lista existente.

## Objetivo

Permitir edição de SOAP em atendimentos existentes e adicionar uma visualização mensal da
agenda. A lista atual deve continuar disponível.

## Escopo

### Edição de SOAP

- [ ] Adicionar ação "Editar SOAP" ou "Editar atendimento" no `SessionCard`
- [ ] Criar rota autenticada para edição:
  - recomendada: `/atendimentos/[id]/editar`
- [ ] Reutilizar ou extrair `SessionForm` para suportar modo create/edit
- [ ] Carregar sessão existente com `GET /api/sessions/:id`
- [ ] Salvar alterações com `PUT /api/sessions/:id`
- [ ] Permitir atualizar:
  - data e hora
  - duração
  - tipo
  - status
  - subjetivo
  - objetivo
  - avaliação
  - plano
- [ ] Após salvar, voltar para `/atendimentos` ou página anterior com `router.back()`
- [ ] Manter regra de domínio: sessão `AGENDADO` não pode ficar no passado
- [ ] Adicionar testes unitários se o use case precisar mudar

### Agenda em Calendário

- [ ] Adicionar controle de visualização em `/agenda`:
  - "Lista"
  - "Calendário"
- [ ] Preservar filtro domiciliar na troca de view:
  - `/agenda?view=calendar`
  - `/agenda?view=calendar&domiciliar=1`
- [ ] Criar calendário mensal responsivo:
  - navegação mês anterior/próximo
  - destaque do dia atual
  - contagem de atendimentos por dia
  - indicadores por status/tipo
  - badge/ícone para domiciliar
- [ ] Ao clicar em um dia, mostrar os atendimentos daquele dia:
  - abaixo do calendário em mobile;
  - painel lateral ou seção abaixo em desktop.
- [ ] Manter a listagem atual como `view=list`
- [ ] Buscar sessões por intervalo mensal quando `view=calendar`
- [ ] Usar dados existentes de `listSessionsUseCase`; criar novo endpoint somente se necessário.

## Fora de Escopo

- Drag-and-drop para reagendar
- Criação de atendimento direto ao clicar no calendário
- Integração Google Calendar
- Envio de e-mails/lembretes
- Regras de conflito de agenda entre profissionais

## Decisões Arquiteturais

- [ADR-002](../decisions/ADR-002-soap-notes.md) — Estrutura SOAP
- [ADR-004](../decisions/ADR-004-integracoes-externas.md) — Google Calendar fica para fase posterior

## Contratos

### HTTP Existente

```
GET /api/sessions/:id
Response 200: { session: SessionWithPatient }

PUT /api/sessions/:id
Body: {
  date?: string,
  duration?: number,
  type?: "PRESENTIAL" | "HOME_CARE",
  status?: "AGENDADO" | "REALIZADO" | "CANCELADO",
  subjective?: string,
  objective?: string,
  assessment?: string,
  plan?: string
}
Response 200: { session: SessionWithPatient }
```

### Agenda Mensal

```
GET /api/sessions?from=2026-04-01T00:00:00.000Z&to=2026-04-30T23:59:59.999Z&limit=300&order=asc
Response 200: { sessions: SessionWithPatient[], total: number }
```

### Interno

```typescript
type AgendaView = 'list' | 'calendar'

type CalendarDay = {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  sessions: SessionWithPatient[]
}
```

## Migrations

Nenhuma migration prevista.

## UI

- [ ] Página: `/atendimentos/[id]/editar`
- [ ] Página: `/agenda`
- [ ] Componente: `SessionForm` em modo create/edit ou novo `SessionEditForm`
- [ ] Componente: `AgendaViewToggle`
- [ ] Componente: `MonthCalendar`
- [ ] Componente: `CalendarDaySessions`

## Checklist Final

- [ ] Atendimento criado pode ser aberto para edição
- [ ] Campos SOAP existentes aparecem preenchidos
- [ ] Alterações de SOAP persistem e aparecem na listagem/timeline
- [ ] Validação de data passada para `AGENDADO` continua funcionando
- [ ] Agenda lista continua funcionando como antes
- [ ] Agenda calendário exibe mês atual por padrão
- [ ] Navegação de mês não perde filtro domiciliar
- [ ] Clicar em um dia mostra atendimentos daquele dia
- [ ] Mobile não exige scroll excessivo ou quebra layout
- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` passa sem erros
- [ ] `.docs/CONTEXT.md` atualizado
- [ ] `README.md` atualizado
- [ ] `.docs/CHANGELOG.md` atualizado
- [ ] Validação manual no browser em desktop e mobile

## Notas para Próxima Sessão

Esta fase prepara a base para Google Calendar: antes de sincronizar eventos externos, o app
precisa ter um fluxo interno confiável para editar data, horário, status e conteúdo SOAP.
