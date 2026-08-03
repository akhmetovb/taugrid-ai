Add resizing and inline label editing to canvas nodes.

## Implementation

1. Add resizing.
   - Selected nodes should show resize handles.
   - Only point-node components support resizing (generation, storage, grid infrastructure, load, control). Edges (transmission/distribution lines) are unaffected — they were never point nodes to begin with.
   - Enforce a minimum size per group, not a single global minimum — control nodes (smart meter, SCADA node) have a smaller default size than generation/load nodes, so a single global minimum would either be too large for control nodes or too small to be meaningful for the others.
   - Keep resize handles subtle and consistent with the dark canvas UI, and visually distinct from the group-color border accent so they aren't mistaken for part of the component's icon/status styling.

2. Add inline label editing.
   - Keep the label centered inside the node, below/beside the icon, matching the existing icon+label layout from the floating-panel unit — don't let editing shift the icon position.
   - Double-click the label area (not the icon) to enter edit mode, since the icon area is visually part of the component's identity.
   - Since every node is created with a non-empty label (the component's display label), empty-state placeholder handling is a secondary case — likely reached only if a user manually clears the text. If the label is cleared, fall back to the component's default display label (e.g. "Solar PV array") on blur rather than leaving the node unlabeled, since unlabeled energy components are hard to distinguish on the canvas.
   - Show a textarea directly over the label while editing, sized to the node's current (possibly resized) dimensions, not a fixed default.
   - Update the label as the user types.
   - Close editing on blur or `Escape`. On `Escape`, discard changes and revert to the prior label; on blur, commit the current text (falling back per the empty-label rule above).
   - Prevent text editing interactions (click, drag-select, keystrokes) from triggering node drag or canvas pan.

3. Keep all node updates (size and label) connected to the existing collaborative canvas state, and make sure they only touch `width`/`height`/`label` — leave `componentType`, `group`, and `coordinates` untouched. `coordinates` in particular stays `null` until the separate geocoding step; resizing/label edits must not overwrite or reset it.

## Scope Limits

- Don't change the bordered-rectangle/icon rendering from the floating-panel unit — this unit only adds resize handles and label-edit affordances on top of it.
- Don't change the floating panel, drag payload, or drop logic.
- Don't change how dropped nodes are created or their default sizing per group.
- Keep this focused on resize and label editing only.

## Check When Done

- Selected point-node components show resize handles; edges are unaffected.
- Resizing respects a per-group minimum size and updates node dimensions through the existing node state flow.
- Double-clicking a node's label area opens inline label editing without disturbing the icon.
- Label editing updates node labels through the existing sync flow; clearing a label falls back to the component's default display label.
- Editing closes on blur (commit) or Escape (discard).
- Text interactions do not trigger canvas drag or pan.
- `componentType`, `group`, and `coordinates` are never modified by resize or label edits.
- `npm run build` passes without type errors.