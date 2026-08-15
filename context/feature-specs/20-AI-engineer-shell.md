Fill in the AI sidebar placeholder built in Feature 08 with a working AI
Engineer chat panel. The panel follows a Cove-style layout: a compact,
chat-first floating card anchored to the bottom of the workspace, with
its own detached floating input bar.

Unlike the Feature 08 placeholder, this surface is not toggled open or
closed — it is always present, pinned to the lower portion of the
screen, for as long as the user is in the workspace.

## Implementation

1. Remove the toggle, make the surface persistent

   - Remove the AI sidebar toggle button and its Sparkles icon from
     `editor-navbar.tsx`, along with the `isAISidebarOpen` /
     `onToggleAISidebar` props that drove it.
   - Remove the `aiSidebarOpen` state from `workspace-client.tsx`. The AI
     panel and input bar render unconditionally whenever the workspace
     is mounted — there is no open/closed state to manage anymore.

2. Component split

   - Split into `ai-panel.tsx` (the floating content card) and
     `ai-chat-input.tsx` (the standalone floating input bar).
   - Input bar is always visible, pinned to the bottom-right of the
     workspace with consistent offset from the canvas edges. It never
     hides.
   - Content card sits directly above the input bar, bounded height
     (max around `70vh`), same styling as before: `bg-base/95`,
     `border-surface-border`, `rounded-3xl`, existing shadow treatment.

3. Panel chrome

   - A single reset/new-thread icon button sits as a small corner
     overlay, top-right of the panel — not a bordered header row. No
     divider line, no close button, matching the Cove reference exactly
     (its only chrome is a small refresh icon in the same corner).
   - This icon belongs to the card chrome specifically: it shows during
     the full empty state and once a real conversation exists, but not
     during the brief moment the panel is showing only the greeting
     bubble with no card chrome around it (step 5) — there's nothing to
     reset yet at that point.

4. Empty state (default view, before any message is sent)

   - Centered bot/spark icon using the existing AI accent token
     (`accent-ai` / `text-accent-ai-text`).
   - Heading: `Design your energy system together`, `text-primary`.
   - Starter prompts as a vertical stack of clickable text lines (not
     pill chips), styled with `text-accent-ai-text`, hover brightens:
     - `Generate a residential solar + storage layout`
     - `Design a microgrid for a small campus`
     - `Add battery storage to my current layout`
   - Hint text below the list, muted: `Chat below to get started`.
   - The panel's height is not fixed — it sizes to this content (icon +
     heading + prompts + hint, with padding), the same way the Cove
     reference card wraps its content rather than reserving empty
     space. At the panel's target width this produces a card roughly in
     a 4:3 landscape ratio (width : height), matching the Cove
     reference's proportions — don't force a taller fixed height that
     leaves dead space below the hint text.

5. Empty state shrinks to a greeting bubble, once per visit

   - The full empty state (icon, heading, starter prompts, hint) is
     never followed by nothing — it's followed by a single greeting
     bubble that stays visible for the rest of the visit. The panel
     never disappears entirely.
   - The greeting bubble reuses the exact same styling as an assistant
     chat message (step 6): `bg-elevated`, `border-surface-border`,
     `text-accent-text`, `border-radius: 14px 14px 14px 4px`. Copy:
     `Hi, I'm the AI Engineer. What are you working on?` It sizes to
     its own content — it is not wrapped in the big rounded-3xl card
     chrome anymore; the card chrome (background, border, shadow) is
     specific to the full empty state and drops away with it.
   - This transition happens the first time the input receives focus
     during a visit, and only the first time — see "Visit" below for
     what resets it. Further focus/blur cycles during the same visit
     leave the greeting bubble as-is; it does not toggle back to the
     full empty state or disappear.
   - Track this with plain component state local to the AI panel (e.g.
     a `hasShownGreeting` flag), not localStorage, sessionStorage,
     cookies, or a database field.
   - "Visit" means one mount of the workspace for this room. Since
     `/editor/[roomId]` is its own route, navigating to another project
     and back, or logging out and back in, both remount the workspace
     and reset `hasShownGreeting` to its default — so the full empty
     state naturally reappears on the next visit without any extra
     reset logic. Leaving the tab open and coming back later without
     navigating away does not remount anything, so the panel correctly
     stays as it was.
   - Once a real message is sent, the greeting bubble becomes the first
     turn in the actual message thread (step 6) rather than being
     discarded — it reads as the AI Engineer's opening line in the
     conversation, not a UI element that gets swapped out.

6. Chat state

   - Sending a message replaces the empty state with a scrollable
     message list inside the content card; the input bar stays fixed
     below it, always visible.
   - User messages right-aligned, `bg-brand-dim border-brand/50 border-2
     text-copy-primary`. Assistant messages left-aligned, `bg-elevated
     border border-surface-border text-accent-text`.

