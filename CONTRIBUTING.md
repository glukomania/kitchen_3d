# Contributing

## Core principles

- Minimalism is more important than “universal” abstractions.
- UI / State / Renderer / Data must be physically separated.
- Renderers depend only on the store (selectors) — not on props.

## Where to change what

- UI/styles: `src/features/**/ui`, `src/shared/ui/**`
- Data/catalogs: `src/features/**/data`
- State (Zustand): `src/features/**/state`
- 2D/3D: `src/renderers/**`
- Web component: `src/widget/**`

## Prevent component bloat

Recommendations:

- if a component is 150+ lines — split it
- separate “smart” (store) from “dumb” (markup)
- shared bits belong in `src/shared/ui/components`

## Commands

```bash
npm run typecheck
npm run lint
npm run format
```


