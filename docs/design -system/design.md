Color Tokens

Light mode (:root):

Background → #f7f9f3

Foreground → #000000

Card → #ffffff / Foreground: #000000

Popover → #ffffff / Foreground: #000000

Primary → #4f46e5 / Foreground: #ffffff

Secondary → #14b8a6 / Foreground: #ffffff

Muted → #f0f0f0 / Foreground: #333333

Accent → #f59e0b / Foreground: #000000

Destructive → #ef4444 / Foreground: #ffffff

Border → #000000

Input → #737373

Ring (focus state) → #a5b4fc

Data Visualization (charts):

Chart 1 → #4f46e5

Chart 2 → #14b8a6

Chart 3 → #f59e0b

Chart 4 → #ec4899

Chart 5 → #22c55e

Sidebar (UI Shell):

Background → #f7f9f3

Foreground → #000000

Primary → #4f46e5 / Foreground: #ffffff

Accent → #f59e0b / Foreground: #000000

Border → #000000

Ring → #a5b4fc

Dark mode (.dark):

Background → #000000

Foreground → #ffffff

Card → #1a212b / Foreground: #ffffff

Popover → #1a212b / Foreground: #ffffff

Primary → #818cf8 / Foreground: #000000

Secondary → #2dd4bf / Foreground: #000000

Muted → #333333 / Foreground: #cccccc

Accent → #fcd34d / Foreground: #000000

Destructive → #f87171 / Foreground: #000000

Border → #545454

Input → #ffffff

Ring → #818cf8

Dark Charts:

Chart 1 → #818cf8

Chart 2 → #2dd4bf

Chart 3 → #fcd34d

Chart 4 → #f472b6

Chart 5 → #4ade80

Dark Sidebar:

Background → #000000

Foreground → #ffffff

Primary → #818cf8 / Foreground: #000000

Accent → #fcd34d / Foreground: #000000

Border → #ffffff

Ring → #818cf8

✍️ Typography

Sans → Allerta Stencil, ui-sans-serif, system-ui

Serif → Amiri Quran, ui-serif

Mono → Anonymous Pro, ui-monospace

Scale:

H1: 32–36px

H2: 24–28px

H3: 18–20px

Body: 16px

Small: 14px

Weights:

Regular 400, Semibold 600, Bold 700

Tracking / Letter Spacing:

Normal → 0.025em

Variants: tighter, tight, wide, wider, widest

🟦 Spacing & Grid

Base unit: 4/8px modular scale (--spacing: 0.25rem)

Container max-width: 1280px

Gutters: 16–24px

Grid: 12-column flexible

🟣 Shape & Shadows

Radius: 1rem

sm: radius - 4px

md: radius - 2px

lg: radius

xl: radius + 4px

Shadows:

--shadow-sm: subtle elevation (1px / 2px blur)

--shadow-md: medium (2px / 4px blur)

--shadow-lg: large (4px / 6px blur)

--shadow-xl: elevated (8px / 10px blur)

--shadow-2xl: deep elevation (stronger alpha)

🌑 Usage Rules

Light mode default, dark mode via .dark class toggle.

Primary (#4f46e5 / #818cf8) is brand-defining → use only for main actions.

Accent (#f59e0b / #fcd34d) reserved for highlights and alerts, not base UI.

Sidebar tokens keep shell navigation consistent across modes.
how to install:npx shadcn@latest add https://tweakcn.com/r/themes/cmfok4nnx000d04l7552dciz9