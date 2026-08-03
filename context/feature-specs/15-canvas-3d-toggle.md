Add a view toggle to the editor navbar so users can switch between the collaborative canvas and the (future) 3D Twin View.

## Toggle

Add a segmented control in the navbar center section:

- two options: `Canvas` and `3D View`
- `Canvas` is selected by default
- active option shows a filled background; inactive option is muted
- use `lucide-react` icons, consistent with existing navbar icons (not `@iconify/react` — that's reserved for energy component icons)

## State

- View state (`canvas` | `3d`) is owned by `workspace-client.tsx`, same pattern as existing `sidebarOpen` / `aiSidebarOpen` state.
- `editor-navbar.tsx` stays presentational: accepts `activeView` and `onViewChange` props, renders the toggle, does not own the state.
- Toggle only renders when `projectName` is present, same condition as the existing Share/AI actions.

## View Switching

- `canvas` view renders the existing `CanvasWrapper` (unchanged).
- `3d` view renders a placeholder: dark surface, centered message (e.g. "Twin View coming soon"), no Mapbox, no map libraries, no dependencies added.
- Switching views does not unmount/remount the canvas's Liveblocks room — keep `CanvasWrapper` mounted and toggle visibility, so live collaboration state isn't dropped when a user switches away and back.

## Scope Limits

- No Mapbox GL JS, no map rendering, no geospatial logic — this unit is the toggle and an empty placeholder only.
- Do not touch `CanvasWrapper`, `canvas.tsx`, or any Liveblocks/React Flow logic.
- Do not add a `Twin View` route or persist the active view anywhere — it resets to `canvas` on reload.

## Check When Done

- Toggle appears centered in the navbar, only in workspace context.
- Clicking `3D View` shows the placeholder; clicking `Canvas` returns to the live canvas without reconnecting the Liveblocks room.
- No new dependencies added.
- `npm run build` passes.