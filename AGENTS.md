# Rules for AI Agents (and Code Generation)

Goal: keep this project **minimal**, with **clear layer boundaries**, and prevent component bloat.

## Do not

- Add new libraries unless it is absolutely necessary.
- Create “universal super-components” with 300+ lines.
- Pass render parameters to 2D/3D renderers via React props.
- Mix UI, domain types, and state in the same file.
- Import UI from `features/**/ui` into `features/**/state` or `renderers/**`.

## Do (and prefer)

- Split UI into small components and UI primitives.
- Keep all "options → renderer params" computations in `selectors.ts`.
- Keep renderer side effects local to `renderers/**`.
- Keep widget inputs in `widget/` and translate them into the store via actions.
- Add BEM-style classes (e.g., `configurator-container`, `configurator-button`) to all UI elements alongside Tailwind classes for easier DevTools debugging and element identification.

## Hard import boundaries (layers)

- `model/`: types and domain structures only.
- `data/`: may import `model/`, must not import UI.
- `state/`: may import `model/` and `data/` (for initial state), must not import UI or renderers.
- `features/**/ui`: may import `state/` (actions/selectors), `shared/ui/components`, `model/` (types). Must not import renderers directly except at top-level composition.
- `shared/ui`: UI primitives only, no state and no renderers.
- `renderers/`: may import only `app/hooks` and `state/selectors`.
- `widget/`: may import `app/*` and `features/*`, but must not contain configurator business logic.

## Component size & style

- If a component is > 150 lines, split it.
- If a component both reads the store and renders a lot of markup, split it into container/view.
- Code comments must be **English-only**. Do not add comments in other languages.

## After changes

- Run `npm run lint` and `npm run format` (or at least ensure you did not break linting).
- Update `README.md` / `ARCHITECTURE.md` if the public structure or API changed.


