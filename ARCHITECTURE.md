# Architecture: Universal Configurator (2D/3D)

## Goals

- keep the project minimal (no unnecessary layers)
- strict separation of **data / state / UI / rendering**
- embeddable as a **web component**
- predictable customization: developers can tweak UI safely without breaking state/rendering

## Layers

### 1) Data (catalog, adapters)

Location: `src/features/configurator/data`

- mock data (`sampleCatalog`)
- **no UI**

### 1.5) Platform Integrations

Location: `src/integrations`

- e-commerce platform adapters (Shopify, Shoptet, etc.)
- common interfaces (`PlatformAdapter`, `PlatformCart`)
- platform factory for creating instances
- **no UI, no state**

Each platform integration consists of:
- `client.ts` - API client
- `adapter.ts` - transforms platform data → `Catalog`
- `cart.ts` - handles cart operations

The widget automatically selects the correct integration based on configuration.

### 2) Model (domain types/structures)

Location: `src/features/configurator/model`

- types like `Catalog`, `Product`, `OptionGroup`, etc.
- no React/Zustand imports here

### 3) State (Zustand)

Location: `src/features/configurator/state`

- `store.ts` is the single source of truth
- `selectors.ts` is the contract between state and renderer/UI

Critical rule:

> Renderers must import only selectors (and typed hooks). They must not import UI and must not receive renderer params via props.

### 4) UI (React + Tailwind)

Location: `src/features/configurator/ui` and `src/shared/ui`

- UI components should not contain business logic
- local logic is OK (layout, event handlers), but **not “renderer param” computation**
- “options → renderer params” mapping belongs in selectors

### 5) Renderers (2D/3D)

Location: `src/renderers`

- each renderer lives in its own folder
- renderer reads only from `useAppSelector(selectRendererParams)` and stays self-contained

### 6) Widget (web component)

Location: `src/widget`

- `defineElement.tsx` registers `<sk-configurator>`
- each element instance owns its own store
- inputs are passed via attributes and translated into store actions

## Preventing component bloat

Recommended constraints:

- if a component is > 150 lines, split it
- keep at most one “smart” nesting level; everything else should be dumb/presentational
- “container” reads store; “view” renders markup from props
- shared small pieces belong in `src/shared/ui/components/*`

## Where to customize per client

1) Data:

- replace `sampleCatalog`
- or pass catalog into the widget via `data-catalog`

2) UI:

- edit `src/features/configurator/ui/*`
- add primitives to `src/shared/ui/components/*`

3) Rendering:

- add `src/renderers/three/*` or a new `src/renderers/<client>/*`
- update `selectRendererParams` for new options without touching renderer internals


