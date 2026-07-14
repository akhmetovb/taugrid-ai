Add a bottom floating panel so users can drag energy system components onto the canvas and create new nodes.

## Implementation

1. Add a floating pill-shaped toolbar at the bottom-center of the canvas.

2. The panel has two display states: **group view** (default) and **expanded view**.

   - **Group view**: shows one icon + label per top-level group, in this order:
     - Generation
     - Storage
     - Grid
     - Load
     - Control
   - **Expanded view**: shows a back button, a divider, then the icon buttons for that group's components.

3. Clicking a group icon in group view switches the panel to that group's expanded view. Clicking the back button returns to group view. The panel does not auto-collapse after a drag — it stays expanded so multiple components from the same group can be dragged in sequence.

4. Group-to-component mapping:

   - **Generation**
     - Utility-scale generator
     - Solar PV array
     - Wind turbine
     - Hydro generator
     - Backup generator
   - **Storage**
     - Battery storage (BESS)
     - Pumped hydro storage
   - **Grid**
     - Substation
     - Transformer
     - Transmission line
     - Distribution line
     - Circuit breaker / switchgear
     - Recloser
     - Point of interconnection (POI) / grid tie
     - Microgrid controller
   - **Load**
     - Residential load
     - Commercial load
     - Industrial load
     - EV charging station
   - **Control**
     - Smart meter
     - SCADA node

   Note: POI / grid tie and microgrid controller live under **Grid**, not as a separate top-level group — interconnection components are few enough that a standalone group would create visual imbalance against groups with 4–5 items.

5. Use `@iconify/react` for icons (`<Icon icon="..." />`). Prefer the Tabler set for consistency with existing UI icons. Where no suitable icon exists for a grid-specific component (e.g. substation, recloser), fall back to the closest available icon and flag it with a `// TODO: replace with dedicated icon` comment rather than blocking implementation.

6. When dragging a component, include the following in the drag payload:
   - component type (e.g. `solar-pv-array`)
   - group (e.g. `generation`)
   - display label
   - default node size
   - default node color (derived from the group's color, not per-component)

   Use sensible default sizes:
   - generation and storage components: square-ish, medium size
   - grid infrastructure components (substation, transformer): square-ish, medium size
   - transmission/distribution lines: not draggable as point nodes — handled as edges, not covered by this panel
   - load components: square-ish, medium size
   - control components: smaller than generation/load nodes

7. Add `dragover` and `drop` handling to the canvas wrapper.

8. On drop:
   - read the dragged component payload
   - convert the screen position to canvas coordinates using React Flow
   - create a new node at that position
   - use the component's display label as the initial node label (not empty — unlike generic shapes, energy components should be immediately identifiable)
   - use the group's default node color
   - use the dragged component type as the node's `componentType` field
   - initialize a `coordinates` field on the node as `null` — this is resolved separately via a geocoding request (see AI Layout Generation / Twin View mapping) and is distinct from the node's canvas x/y position

9. Generate each node ID using the component type, timestamp, and a counter.

10. Add a basic renderer for the custom canvas node type so new nodes are visible.

    For this unit, render every component as a simple bordered rectangle with an icon and label centered, using the group's color for the icon and border accent. Component-specific visuals (e.g. distinct shapes per component type) will be added later.

## Check When Done

- Group view shows exactly the 5 top-level groups, no components visible by default.
- Clicking a group expands to show only that group's components, plus a working back button.
- Panel does not auto-collapse after a single drag.
- Component drag payload includes type, group, label, default size, and default color.
- Drop logic creates new canvas nodes with the expected component data, including a `null` `coordinates` field for later geocoding.
- New nodes use the custom canvas node type and display their label immediately.
- Icons render via `@iconify/react` with no missing/broken icon references.
- `npm run build` passes without type errors.