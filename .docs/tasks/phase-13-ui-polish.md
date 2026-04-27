# Task: Phase 13 — Polimento de UI e Componentes

## Status

- [x] Todo
- [x] In Progress
- [x] Done

## Contexto

Após a entrega das integrações externas (phases 11 e 12), identificamos um conjunto de
inconsistências visuais e bugs de interação na interface:

- Cards de atendimento com excesso de botões expostos.
- Selects nativos do navegador exibindo popup preto (estilo do SO), divergindo da paleta sálvia/terracota do sistema.
- Input `datetime-local` abrindo calendário do navegador, igualmente fora do design system.
- Sidebar mobile não abria ao clicar no ícone sanduíche.
- Emoji de mão abanando (👋) na saudação do dashboard, inconsistente com o tom clínico do produto.

## Objetivo

Corrigir os bugs de interação e padronizar todos os controles de formulário — selects e
pickers de data/hora — dentro do design system do PhysioFlow (sálvia + terracota, tokens OKLCH).

## Escopo

### SessionCard — refatoração de ações

- [x] Substituir coluna de múltiplos botões por botão primário "Confirmar" (só quando `AGENDADO`) +
      botão `...` circular que abre menu flutuante com as demais ações:
  - Cancelar (vermelho)
  - Enviar aviso (com tooltip se e-mail não configurado)
  - Sincronizar / Atualizar agenda
  - Remover do Google (só quando sincronizado)
  - Editar SOAP
  - Abrir paciente
- [x] Menu fecha em clique fora / `Esc`
- [x] Spinner no botão `...` durante ação em andamento
- [x] Lógica de `SendSessionReminderButton` e `SyncSessionCalendarButton` absorvida inline
      no `SessionCard` (componentes passaram a ser usados apenas pelo card)

### Componente ThemedSelect

- [x] Criar `src/components/ui/themed-select.tsx` — select customizado com
      botão trigger + lista flutuante, respeitando `bg-input`, `border-border`, `bg-primary-soft`,
      hover em `bg-muted`, checkmark no item selecionado, fecha em clique fora / `Esc`
- [x] Substituir `<select>` nativo em `PatientFilters`
- [x] Substituir `<select>` nativo em `DocumentFilters`
- [x] Substituir `<select>` nativo em `SessionForm` (campos Tipo e Status)
- [x] Substituir `<select>` nativo em `PatientForm` (Área terapêutica, Classificação, Prioridade)
- [x] Substituir `<select>` nativo em `NovoDocumentoModal` (Paciente, Tipo de documento)
- [x] Substituir `<select>` nativo em `GoogleCalendarSettingsCard` (Agenda padrão)

### Componente DateTimePicker

- [x] Criar `src/components/ui/datetime-picker.tsx` — picker de data/hora customizado:
  - Grid mensal com navegação `<` `>`
  - Dia selecionado em `bg-primary` com `shadow-glow`; hoje com borda `border-primary/40`
  - Modo `datetime`: seletores de hora/minuto (passo 5 min) + botão "Pronto"
  - Modo `date`: fecha ao selecionar
  - "Hoje" e "Limpar" no rodapé
  - Fecha em clique fora / `Esc`
  - Output compatível com `YYYY-MM-DDTHH:mm` / `YYYY-MM-DD`
- [x] Substituir `<input type="datetime-local">` no `SessionForm`
- [x] Substituir `<input type="date">` no `PatientForm` (data de nascimento)

### Sidebar mobile

- [x] Corrigir bug no `useEffect` de `Sidebar.tsx` que chamava `onClose()` imediatamente ao
      abrir o menu (disparava toda vez que `mobileOpen` virava `true`)
- [x] Novo comportamento: fechar só quando o `pathname` realmente muda (navegação efetuada),
      usando `useRef` para rastrear o pathname anterior

### Dashboard

- [x] Remover emoji 👋 da saudação do dashboard (`/dashboard/page.tsx`)

## Arquivos Alterados

| Arquivo                                                  | Tipo de alteração                     |
| -------------------------------------------------------- | ------------------------------------- |
| `src/components/sessions/SessionCard.tsx`                | Refatoração completa — menu flutuante |
| `src/components/ui/themed-select.tsx`                    | Criado                                |
| `src/components/ui/datetime-picker.tsx`                  | Criado                                |
| `src/components/patients/PatientFilters.tsx`             | ThemedSelect                          |
| `src/components/documents/DocumentFilters.tsx`           | ThemedSelect                          |
| `src/components/sessions/SessionForm.tsx`                | ThemedSelect + DateTimePicker         |
| `src/components/patients/PatientForm.tsx`                | ThemedSelect + DateTimePicker         |
| `src/components/documents/NovoDocumentoModal.tsx`        | ThemedSelect                          |
| `src/components/calendar/GoogleCalendarSettingsCard.tsx` | ThemedSelect                          |
| `src/components/layout/Sidebar.tsx`                      | Bug fix mobile                        |
| `src/app/(app)/dashboard/page.tsx`                       | Remove emoji                          |

## Resultado

- Interface 100% consistente: nenhum select ou picker nativo visível ao usuário.
- Menu de ações compacto e contextual nos cards de atendimento.
- Sidebar mobile funcional.
- Tom clínico reforçado na saudação do dashboard.
