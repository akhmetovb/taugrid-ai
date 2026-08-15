Add an on-canvas component list and a per-component parameter panel, so AI-generated or manually dropped components can be reviewed, located, and edited.

## Component List (canvas-embedded)

1. Renders directly on the canvas, not in the navbar or left sidebar.
2. Hidden entirely when the canvas has zero components. Appears the moment the first component exists — via manual drop or AI generation. Disappears again if the last component is removed.
3. Initial appearance: collapsed pill, e.g. `Components (14)`, positioned top-center of the canvas.
4. User can drag the pill (and the expanded panel) to any position on canvas. Position is local per user/session client state — not synced via Liveblocks — matching the existing `sidebarOpen`/`aiSidebarOpen` pattern in `workspace-client.tsx`. Each collaborator can arrange it independently without affecting others' view.
5. Clicking the pill expands it into the full list. Clicking again (or an explicit collapse control) returns it to pill form. Expanding/collapsing does not reset its dragged position.
6. Expanded list:
   - Grouped by `group` (Generation, Storage, Grid, Load, Control), matching the floating panel's taxonomy — section headers, no interactive filter chips.
   - Each row: icon (colored per group), label, and a small status dot if the component has one or more missing required parameters.
   - Search input at the top, filtering rows by substring match against **`label` only and `componentType` only** — not `group`.

## Row Interactions

7. Clicking a row opens the parameter panel for that component (see below). This does **not** pan, zoom, or select the node on canvas — no camera movement, so users can click through many rows in sequence without visual disruption.
8. Each row also has a small locate icon (crosshair). Clicking it:
   - Selects the node on canvas using the existing selection state (same resize-handle outline as a direct click).
   - Pans/zooms to the node **only if it is currently outside the viewport bounds** — if already visible, skip camera movement entirely.
   - Plays a brief pulse/glow ring around the node (fades out over ~600–800ms) so the user can visually confirm which node was selected, especially when no pan occurred.

## Parameter Panel

9. Opens as a right-side panel, in the same layout region as the AI sidebar. No automatic mutual-exclusion logic — if both happen to be open and overlap, the user closes the AI sidebar manually (same as managing any other toggled panel today).
10. Fields are driven by `componentType` — each component type shows its own relevant parameter set (e.g. solar PV array: rated capacity, tilt/azimuth, inverter rating, tracking type, location; battery storage: power rating, energy capacity, round-trip efficiency, SoC min/max; etc.).
11. Each field shows a status badge:
    - **AI estimated** — value was inferred by AI generation, not yet reviewed.
    - **confirmed** — value has been explicitly reviewed or edited by a user.
    - **missing** — required field has no value; flagged but does not block other actions.
12. Editing a field updates its status to `confirmed`.
13. Panel actions: `Reset to AI values` (reverts all fields in this panel back to their originally-generated values) and `Save changes` (commits edits through the existing collaborative canvas state, same mutation pattern used for label/size edits in Feature 13).
14. Parameter data added by this feature (component electrical/physical parameters) must not touch `componentType`, `group`, or `coordinates` — same invariant as Feature 13's label/resize editing.

## Scope Limits

- Do not change the bordered-rectangle/icon node rendering from Features 12–13.
- Do not change the floating drag-panel, drag payload, or drop logic.
- Do not implement live recalculation of downstream values (Twin View, sizing checks) on parameter edit — parameters are stored metadata only for this unit.
- Do not add group filter chips or multi-select filtering — search is label + componentType substring match only.

## Open Questions (add to `progress-tracker.md`)

- None — recalculation (AI-driven, triggered from the parameter panel) and its downstream Twin View update are deferred to a future feature, once the AI sidebar chat surface is built. This unit stores parameters as static metadata only; no recalculation logic is implemented here.

## Check When Done

- Component list is invisible with zero components and appears on first component (drop or AI-generated).
- Pill starts top-center, is draggable, and expand/collapse works without losing position.
- Search matches only `label` and `componentType`, not `group`.
- Clicking a row opens the parameter panel with no camera movement.
- Locate icon selects the node, pans only when off-screen, and shows a fading pulse.
- Parameter panel shows per-field AI estimated / confirmed / missing badges driven by `componentType`.
- Reset to AI values and Save changes work through existing collaborative state.
- `componentType`, `group`, and `coordinates` are never modified by parameter edits.
- `npm run build` passes without type errors.