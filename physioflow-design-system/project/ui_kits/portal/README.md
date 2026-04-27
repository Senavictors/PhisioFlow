# PhisioFlow Portal Restaurativo — UI Kit

High-fidelity recreation of the **PhisioFlow Portal Restaurativo** web app, based on 5 screenshots in `uploads/`.

## Screens included

- **Dashboard (Visão Geral)** — greeting, KPIs, weekly evolution chart, quick actions, recent sessions, attention card
- **Pacientes** — directory with filters (tipo de atendimento chips, classificação, ordenação), search, table, Progresso Restaurativo hero + Pendentes hoje tile
- **Atendimentos** — empty state
- **Agenda** — upcoming + realized appointments with domiciliar tag
- **Documentos** — 4 document type tiles + patient picker + "Em breve" teaser

Open `index.html` for the interactive click-thru. Use the left sidebar to switch between screens.

## Components

All components are defined inline in `index.html` (single-file hi-fi recreation). Key components:

- `Sidebar` — fixed w-64 left rail, sage-green active pill
- `Topbar` — page title, search, notification bell, help, avatar
- `KpiCard` — tinted-icon + giant Fraunces numeral + label + muted subtext
- `FilterChipGroup` — rounded-full chips, sage active fill
- `Select` — rounded-xl select
- `DataTable` — horizontal-only dividers, UPPERCASE headers
- `Badge` — Domiciliar / Agendado / Realizado / Debilitado variants
- `Button` — Primary (terracotta), Secondary (sage), Ghost
- `DocTypeCard` — tinted-icon document tile
- `AgendaItem` — time + patient + status row
- `ProgressHero` — sage-green hero card with ring KPI
- `AttentionCard` — terracotta-soft alert surface

## Caveats

- Reconstructed from screenshots only. Actual spacing / shadows are approximations.
- Logo reconstructed; real SVG welcome.
