# Task: Phase 9 — Polimento UX e Documentos v1.1

## Status

- [x] Todo
- [ ] In Progress
- [ ] Done

## Contexto

Depois da Phase 8, o produto fecha o ciclo clínico principal, mas alguns pontos de UX
estão criando atrito: ações rápidas com baixo contraste, botão de cancelamento parecido com
ação neutra, feedback insuficiente no filtro domiciliar, textos de marca antigos e contexto
insuficiente na Central de Documentos.

Essa fase deve alinhar os detalhes visuais ao design system sem alterar a arquitetura
principal do app.

Referências enviadas pelo usuário:

- Cards de contexto da aba Documentos: Relatório de evolução, Laudo fisioterapêutico,
  Encaminhamento, Declaração de horas
- Card de "Ações rápidas" em sálvia com botões bem visíveis

## Objetivo

Melhorar legibilidade, contexto e feedback das telas existentes. Ao final, o usuário deve
entender melhor os documentos disponíveis, enxergar claramente os botões rápidos e perceber
loading/interação no filtro domiciliar.

## Escopo

### Central de Documentos

- [ ] Adicionar uma faixa/grid de cards contextuais no topo de `/documentos`
- [ ] Cards devem seguir o design-system:
  - ícone em cápsula suave
  - título curto
  - descrição objetiva
  - borda sutil, sombra leve, radius coerente com cards do app
- [ ] Mapear labels públicos:
  - `RELATORIO_PROGRESSO` → "Relatório de evolução"
  - `LAUDO_FISIOTERAPEUTICO` → "Laudo fisioterapêutico"
  - `DECLARACAO_COMPARECIMENTO` → "Declaração de horas"
- [ ] Avaliar inclusão de `ENCAMINHAMENTO`:
  - se entrar como documento gerável, adicionar enum, migration, DTO, template PDF e opção no modal;
  - se ficar somente como contexto, marcar visualmente como "em breve" e não permitir geração.
- [ ] No modal "Gerar documento", adicionar botão/ícone de info ao lado de "Período"
- [ ] Tooltip/popover do período deve explicar resumidamente:
  - "O período limita quais atendimentos entram no relatório/declaração. Ex.: 01/2026 - 04/2026."
- [ ] Evitar texto longo fixo dentro da tela; usar tooltip/popover acessível via hover e clique.

### Dashboard

- [ ] Atualizar `QuickActions` para ficar próximo da referência:
  - card sálvia com boa altura e espaçamento
  - botão "Cadastrar paciente" com borda clara e texto visível
  - botão "Agendar sessão" em terracota/secondary com contraste alto
  - link "Ver atendimentos" centralizado com seta e hover
- [ ] Garantir que os botões sejam visíveis no light e dark mode.

### Agenda

- [ ] Atualizar `DomiciliarToggle`:
  - estado ativo também deve ter hover/focus visível;
  - adicionar feedback de navegação/loading ao clicar;
  - preservar URL `/agenda?domiciliar=1`.
- [ ] Se o loading no botão não for suficiente, adicionar skeleton/estado de carregamento na listagem.

### Atendimentos

- [ ] Alterar botão "Cancelar" dos cards agendados:
  - usar variante terracota/danger suave;
  - diferenciar claramente de "Abrir paciente";
  - manter estado disabled durante update.

### Marca

- [ ] Substituir "Portal Restaurativo" por "Experiência Clínica Fluida" em:
  - sidebar desktop/mobile
  - topbar/mobile header
  - login
  - register
- [ ] Conferir que a nova frase não quebra em telas pequenas.

## Fora de Escopo

- Integração de e-mail
- Google Calendar
- Lembretes automáticos
- Reestruturação completa do dashboard
- Redesign global da navegação

## Decisões Arquiteturais

- [ADR-004](../decisions/ADR-004-integracoes-externas.md) — Integrações externas ficam para fases posteriores

## Contratos

### HTTP

Nenhum endpoint novo obrigatório se `ENCAMINHAMENTO` ficar fora desta fase.

Se `ENCAMINHAMENTO` for gerável:

```
POST /api/documents
Body: {
  patientId: string,
  type: "ENCAMINHAMENTO",
  period?: string
}
Response 201: { document: Document }
```

### Interno

```typescript
const DOCUMENT_TYPE_META = {
  RELATORIO_PROGRESSO: {
    title: 'Relatório de evolução',
    description: 'Resumo clínico do progresso do paciente ao longo das sessões.',
  },
}
```

## Migrations

Sem migration obrigatória.

Se `ENCAMINHAMENTO` for gerável:

```prisma
enum DocumentType {
  LAUDO_FISIOTERAPEUTICO
  RELATORIO_PROGRESSO
  DECLARACAO_COMPARECIMENTO
  ENCAMINHAMENTO
}
```

## UI

- [ ] Página: `/documentos`
- [ ] Página: `/dashboard`
- [ ] Página: `/agenda`
- [ ] Página: `/atendimentos`
- [ ] Componente: `DocumentTypeCards`
- [ ] Componente: `PeriodInfoTooltip`
- [ ] Componente: `QuickActions`
- [ ] Componente: `DomiciliarToggle`
- [ ] Componente: `SessionCard`
- [ ] Componentes de layout/auth com texto "Portal Restaurativo"

## Checklist Final

- [ ] Cards de documentos aparecem responsivos em mobile e desktop
- [ ] Cada card explica claramente a utilidade do documento
- [ ] Info do período funciona por clique e hover/focus
- [ ] QuickActions tem botões visíveis e coerentes com o design-system
- [ ] DomiciliarToggle tem hover ativo e loading perceptível
- [ ] Botão "Cancelar" usa cor diferente de "Abrir paciente"
- [ ] "Portal Restaurativo" não aparece mais no código
- [ ] Sem roxo em classes/tokens novos
- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` passa sem erros
- [ ] `.docs/CONTEXT.md` atualizado
- [ ] `README.md` atualizado
- [ ] `.docs/CHANGELOG.md` atualizado
- [ ] Validação manual no browser em desktop e mobile

## Notas para Próxima Sessão

Esta fase é a melhor primeira entrega porque reduz atrito visível sem depender de serviços
externos. Se o usuário aprovar `ENCAMINHAMENTO` como documento real, implementar o template
PDF na mesma passada; caso contrário, deixar card "em breve" para não prometer geração que
o backend ainda não suporta.
