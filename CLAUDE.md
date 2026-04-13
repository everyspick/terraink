# Terraink — Claude Code Guide

## Commands

```bash
bun install          # install dependencies
bun run dev          # start dev server (http://localhost:5173)
bun run build        # production build
bun run typecheck    # type-check without emitting
```

## Architecture: Feature-based + Hexagonal/Clean

Source is split into vertical feature slices under `src/features/`:

```text
src/
  features/
    export/       location/     map/          markers/
    install/      layout/       poster/       theme/       updates/
  core/
    cache/        fonts/        http/
    config.ts     services.ts
  shared/
    geo/          hooks/        ui/           utils/
  data/           styles/       types/
```

Each feature has up to four layers:

| Layer | Purpose | React allowed |
| --- | --- | --- |
| `domain/` | Pure types, port interfaces, pure logic | No |
| `application/` | Hooks that orchestrate use cases | Yes |
| `infrastructure/` | Concrete adapters (HTTP, cache, parsers) | No |
| `ui/` | Components that read context and dispatch | Yes |

### Layer import rules

| Layer | May import | Must not import |
| --- | --- | --- |
| `domain/` | nothing | infrastructure, application, ui, React |
| `application/` | domain, shared, core/config, core/services | infrastructure directly |
| `infrastructure/` | domain, shared, core | application, ui, React |
| `ui/` | domain, application, shared/ui, shared/utils | infrastructure directly |
| `core/services.ts` | infrastructure adapters | any feature |

## State Management

- Single source of truth: `PosterContext` — React Context + `useReducer`
- `posterReducer.ts` owns `PosterState`, `PosterForm`, and `PosterAction`
- Components call `usePosterContext()` directly — no prop drilling
- Side-effect logic lives in application hooks: `useFormHandlers`, `useMapSync`, `useGeolocation`, `useLocationAutocomplete`, `useCurrentLocation`, `useExport`

## Key Services (`src/core/services.ts`)

```ts
searchLocations            // location autocomplete
geocodeLocation            // name → coordinates
reverseGeocodeCoordinates  // coordinates → name
ensureGoogleFont           // font loading
compositeExport            // poster compositing
captureMapAsCanvas         // map → canvas
createPngBlob / createPdfBlobFromCanvas / createLayeredSvgBlobFromMap
createPosterFilename       // generate export filename
triggerDownloadBlob        // file download
```

Never call `fetch()`, `localStorage`, or external APIs directly — always go through services.

## TypeScript

- All new files: `.ts` / `.tsx`. No `.js` in `src/`.
- `strict: false`, `allowJs: true` — gradual migration is fine
- Use `@/` alias for all cross-feature imports — never `../../` across feature boundaries
- Port interfaces go in `domain/ports.ts` or `core/*/ports.ts` with an `I` prefix (`ICache`, `IHttp`)

## Environment Variables

All `VITE_*` vars are accessed **only** through `src/core/config.ts`. Never read `import.meta.env.*` anywhere else. Env vars are optional for local dev — check `config.ts` for fallback defaults.

## Personal Notes (my fork)

- I'm using this primarily to learn the hexagonal architecture pattern — the `domain/` → `application/` → `infrastructure/` separation is the main thing I want to understand better.
- Good starting point for exploration: `src/features/location/` — it's a self-contained feature with all four layers present.
