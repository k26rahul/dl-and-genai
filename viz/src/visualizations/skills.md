# Visualization AI Agent Guidelines

Welcome, fellow agent! If you are working on expanding, modifying, or refactoring the visualizations in this project, you **must** adhere to the following architectural, modularity, and stylistic guidelines established for this codebase.

## 1. Modular Architecture (Code Splitting)
Do **not** create or maintain monolithic `.jsx` files. Every visualization should be housed within its own cleanly separated directory inside the `visualizations/` folder.

A standard visualization folder should look exactly like this:
- `/my-visualization/`
  - `index.jsx`: The shell. Imports `visualization.jsx` and `educational-section.jsx`, organizing them into a split layout (usually Main Viz on top/left, Educational below/right).
  - `visualization.jsx`: The "smart" orchestrator handling state (`useState`, `useEffect`, `tfjs` logic). It should compose various smaller UI panels rather than rendering thousands of lines of JSX.
  - `educational-section.jsx`: The theory behind the math. Self-contained and dark-themed (same as the rest of the page — see Design System below).
  - `constants.js`: Holds all static definitions, default parameters, configuration objects, and LaTeX string constants.
  - `utils.js`: Houses pure mathematical functions, data formatters, and reusable helper functions without React rendering logic.
  - `/assets/icons.jsx`: Contains completely extracted, stateless SVG components (e.g., decorative visuals, complex curves). Keep massive SVG paths out of the main logic files!
  - `[feature]-panel.jsx`: Break down massive UI chunks (e.g., `controls-bar.jsx`, `loss-curve-chart.jsx`, `data-preview-table.jsx`) into their own focused component files.

## 2. Design System & Aesthetics

> **The entire application uses a unified dark theme.** There is no light mode. Do NOT use `bg-white`, `bg-slate-50`, `bg-slate-100`, or any other light-background Tailwind classes anywhere in the interactive components. The whole page — including panels, cards, controls, charts, and tables — must follow the dark palette described below.

### Compactness & High-Density UI
- The user strongly prefers a **compact, tight interface**.
- Avoid massive, sprawling margins. Ensure that the core visualization and its related interactive controls can fit nicely without excessive scrolling.
- Use smaller padding (e.g., `p-2`, `p-3`), tighter text (`text-xs`, `text-[10px]`, `text-[11px]`), and avoid wasted white space.
- Use `flex-wrap` and tight grid layouts to intelligently pack statistical data.

### Dark Theme Color Tokens

These are the canonical tokens to use across every visualization component:

| Role | Token |
|---|---|
| **Page background** | `bg-slate-900` |
| **Page text** | `text-slate-200` |
| **H1 title** | `text-white` |
| **Subtitle / secondary text** | `text-slate-400` |
| **Card / panel background** | `bg-slate-800` |
| **Card border** | `border-slate-700` |
| **Inner well / code area** | `bg-slate-900 border-slate-600` |
| **Secondary card / row background** | `bg-slate-700` |
| **Secondary border / divider** | `border-slate-600` |
| **Section header text** | `text-[10px] font-bold text-slate-400 uppercase tracking-widest` |
| **Mono numbers** | `font-mono text-slate-200` |
| **Violet accent panel** | `bg-violet-900/20 border-violet-700` |
| **Violet label text** | `text-violet-200` or `text-violet-300` |
| **Violet select** | `bg-slate-700 border-violet-600 text-violet-200` |
| **Generic select / input** | `bg-slate-700 border-slate-600 text-slate-200` |
| **Reset / neutral button** | `bg-slate-600 text-slate-200 hover:bg-slate-500` |
| **Slider track** | `bg-slate-600 accent-violet-500` |
| **Table header row** | `bg-slate-700 text-slate-400 border-slate-600` |
| **Table row divider** | `border-slate-700` |
| **Table row hover** | `hover:bg-slate-700` |
| **SVG axis lines** | `stroke='#334155'` |
| **SVG axis tick labels** | `fill='#64748b'` |
| **SVG chart area background** | `bg-slate-900` or `background: transparent` |

