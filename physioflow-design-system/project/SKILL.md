---
name: phisioflow-design
description: Use this skill to generate well-branded interfaces and assets for PhisioFlow — "o ecossistema completo para o fisioterapeuta moderno" — either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping a warm, editorial, restorative healthcare product (pt-BR).
user-invocable: true
---

# PhisioFlow — Design Skill

Read `README.md` first for full brand context, content fundamentals, and visual foundations. Then explore:

- `colors_and_type.css` — CSS vars for all tokens (colors, type, spacing, radii, shadows, motion) + semantic type roles (`.h1`, `.t-kpi`, `.t-label`, etc). Always import this first.
- `brief.md` — the user's original written brief, verbatim.
- `assets/` — `logo.svg` (full lockup, reconstructed) + `logo-mark.svg` (badge only).
- `ui_kits/portal/` — full hi-fi recreation of the product with 5 screens (Dashboard, Pacientes, Atendimentos, Agenda, Documentos). Lift components from `Chrome.jsx`, `Screens.jsx`, `Icons.jsx` and styles from `kit.css`.
- `preview/` — atomic design-system cards (colors, type, spacing, buttons, chips, tables, sidebar, etc).

## Core brand facts

- **Language:** Brazilian Portuguese throughout. Never translate UI to English.
- **Tone:** warm, editorial, restorative. Use *você*. One 👋 on greetings, no other emoji.
- **Palette:** bege canvas `oklch(0.985 0.008 85)` + sage primary `oklch(0.52 0.05 160)` + terracotta accent `oklch(0.72 0.09 45)`. White is elevation, never canvas.
- **Type:** Fraunces (display, serif, bold) for titles and KPI numerals; Plus Jakarta Sans (body) for everything else; `10.5px uppercase tracking-widest bold` for editorial labels.
- **Radii:** `rounded-2xl` (18px) for cards, `rounded-xl` (12px) for buttons/inputs, fully rounded for chips and pills.
- **Spacing:** generous (`p-6` to `p-10`). Breathing room is part of the brand.
- **Icons:** Lucide line icons, 1.75px stroke. Tinted-square containers (40×40, sage-soft or terracotta-soft) in KPI / document-type contexts.
- **Motion:** 150–200ms fades, ease-out. No bounces, no parallax.

## Usage

If creating visual artifacts (slides, mocks, throwaway prototypes), copy the assets and CSS out and write static HTML files the user can view. Import `colors_and_type.css`, reuse component patterns from `ui_kits/portal/kit.css`, and stick to the pt-BR voice.

If working on production code, copy the tokens from `colors_and_type.css` into your Tailwind v4 `globals.css` under `@theme` and lift components from the UI kit as starting points.

If the user invokes this skill without any other guidance, ask what they want to build (a new screen? a marketing landing? a slide deck?), ask a couple of product questions, and act as an expert designer. Output HTML artifacts or production code depending on the need.

## Caveats the user is aware of

- Fonts loaded from Google Fonts CDN — replace with licensed files if available.
- Logo is a reconstruction from screenshots — ask for real SVG.
- Icon substitutions use Lucide — confirm if a different set is expected.