7. Chat input bar

   - Auto-resizing textarea, ~48px min height up to 160px max.
   - Rounded container (`rounded-2xl`), `bg-elevated`,
     `border-surface-border`.
   - No send button inside the input row. `Enter` submits, `Shift+Enter`
     adds a newline — Enter is the only way to send, same as Cove.

8. AI presence icon

   - A small rounded-square icon sits directly beside the input bar —
     not overlapping it — same relationship as Cove's mascot sitting
     next to the "Chat with Cove" bar.
   - The input bar and the presence icon together span exactly the same
     total width as the content card above them (the panel's width).
     Derive both from one shared width value so they can never drift
     out of sync — this is the same width ratio the Cove reference
     uses between its card and its input row.
   - Icon is a fixed square, its side length equal to the input bar's
     single-line height, so the row reads as one visual unit at a
     consistent height — matching the Cove reference, where the mascot
     and the input pill are the same height.
   - Reuses bot/spark glyph and `accent-ai` styling from the empty
     state icon.
   - Idle at rest; pulses once when a message is sent (Enter or starter
     prompt).

## Scope Limits

- Don't add backend logic, Liveblocks wiring, or real AI generation.
- Don't add the canvas-level card-creation menu (`New card` /
  `PDF or Image` / `URL`) — that belongs to a future study-cards feature,
  not this shell.
- Don't add tabs, file attachments, agent files, or per-project
  instructions in this unit — those are a later "AI Engineer, advanced"
  pass on top of this chat-only shell.
- Don't add any mechanism to manually show/hide the panel — visibility
  only changes through the auto-shrink-to-greeting behavior in step 5,
  and the panel (or its greeting bubble) is never fully hidden.
- Don't persist `hasShownGreeting` anywhere (localStorage,
  sessionStorage, cookies, or the database). The reset-on-remount
  behavior described in step 5 is sufficient and intentional — it's
  what makes the full empty state reappear on a genuine new visit.
- Don't wire the AI presence icon's animation to real generation state
  (streaming, thinking, error). Only the local pulse-on-send visual from
  step 8 is built here — a real "thinking" state comes with the AI
  Generation feature.

## Open Questions

- Whether starter prompts should be dynamic (based on project state) or
  static — add to `progress-tracker.md` if unresolved before
  implementation.
- If a future feature keeps `/editor/[roomId]` mounted while switching
  between projects (e.g. a multi-project tab strip, instead of a full
  route change), the reset-on-remount trick for `hasShownGreeting` in
  step 5 stops working and would need an explicit reset trigger
  instead. Not a concern today — flag for reconsideration if that
  navigation pattern is ever added.
- Reflecting canvas node/component selection (e.g. `N selected`) in the
  chat input, as in the Cove reference, is deliberately out of scope
  here. It requires lifting selection state up from the canvas to a
  level shared with the AI panel, and only becomes meaningful once
  selected components can actually be passed into AI generation as
  context. Needs its own spec once that groundwork exists.

## Check When Done

- No AI toggle button or Sparkles icon remains in `editor-navbar.tsx`;
  no `aiSidebarOpen` state remains in `workspace-client.tsx`.
- AI panel and input bar are always mounted, pinned to the bottom of the
  workspace, for the lifetime of the workspace session.
- Empty state shows icon, heading, clickable prompt list, hint text — no
  chip-style buttons.
- Focusing the input bar shrinks the full empty state into a single
  greeting bubble exactly once per workspace visit; the panel is never
  fully hidden — the greeting bubble stays visible in its place for the
  rest of the visit, and further focus/blur cycles don't change it
  again.
- Re-entering the project — via navigation from another project, a full
  reload, or a fresh login — shows the full empty state again, since
  `hasShownGreeting` resets naturally on remount. No localStorage,
  sessionStorage, cookie, or database persistence is used for this.
- Sending a real message turns the greeting bubble into the first turn
  of the actual message thread, which then persists and does not
  shrink or hide.
- No close button anywhere in the AI panel.
- No send button inside the input bar; `Enter` is the only way to
  submit, `Shift+Enter` still adds a newline.
- A separate AI presence icon sits directly beside the input bar (not
  overlapping it); the two together span the same total width as the
  content card above, and the icon's side length matches the input
  bar's single-line height. It's idle by default and plays a single
  short pulse whenever a message is sent.
- The reset icon is a small corner overlay with no bordered header row
  and no divider — matching the Cove reference's minimal chrome.
- The content card sizes to its content rather than a fixed height,
  producing roughly the same width:height ratio as the Cove reference.
- Message and input behavior (Enter/Shift+Enter, message styling) works
  as specified.
- `npm run build` passes.