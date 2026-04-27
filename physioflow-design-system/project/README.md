# PhisioFlow Design System

A design system for **PhisioFlow** — _o ecossistema completo para o fisioterapeuta moderno_. The first surface is the **Portal Restaurativo**, a practice-management web app for physiotherapists: patient tracking, session logging (atendimentos), agenda, and clinical document generation.

The interface language is **Brazilian Portuguese**, the tone is **warm, editorial, and restorative**, and the visual identity leans on a sage-green + terracotta palette over a bege (warm off-white) canvas. The internal tagline is **"Portal Restaurativo"** — the whole experience is meant to feel calm, unhurried, and humane, in contrast to typical clinical SaaS.

## Product surfaces

There is one product represented in this project: the **PhisioFlow Portal Restaurativo** web app. Core screens observed:

| Screen                  | Route           | Purpose                                                          |
| ----------------------- | --------------- | ---------------------------------------------------------------- |
| Dashboard (Visão Geral) | `/`             | KPIs, weekly evolution chart, quick actions, recent sessions     |
| Pacientes               | `/pacientes`    | Patient directory, filters, classification, restorative progress |
| Atendimentos            | `/atendimentos` | Chronological history of sessions                                |
| Agenda                  | `/agenda`       | Scheduled and completed appointments, with domiciliar flag       |
| Documentos              | `/documentos`   | Clinical document generation (PDF)                               |

## Sources

Built from **five screenshots** provided by the user (originally under `uploads/`): Dashboard, Pacientes, Atendimentos (empty state), Agenda, Documentos clínicos. Specifications for colors, typography, and component rules came from the user's written brief (reproduced verbatim in `brief.md`). All further inference (hover states, exact spacing, iconography) is derived from the screenshots.

> **Caveat:** lacking a codebase, shadow values, exact spacing tokens, icon set, and logo SVG are reconstructions — not extractions. See CAVEATS at the bottom.

---

## Content fundamentals

**Language.** Brazilian Portuguese throughout. Never translate UI strings to English.

**Voice.** Warm, professional, restorative. The product refers to itself as a **"Portal Restaurativo"** — restoration, evolution, progress.

**Addressing the user.** Informal second person (_você_), never _tu_, never _senhor/senhora_. The dashboard greets with _"Olá, bem-vindo de volta 👋"_.

**Casing.** Page titles use **sentence case** with acentuação preserved. Nav items and section eyebrows use **UPPERCASE** with wide letter-spacing — the editorial label treatment. Body, buttons, table cells: sentence case.

**Numbers and KPIs.** Numbers are heroes. The dashboard leads with giant Fraunces-serif numerals. Never hide a KPI behind a word when the number itself can lead.

**Clinical terminology preserved:** _atendimento_, _paciente debilitado_, _domiciliar_, _laudo fisioterapêutico_, _encaminhamento_, _declaração de horas_, _evolução_.

**Tone examples** (from product):

- _"Olá, bem-vindo de volta 👋"_
- _"Acompanhe seus pacientes e a documentação clínica."_
- _"Você acompanha 1 pacientes ativos. Mantenha os atendimentos em dia para sustentar a evolução clínica."_
- _"Comece um fluxo em segundos."_
- _"Em breve você poderá emitir documentos personalizados..."_
- _"Nenhum atendimento registrado ainda. Vá até um paciente para registrar."_

**Emoji.** Used **once, sparingly**, as warm punctuation — 👋 on the greeting. Not as iconography.

**Eyebrow labels.** Tiny UPPERCASE + wide tracking: `PORTAL RESTAURATIVO`, `ÚLTIMOS 7 DIAS`, `PENDENTES HOJE`, `PRONTO PARA EMISSÃO`, `EM BREVE`, `PRÓXIMOS`.

---

## Visual foundations

### Color

- `--background` `oklch(0.985 0.008 85)` — warm bege canvas. **Never pure white.**
- `--foreground` `oklch(0.27 0.02 160)` — deep sage-green, used for body text rather than black.
- `--primary` `oklch(0.52 0.05 160)` — sage green. Nav active state, primary buttons, KPI numerals.
- `--accent` `oklch(0.72 0.09 45)` — terracotta. CTAs, domiciliar badges, warning tiles.
- `--card` `oklch(1 0 0)` — pure white, reserved for elevation.
- `--border` `oklch(0.9 0.012 85)` — bege-tinted border. Never cool grey.

