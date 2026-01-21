# Configurator Starter Kit (React + Tailwind + Zustand + Three.js)

A minimal starter kit for a universal 2D/3D product configurator as a **drop-in web component**.

Goal: enable fast UI customization per client/product while keeping **clean architecture boundaries** and preventing component bloat.

## Quick start

Install:

```bash
npm i
```

Run demo (regular React app):

```bash
npm run dev
```

Build the **widget** (IIFE, drop-in):

```bash
npm run build
```

Build demo:

```bash
npm run build:demo
```

Lint/format:

```bash
npm run lint
npm run format
npm run format:fix
```

## Embed as a web component

`npm run build` produces `dist/configurator-widget.iife.js`.
The bundle auto-registers the custom element **`<sk-configurator>`**.

Minimal embed:

```html
<script src="dist/configurator-widget.iife.js"></script>
<sk-configurator data-renderer="three"></sk-configurator>
```

Pass catalog data (JSON via attribute):

```html
<script>
  const catalog = {
    products: [
      {
        id: "chairs",
        title: "Chairs",
        subtitle: "Office chairs",
        basePrice: { amount: 9339, currency: "CZK" },
        optionGroups: [
          {
            id: "color",
            kind: "swatches",
            label: "Color",
            options: [{ id: "black", label: "Black", color: "#111827" }],
            defaultOptionId: "black"
          }
        ]
      }
    ]
  };

  const element = document.querySelector("sk-configurator");
  element.setAttribute("data-catalog", JSON.stringify(catalog));
<\/script>
```

Note: this starter renders into **light DOM** (no shadow DOM) so Tailwind styles work without style injection complexity.

## Architecture rules (high level)

- **Keep components small**: if a component grows, split it (view/container or subcomponents).
- **Separate UI from state and data**.
- **Renderers (2D/3D) read only from the store** (selectors), not from React props.
- **Selectors are the contract** between state and renderers: map “options → renderer params” in `selectors.ts`.

See: `ARCHITECTURE.md`.

## Folder structure

```
src/
  app/                  # store, provider, typed hooks
  features/
    configurator/
      data/             # catalogs/mocks/adapters (no UI)
      model/            # domain types only
      state/            # slice + selectors (contract for UI/renderer)
      ui/               # feature UI components (tailwind, composition)
  renderers/
    2d/                 # 2D renderer placeholder
    three/              # three.js renderer minimal example
  shared/ui/            # small reusable UI primitives
  widget/               # web-component wrapper
  App.tsx               # local dev shell (not part of the widget API)
  main.tsx              # local dev entry point (Vite)
```

## For developers

Usually you want to:

- edit Tailwind classes in `src/features/**/ui` and `src/shared/ui/**`
- replace `sampleCatalog` (or pass your catalog via the web component)
- add/replace renderers in `src/renderers/**`

## Rules for AI agents

See `AGENTS.md`.


