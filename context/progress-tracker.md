# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Phase 1: Design System & UI Primitives

## Current Goal

- Feature 11: Base canvas — complete

## Completed

- Feature 01: Design System — shadcn/ui initialized (Tailwind v4), Button/Card/Dialog/Input/Tabs/Textarea/ScrollArea added, dark theme tokens set in globals.css, lib/utils.ts cn() helper in place, lucide-react installed.
- Feature 02: Editor Chrome — `components/editor/editor-navbar.tsx` (fixed top bar, sidebar toggle with PanelLeftOpen/PanelLeftClose, dark bg + border) and `components/editor/project-sidebar.tsx` (floating overlay, slide-in from left, Projects title + close button, My Projects / Shared tabs with empty states, New Project button). Dialog pattern ready via existing shadcn Dialog wired to dark theme tokens.
- Feature 03: Auth — `ClerkProvider` wraps root layout with dark theme from `@clerk/ui/themes` and CSS variable overrides. `proxy.ts` at root uses `clerkMiddleware` with `createRouteMatcher` to protect all non-public routes. Sign-in (`app/sign-in/[[...sign-in]]/page.tsx`) and sign-up (`app/sign-up/[[...sign-up]]/page.tsx`) pages use two-panel layout (left: logo + tagline + feature list, right: Clerk form; small screens: form only). Root `app/page.tsx` redirects authenticated users to `/editor`, unauthenticated to `/sign-in`. `UserButton` added to editor navbar right section. `@clerk/ui` installed.
- Feature 04: Project Dialogs — `hooks/use-project-dialogs.ts` centralizes dialog state, form state, and loading state with mock project data. `app/editor/page.tsx` updated with editor home screen (heading, description, New Project button). Three dialogs added: `components/editor/create-project-dialog.tsx` (name input + live slug preview), `components/editor/rename-project-dialog.tsx` (prefilled input, auto-focus, Enter submits), `components/editor/delete-project-dialog.tsx` (destructive confirm, no input). `components/editor/project-sidebar.tsx` updated with project items, rename/delete actions on owned projects only, and mobile backdrop scrim. All wired through `useProjectDialogs` hook in the editor page.
- Feature 05: Prisma — `prisma/models/project.prisma` defines `ProjectStatus` enum, `Project` model (ownerId, name, description, status, canvasJsonPath, timestamps, indexes on ownerId and createdAt), and `ProjectCollaborator` model (projectId, email, createdAt, cascade delete, unique on project/email, indexes on email and projectId/createdAt). `lib/prisma.ts` exports a cached singleton that branches on DATABASE_URL: `prisma+postgres://` uses Accelerate via `@prisma/extension-accelerate`, otherwise uses `@prisma/adapter-pg` directly. Migration `20260712093238_init` applied and client generated to `app/generated/prisma`.
- Feature 06: Project API routes — `app/api/projects/route.ts` (GET lists owner's projects ordered by createdAt desc; POST creates with defaulted name "Untitled Project"), `app/api/projects/[projectId]/route.ts` (PATCH renames, DELETE deletes). Auth via Clerk `auth()`: 401 for unauthenticated, 403 for non-owner mutations. `npm run build` passes.
- Feature 07: Wire editor home — `lib/project-data.ts` exports `SidebarProject` interface and `getOwnedProjects`/`getSharedProjects` helpers (Prisma, server-only). `hooks/use-project-actions.ts` manages dialog state and real mutations: create calls `POST /api/projects` with a slugified name + 5-char random suffix as the room ID, then navigates to `/editor/[roomId]`; rename calls `PATCH` and refreshes; delete calls `DELETE`, redirects to `/editor` if deleting the active workspace, otherwise refreshes. `app/editor/page.tsx` converted to async Server Component — fetches owned and shared projects via Clerk `auth()` + `currentUser()` and passes them to `EditorHomeClient`. `app/editor/editor-home-client.tsx` is the extracted `"use client"` shell with sidebar, dialogs, and sidebar-open state. `components/editor/project-sidebar.tsx` updated to accept separate `ownedProjects`/`sharedProjects` arrays of `SidebarProject`. `components/editor/create-project-dialog.tsx` updated: `slug` prop renamed to `roomId`, label changed to "Room ID:". `POST /api/projects` updated to accept an optional `id` field (validated against `^[a-z0-9-]+$`) so the project ID and Liveblocks room ID stay aligned. `npm run build` passes.
- Feature 08: Editor workspace shell — `lib/project-access.ts` exports `getCurrentIdentity` (Clerk `auth()` + `currentUser()` → `{ userId, email }`) and `getProjectIfAccessible` (single Prisma query, checks owner or collaborator, returns `{ id, name, isOwner }` or null). `components/editor/access-denied.tsx` is a centered layout with lock icon, short message, and a `Link` styled via `buttonVariants({ variant: 'outline' })` back to `/editor`. `app/editor/[roomId]/page.tsx` is a server component: unauthenticated → redirect to `/sign-in`; no project access or non-existent project → `<AccessDenied />`; otherwise renders `WorkspaceClient`. `app/editor/[roomId]/workspace-client.tsx` is the `"use client"` shell: manages `sidebarOpen` and `aiSidebarOpen` state; `EditorNavbar` shows project name, Share placeholder, and Sparkles AI-sidebar toggle; `ProjectSidebar` receives `activeRoomId` to highlight the current room; canvas area is a dark placeholder with centered message; right AI sidebar is a slide-in placeholder. `components/editor/editor-navbar.tsx` updated with optional `projectName`, `isAISidebarOpen`, `onToggleAISidebar` props — workspace actions (Share + Sparkles toggle) render only when `projectName` is present. `components/editor/project-sidebar.tsx` updated with optional `activeRoomId` prop and `Link`-based navigation on project items. `npm run build` passes.
- Feature 09: Share dialog — `app/api/projects/[projectId]/collaborators/route.ts` handles GET (list, auth-gated: owner or collaborator), POST (invite by email, owner only, upsert), DELETE (remove by email, owner only). Clerk Backend API (`clerkClient().users.getUserList`) enriches collaborator emails with display name and avatar; falls back to email-only if not found. `components/editor/share-dialog.tsx` is a `"use client"` dialog: owners see invite form + remove buttons + copy-link; collaborators see read-only list. `components/ui/avatar.tsx` added via shadcn CLI. `lib/project-access.ts` updated to include `isOwner` in `AccessibleProject`. `components/editor/editor-navbar.tsx` updated with `onShareClick` prop. `app/editor/[roomId]/workspace-client.tsx` updated with `isOwner` prop, share dialog state, and `<ShareDialog>`. `app/editor/[roomId]/page.tsx` passes `isOwner` to `WorkspaceClient`. `npm run build` passes.
- Feature 10: Liveblocks setup — `liveblocks.config.ts` updated with `Presence` (`cursor: {x,y}|null`, `isThinking: boolean`) and `UserMeta` (`id`, `info.name`, `info.avatar`, `info.color`). `lib/liveblocks.ts` exports `getLiveblocksClient()` (lazy singleton, avoids build-time secret validation) and `getCursorColor(userId)` (deterministic djb2 hash over a 10-color palette). `app/api/liveblocks-auth/route.ts` is a `POST` handler: requires Clerk auth (401), reads `room` from body, verifies project access via `getProjectIfAccessible` (403 on failure), calls `getOrCreateRoom` to ensure the room exists, then issues an access-token session with `name`, `avatar`, and `color` attached, granting `FULL_ACCESS` to that room. `@liveblocks/node` installed. `npm run build` passes.
- Feature 11: Base canvas — `types/canvas.ts` defines `CanvasNodeData` (`label`, `color`, `shape`), `CanvasNode` (typed React Flow node, discriminant `'canvasNode'`), and `CanvasEdge` (discriminant `'canvasEdge'`). `components/editor/canvas-wrapper.tsx` is a `"use client"` component: sets up `LiveblocksProvider` (auth endpoint `/api/liveblocks-auth`), `RoomProvider` (room ID, initial presence `cursor: null, isThinking: false`), an inline class-based `CanvasErrorBoundary`, and `ClientSideSuspense` with a "Connecting…" fallback. `components/editor/canvas.tsx` is a `"use client"` component: uses `useLiveblocksFlow({ suspense: true, nodes: { initial: [] }, edges: { initial: [] } })`, renders `ReactFlow` with synced nodes/edges/handlers, `ConnectionMode.Loose`, `fitView`, `Cursors` (live collaborator cursors), `MiniMap`, and `Background` (dot pattern). CSS for `@xyflow/react`, `@liveblocks/react-ui`, and `@liveblocks/react-flow` imported in `canvas.tsx`. `app/editor/[roomId]/workspace-client.tsx` updated: placeholder `<main>` replaced with `<main className="fixed inset-0 top-12 overflow-hidden"><CanvasWrapper roomId={roomId} /></main>`. `npm run build` passes.

## In Progress

- None.

## Next Up

- Feature 12: (to be defined in next feature spec)

## Open Questions

- None yet.

## Architecture Decisions

- Using Tailwind v4 with `@theme inline` in globals.css for token mapping — no tailwind.config.js.
- shadcn/ui components live in components/ui/ and must not be modified after installation.
- Dark-only theme: all color values are set in `:root` with no `.dark` class override.
- Project token naming convention: `--bg-*` for surfaces, `--text-*` for copy, `--border-*` for borders, `--accent-*` for brand/AI, `--state-*` for feedback states.
- Tailwind utilities: `bg-base`, `bg-surface`, `text-copy-primary`, `text-copy-muted`, `border-surface-border`, `text-brand`, `bg-accent-dim`, etc. are mapped via @theme inline.

## Session Notes

- Project uses Next.js 16, React 19, Tailwind v4 (@tailwindcss/postcss), TypeScript strict mode.
- shadcn init auto-installed tw-animate-css and shadcn/tailwind.css — both are imported in globals.css.
- `components.json` was generated by shadcn CLI and reflects the project configuration.
