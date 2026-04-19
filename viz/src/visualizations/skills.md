# Visualization AI Agent Guidelines

Welcome, fellow agent! If you are working on expanding, modifying, or refactoring the visualizations in this project, you **must** adhere to the following architectural, modularity, and stylistic guidelines established for this codebase.

## 1. Modular Architecture (Code Splitting)
Do **not** create or maintain monolithic `.jsx` files. Every visualization should be housed within its own cleanly separated directory inside the `visualizations/` folder.

A standard visualization folder should look exactly like this:
- `/my-visualization/`
  - `index.jsx`: The shell. Imports `visualization.jsx` and `educational-section.jsx`, organizing them into a split layout (usually Main Viz on top/left, Educational below/right).
  - `visualization.jsx`: The "smart" orchestrator handling state (`useState`, `useEffect`, `tfjs` logic). It should compose various smaller UI panels rather than rendering thousands of lines of JSX.
  - `educational-section.jsx`: The theory behind the math. **Crucially, this must always be Dark Themed** (see Design System below) and self-contained.
  - `constants.js`: Holds all static definitions, default parameters, configuration objects, and LaTeX string constants.
  - `utils.js`: Houses pure mathematical functions, data formatters, and reusable helper functions without React rendering logic.
  - `/assets/icons.jsx`: Contains completely extracted, stateless SVG components (e.g., decorative visuals, complex curves). Keep massive SVG paths out of the main logic files!
  - `[feature]-panel.jsx`: Break down massive UI chunks (e.g., `controls-bar.jsx`, `loss-curve-chart.jsx`, `data-preview-table.jsx`) into their own focused component files.

## 2. Design System & Aesthetics
We follow a highly polished, colorful, yet deeply structured UI design language across all visualizers.

### Compactness & High-Density UI
- The user strongly prefers a **compact, tight interface**.
- Avoid massive, sprawling margins. Ensure that the core visualization and its related interactive controls can fit nicely without excessive scrolling. 
- Use smaller padding (e.g., `p-2`, `p-3`), tighter text (`text-xs`, `text-[10px]`, `text-[11px]`), and avoid wasted white space.
- Use `flex-wrap` and tight grid layouts to intelligently pack statistical data.

### Styling Elements (Interactive Visualizations)
- **Primary Accents**: Violet (`violet-500` / `violet-600`) and Purple should be heavily utilized as the primary interactive or thematic tint.
- **Backgrounds**: Use clean whites (`bg-white`) and soft slates (`bg-slate-50`) to separate internal control panels. 
- **Containers**: All interactive cards should use rounded corners (`rounded-xl` or `rounded-2xl`), subtle soft shadows (`shadow-sm`), and soft defined borders (`border-slate-200`).
- **Data Coloring**: Use `emerald` (for accuracy / correct metrics), `rose/red` (for loss / errors), and `blue/sky` to consistently visually separate data arrays.
- **Typography Sub-headers**: Use uppercase, deeply tracking letters for section headers (e.g., `text-[10px] font-bold text-slate-500 uppercase tracking-widest`).
- **Numbers**: Use `font-mono` exclusively for all numbers, parameters, arrays, shape dimensions, or statistics.

## 3. Educational Section Requirements
The `educational-section.jsx` file signifies a "zone change" moving from the interactive playground to deep theory.
- **The Dark Theme**: It MUST use the unified dark theme. Do not build it with a white background.
  - Main container: `bg-slate-900 text-slate-300`
  - Inner cards/callouts: `bg-slate-950` or `bg-slate-800/50`.
  - Borders/Dividers: `border-slate-800` or `border-slate-700`.
  - Headers: Bright white (`text-white` or `text-slate-100`).
- **Mathematical Rendering**: NEVER use plain unicode strings for formulas (e.g., `x² + y²`). You MUST use `@matejmazur/react-katex`. Import `TeX` and wrap all math formulas beautifully (`<TeX math="\frac{\partial \mathcal{L}}{\partial W_2}" />` or use the `block` prop for large multi-line equations). Include `import 'katex/dist/katex.min.css';`.

## 4. Development & Framework Rules
- **CSS Utilities**: The `index.css` global file contains custom CSS utilities like `.custom-scrollbar`. Apply this class to any horizontally or vertically overflowing data tables to avoid ugly default browser scroll bars.
- **Registration**: If you add a entirely new visualization module, ensure it is registered beautifully in `viz/src/visualizations.js` array with an appropriate ID, icon, `gradient`, and description.
- **Logic Integrity**: While restyling and moving components, ensure that NO underlying mathematical state logic or numerical values are altered.
- **Build Checks**: Always perform a build verification (`npx vite build`) after completing your architectural splits to prevent TypeScript or JSX bundling failures due to improper file imports.
