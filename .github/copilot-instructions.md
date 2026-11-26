<!-- .github/copilot-instructions.md for production-notes -->
# Quick instructions for AI coding agents

Focus: small React + TypeScript frontend built with Vite. Primary concerns are state (Zustand), local persistence (Dexie + IndexedDB), and local audio file handling (File System Access API + Howler).

- Big picture
  - Single-page React app (entry: `src/main.tsx`, top component `src/App.tsx`).
  - Global app state lives in the Zustand store at `src/stores/productionStore.ts`.
  - Persistent storage uses Dexie (IndexedDB) and is configured in `src/db.ts`.
  - Local audio files are accessed via the browser File System Access API; the logic lives in the store (`loadDirectory`, `scanDirectory`, `loadFileFromHandle`).
  - Audio playback uses Howler (`howler`) for soundboard previews/playing; the main player uses HTMLAudio via object URLs.

- Key project patterns & conventions (use these exactly)
  - Persisted soundboard saved under Dexie table `soundboard` with fixed id `0` (see `hydrateSoundboard` & subscription at bottom of `productionStore.ts`).
  - Directory handles are stored in Dexie `fileSystemHandles` under id `'directory'`. When rehydrating, code checks `queryPermission` and clears the DB entry if permission is not granted (`rehydrateDirectoryHandle`).
  - File scanning is recursive via `scanDirectory(handle, path, files)` and filters on `.mp3`/`.wav` in the store implementation.
  - When loading local audio into the main player, the code creates an object URL and revokes old ones (`currentObjectUrl` pattern). Follow this pattern to avoid leaking URLs.
  - Preview playback uses a single `previewHowl` and a sound cache `Map<string, Howl>` for soundboard items (see `soundCache` and `previewHowl` in `productionStore.ts`).

- Runtime / developer commands
  - Start dev server (with HMR): `npm run dev` (runs `vite --host`).
  - Build: `npm run build` (runs `tsc && vite build`).
  - Preview production build: `npm run preview`.
  - Lint: `npm run lint` (ESLint configured to check `.ts`/`.tsx`).

- Environment / integration points
  - Freesound integration: `src/stores/productionStore.ts` calls Freesound API; it requires `VITE_FREESOUND_API_KEY` in the environment (Vite will expose it to the client if prefixed with `VITE_`).
  - IndexedDB database name: `productionNotesDB` (see `src/db.ts`). Use browser devtools > Application > IndexedDB to inspect during debugging.
  - File System Access API is required for the directory picker (Chromium-based browsers only).

- How to make safe changes
  - To add UI features, prefer adding actions to `productionStore.ts`. Keep logic for side-effects (file access, Dexie calls, fetch) inside the store to preserve single source of truth.
  - When changing audio flow, follow existing object-URL lifecycle: revoke prior URL before creating a new one. Unload Howl instances (call `.unload()`) before removing them from `soundCache`.
  - For persistence changes, update `src/db.ts` schema first and migrate existing records carefully; tests/migration helpers are not present—document migration in PR.

- Useful code pointers (examples)
  - Hydration at app bootstrap: `src/App.tsx` calls `useProductionStore.getState().hydrateSoundboard()` and `rehydrateDirectoryHandle()`.
  - Soundboard persistence: subscription at bottom of `src/stores/productionStore.ts` writes `db.soundboard.put({ id: 0, sounds })`.
  - Directory persistence: `loadDirectory()` writes `db.fileSystemHandles.put({ id: 'directory', handle: dirHandle })`.

If anything above is unclear or you want more examples for a specific task (add a new store action, change DB schema, or add audio features), tell me which area to expand and I will update this file.
