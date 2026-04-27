# PhysioFlow — Brief (verbatim from user)

**Company description:** PhysioFlow

PhysioFlow — Design System (UI/UX)

Este documento define os padrões visuais e de experiência do usuário do Portal Restaurativo PhysioFlow, garantindo consistência, elegância e sensação acolhedora em toda a interface.

## 1. Princípios de Design

- **Acolhedor:** Fundo off-white quente (nunca branco puro), transmitindo conforto e leveza.
- **Editorial:** Uso de tipografia com personalidade (serifa em títulos) e destaque forte para números e KPIs.
- **Calmo:** Espaçamento generoso (p-6 a p-10) e bordas amplamente arredondadas (18px).

## 2. Paleta de Cores (OKLCH)

Tokens devem ser definidos no globals.css (Tailwind v4)

| Token          | Valor OKLCH             | Uso                              |
| -------------- | ----------------------- | -------------------------------- |
| `--background` | `oklch(0.985 0.008 85)` | Fundo geral (Bege sutil)         |
| `--foreground` | `oklch(0.27 0.02 160)`  | Texto principal (Verde profundo) |
| `--primary`    | `oklch(0.52 0.05 160)`  | Verde Sálvia (ações principais)  |
| `--accent`     | `oklch(0.72 0.09 45)`   | Terracota (destaques e CTAs)     |
| `--card`       | `oklch(1 0 0)`          | Branco puro (elevação visual)    |
| `--border`     | `oklch(0.9 0.012 85)`   | Bordas sutis                     |

## 3. Tipografia

### 3.1 Display (Títulos)

- Fonte: Fraunces
- Peso: Bold
- Uso: Nomes de páginas, KPIs, Números em destaque

### 3.2 Body (Interface)

- Fonte: Plus Jakarta Sans
- Uso: Textos gerais, Botões, Inputs e formulários

### 3.3 Label Editorial

- `text-[10.5px] uppercase tracking-widest font-bold`
- Uso: Headers de tabelas, Tags, Labels auxiliares

## 4. Componentes de Interface

### 4.1 Stat Cards (Dashboard)

- Container: Fundo branco (`--card`), Borda arredondada (`rounded-2xl` ≈ 18px)
- KPI: Fonte Fraunces, Tamanho `text-6xl`
- Subtexto: Estilo editorial, Cor `muted-foreground`

### 4.2 Sidebar

- Largura: `w-64` (256px)
- Posicionamento: Fixa à esquerda
- Divisor: Borda sutil à direita (`--border`)
- Estado Ativo: Fundo `--primary`, Texto branco, Efeito `shadow-glow`

### 4.3 Tabelas de Dados

- Estrutura: Sem linhas verticais, Apenas divisores horizontais suaves
- Interação: Hover `bg-muted/30`
- Badge "Domiciliar": Fundo terracota suave (`--accent`), Texto uppercase

## 5. Diretrizes de Espaçamento e Layout

- Padding padrão: `p-6` a `p-10`
- Espaçamento entre blocos: `gap-6` ou maior
- Bordas: Cards `rounded-2xl`, Inputs `rounded-xl` ou maior

## 6. Sensação Visual (Resumo)

| Elemento    | Sensação desejada    |
| ----------- | -------------------- |
| Cores       | Natural, terapêutico |
| Tipografia  | Editorial, elegante  |
| Espaçamento | Respirável, calmo    |
| Componentes | Suaves, acolhedores  |