### Styling Elements (Interactive Visualizations)
- **Primary Accents**: Violet (`violet-500` / `violet-600`) is the primary interactive or thematic tint. Violet text on dark surfaces should be `text-violet-300` or `text-violet-400` (not `text-violet-800` / `text-violet-900` — those are unreadable on dark).
- **Containers**: All cards use rounded corners (`rounded-xl` or `rounded-lg`), subtle shadows (`shadow-sm`), and dark borders (`border-slate-700`).
- **Typography Sub-headers**: Use uppercase, tracked letters for section headers (e.g., `text-[10px] font-bold text-slate-400 uppercase tracking-widest`).
- **Numbers**: Use `font-mono` exclusively for all numbers, parameters, arrays, shape dimensions, or statistics.

### Semantic / Contextual Colors — Always Preserved

These colors carry mathematical meaning and must **never** be changed to match the "dark theme pattern". They are intentionally vivid against the dark background:

| Color | Meaning | Example Class |
|---|---|---|
| 🔴 Rose / Red | Loss value, error, negative derivative | `text-red-500`, `text-rose-500` |
| 🟢 Emerald / Green | Accuracy, correct predictions, positive derivative | `text-emerald-400`, `text-emerald-500` |
| 🔵 Blue | Forward pass, train loss curve, positive weights | `text-blue-400` (lightened from `text-blue-600` for dark bg) |
| 🟣 Purple | Backward pass / backpropagation | `text-purple-400` |
| 🟠 Orange | Test loss curve | `text-orange-400` |
| 🟡 Amber / Yellow | Bias node markers in MLP network graph | `fill='#fbbf24'` (SVG, preserved as-is) |
| 🌈 Dynamic (derivativeColor) | `getDerivativeColor(slope)` — computed green↔red | Applied via `style={{ color }}` inline |

> **Important**: Semantic color classes on dark backgrounds should use the `-400` shade instead of `-600` for readability (e.g., `text-blue-400`, `text-emerald-400`), but the color family itself must not change.

### Recharts (used in real-world-neural-network-training)
Configure chart chrome for dark mode:
```jsx
<CartesianGrid stroke='#334155' />
<XAxis tick={{ fill: '#64748b' }} axisLine={{ stroke: '#334155' }} tickLine={false} />
<YAxis tick={{ fill: '#64748b' }} axisLine={{ stroke: '#334155' }} tickLine={false} />
<Tooltip contentStyle={{ border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0' }}
         labelStyle={{ color: '#94a3b8' }} />
```

## 3. Educational Section Requirements
The `educational-section.jsx` file signifies a "zone change" moving from the interactive playground to deep theory. It shares the same dark theme as the rest of the page.
- **Theme**: `bg-slate-900 text-slate-300` as main container.
  - Inner cards/callouts: `bg-slate-950` or `bg-slate-800/50`.
  - Borders/Dividers: `border-slate-800` or `border-slate-700`.
  - Headers: Bright white (`text-white` or `text-slate-100`).
- **Mathematical Rendering**: NEVER use plain unicode strings for formulas (e.g., `x² + y²`). You MUST use `@matejmazur/react-katex`. Import `TeX` and wrap all math formulas beautifully (`<TeX math="\frac{\partial \mathcal{L}}{\partial W_2}" />` or use the `block` prop for large multi-line equations). Include `import 'katex/dist/katex.min.css';`.

## 4. Development & Framework Rules
- **CSS Utilities**: The `index.css` global file contains custom CSS utilities like `.custom-scrollbar`. Apply this class to any horizontally or vertically overflowing data tables to avoid ugly default browser scroll bars.
- **Registration**: If you add an entirely new visualization module, ensure it is registered beautifully in `viz/src/visualizations.js` array with an appropriate ID, icon, `gradient`, and description.
- **Logic Integrity**: While restyling and moving components, ensure that NO underlying mathematical state logic or numerical values are altered.
- **Build Checks**: Always perform a build verification (`npx vite build` via `cmd /c`) after completing your architectural changes to prevent JSX bundling failures due to improper file imports.
- **No Light Mode**: There is no theme toggle. Do not add one. The entire app is dark-only.
