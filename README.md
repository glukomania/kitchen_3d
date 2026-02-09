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
npm run build:widget
```

This produces `dist/configurator-widget.iife.js` and `dist/configurator-widget.css`.

Build demo app:

```bash
npm run build
```

Build everything (app + widget) for deployment:

```bash
npm run build:all
```

**Note:** When deploying to GitHub Pages (via `npm run deploy` or GitHub Actions), both the demo app and widget are automatically built and included in the `dist` folder.

Lint/format:

```bash
npm run lint
npm run format
npm run format:fix
```

## Embed as a web component

`npm run build:widget` produces `dist/configurator-widget.iife.js` and `dist/configurator-widget.css`.
The bundle auto-registers the custom element **`<sk-configurator>`**.

### Embedding on another page

If the widget is hosted on GitHub Pages (e.g., `https://glukomania.github.io/kitchen_3d/`):

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Load widget CSS -->
  <link rel="stylesheet" href="https://glukomania.github.io/kitchen_3d/configurator-widget.css">
</head>
<body>
  <!-- Load widget script -->
  <script src="https://glukomania.github.io/kitchen_3d/configurator-widget.iife.js"></script>
  
  <!-- Use custom element -->
  <sk-configurator id="my-configurator"></sk-configurator>
  
  <script>
    // Pass catalog via data-catalog attribute
    const catalog = {
      products: [
        {
          id: "kitchen",
          title: "Kuchyň",
          subtitle: "Konfigurátor kuchyně",
          basePrice: { amount: 50000, currency: "CZK" },
          optionGroups: [
            {
              id: "color",
              kind: "swatches",
              label: "Barva",
              options: [
                { id: "white", label: "Bílá", color: "#FFFFFF" },
                { id: "light-gray", label: "Světle šedá", color: "#F3F4F6" }
              ],
              defaultOptionId: "white"
            }
          ]
        }
      ]
    };
    
    // Wait for element registration and set catalog
    customElements.whenDefined('sk-configurator').then(() => {
      const element = document.getElementById('my-configurator');
      element.setAttribute('data-catalog', JSON.stringify(catalog));
    });
  </script>
</body>
</html>
```

### Local development embed

For local testing:

```html
<link rel="stylesheet" href="dist/configurator-widget.css">
<script src="dist/configurator-widget.iife.js"></script>
<sk-configurator id="my-configurator"></sk-configurator>
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