Green and terracotta never meet as equals — green is the voice, terracotta is the spark. Fill ratios: ~85% bege + white, 10% sage, 5% terracotta.

### Typography

- **Display: Fraunces** (serif, Bold). Page titles, hero greetings, and KPI numerals at `text-6xl`. The serif on numbers is the brand's strongest signature.
- **Body: Plus Jakarta Sans**. Everything else.
- **Editorial label**: `10.5px / uppercase / tracking-widest / font-bold` in Plus Jakarta Sans.

### Spacing, radius, layout

- Container padding `p-6` to `p-10`. Generous.
- Section gap `gap-6` minimum; usually `gap-8`.
- Cards `rounded-2xl` (18px). The signature radius.
- Buttons, inputs `rounded-xl` (12px). Chips fully rounded.
- Sidebar: fixed `w-64` left rail, thin `--border` divider.

### Surface, elevation, shadow

- Canvas is bege. White is elevation.
- Resting shadow nearly invisible — elevation comes from the color contrast between white and bege.
- Sidebar active pill + hero cards use a sage-tinted `shadow-glow`.
- No photographic backgrounds, no gradients, no patterns, no textures.

### Tables

- Horizontal dividers only. No vertical lines.
- Column rhythm carried by whitespace and UPPERCASE headers.
- Row hover: `bg-muted/30`.

### Hover, press, motion

- Nav items: idle bege-text → hover darker fill → active sage fill + shadow-glow.
- Primary buttons darken ~4% on hover; no scale change.
- Press: barely-there 50ms opacity dip.
- Motion: 150–200ms fades, `ease-out`. No bounces, no parallax.

### Transparency & blur

- Not used. Every surface is opaque — the palette does the work.

### Imagery

- None observed. If needed: warm natural light, muted tones, care metaphors. Never clinical white-room stock.

### Corner radii

| Element     | Radius               |
| ----------- | -------------------- |
| Card        | `rounded-2xl` (18px) |
| Button      | `rounded-xl` (12px)  |
| Chip / pill | fully rounded        |
| Input       | `rounded-xl`         |
| Avatar      | fully rounded        |

---

## Iconography

Line icons with ~1.75px stroke, rounded joins — consistent with the **Lucide** set.

- Sidebar uses line icons at 16px alongside UPPERCASE labels.
- KPI cards place a tinted-square 40×40 icon container (sage-soft or terracotta-soft).
- Document type cards use the same tinted-square treatment.

**We substitute Lucide icons (via inline SVG / available from CDN).** Treat as a flag to confirm if the real product uses a different set (Phosphor, Heroicons, etc).

**Emoji**: only the 👋 on the greeting.
**Unicode marks**: `•`, `→` ("Ver atendimentos →").

**Logo**: sage-green rounded-square badge with white heartbeat glyph + _PhisioFlow_ wordmark in Fraunces bold. Reconstructed at `assets/logo.svg` — approximate; please replace.

---

## File index

```
/
├── README.md              ← you are here
├── brief.md               ← user's written brief
├── SKILL.md               ← Claude Skill manifest
├── colors_and_type.css    ← CSS vars: colors + type + spacing + radii + shadows
├── assets/
│   ├── logo.svg           ← PhisioFlow lockup (reconstructed)
│   └── logo-mark.svg      ← heartbeat badge only
├── fonts/                 ← @font-face loaded from Google Fonts CDN
├── preview/               ← Design System tab cards
└── ui_kits/
    └── portal/            ← Portal Restaurativo UI kit
        ├── README.md
        ├── index.html     ← interactive click-thru of 5 screens
        ├── kit.css
        ├── Icons.jsx
        ├── Chrome.jsx
        └── Screens.jsx
```

---

## Caveats & asks

- **Fonts.** No TTFs provided; Fraunces and Plus Jakarta Sans load from Google Fonts CDN. If you have licensed variants, drop them into `fonts/` and I'll swap the `@font-face`.
- **Icons.** Using Lucide as the closest match. Swap if wrong.
- **Logo.** Reconstructed from screenshots. Please attach the real SVG.
- **Shadows and hover states** are inferred. Happy to tune.
- **Empty states, errors, modals, settings, support, auth** — not shown, not built.
