# Fleet

Fleet is a local‑first desktop dashboard builder. Organize your work into Projects, add Dashboards as tabs per project,
and lay out Widgets on a responsive grid. Widgets are draggable and resizable (via dnd‑kit) and all changes persist to a
local SQLite database through the official Tauri SQL plugin.

## Features

- Projects, dashboard tabs, and grid‑based widgets
- Drag, drop, and resize with snapping and bounds
- Local SQLite persistence (Tauri SQL), migrations included
- Modern UI with Tailwind v4 and shadcn/ui components
- Built as a fast, secure Tauri v2 desktop app

## Tech stack

- Tauri v2 (Rust backend, desktop shell)
- React 19 + TypeScript + Vite
- SQLite via `@tauri-apps/plugin-sql`
- TailwindCSS
- shadcn/ui
- dnd-kit

## Project structure

- App entry: `src/App.tsx`
- Global styles (Tailwind v4): `src/globals.css`
- UI components: `src/components`
  - Toolbar: `src/components/toolbar.tsx`
  - Dashboard grid (drag/resizing/persist): `src/components/dashboard-grid.tsx`
  - Welcome flow: `src/components/welcome.tsx`
- Utilities: `src/lib/utils.ts` (class name helper `cn`)
- Data layer
  - DB loader: `src/lib/db.ts`
  - Types: `src/lib/types.ts`
  - Repositories: `src/lib/repositories`
  - Services: `src/lib/services`
  - Grid occupancy: `src/lib/grid-occupancy.ts`
- Backend (Tauri)
  - Rust entry: `src-tauri/src/lib.rs`
  - Migrations: `src-tauri/src/migrations/*.sql`
  - Capabilities/permissions: `src-tauri/capabilities/default.json`

## Getting started

1. Install dependencies

```bash
bun install
```

2. Run the desktop app in development

```bash
bun tauri dev
```

## Scripts

- `bun tauri dev`: run the Tauri app in development
- `bun run dev`: run the Vite dev server (web preview)
- `bun run build`: typecheck and build the web bundle
- `bun run preview`: preview the built bundle
- `bun run lint`: format check via Prettier

## Notes

- The database uses a local SQLite file (e.g., `sqlite:fleet.db`). Migrations live under `src-tauri/src/migrations/`.
- UI uses shadcn/ui and Tailwind v4; keep red tones for destructive actions only.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) +
  [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) +
  [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
