# TauGrid AI


## Overview

TauGrid AI is a digital twin platform for smart energy grids, enabling teams to design, visualize, and analyze energy systems collaboratively. The platform centers on a collaborative **Design Workspace**, paired with a live **Twin View** panel:

- **Design Workspace** — a collaborative environment where teams model energy system components (generation, storage, distribution, loads) and their relationships. Users describe a system in plain English; an AI agent schematically maps that system into an energy system layout on a shared canvas; collaborators refine the layout together.

- **Twin View** — a live 2D/3D geospatial panel, rendered from the energy system layout, layering the system and its data onto real-world terrain and infrastructure context. As the layout evolves, the Twin View updates in step.

Together, these two views let users move fluidly between abstract energy system layout and its physical, geographic realization — without leaving a single collaborative session.


## Goals

1. Let authenticated users create and manage energy system projects.
2. Provide a collaborative real-time canvas for layout design.
3. Let users import prebuilt starter layouts into the canvas.
4. Let AI generate an initial energy system layout from a natural language prompt.
5. Let collaborators refine the AI-generated layout.
6. Let collaborators request further AI-assisted refinement of the layout.
7. Layer the energy system layout onto the 2D/3D Twin View environment.


## Core User Flow

1. User signs in.
2. User creates or selects a project.
3. User enters the project workspace.
4. User optionally imports a starter layout template into the canvas.
5. User prompts the AI to generate or extend the energy system layout.
6. AI generates nodes and edges in the shared canvas.
7. Collaborators edit and refine the layout.
8. Twin View renders live from the current layout.
9. User explores the Twin View (terrain, infrastructure, data layers).



## Features

### Authentication and Projects

- User sign-in and route protection.
- Project creation, ownership, and collaborator access.
- Project list and workspace navigation.

### Collaborative Canvas

- Shared real-time canvas using Liveblocks and React Flow.
- Live cursors, presence indicators, and node/edge editing.
- Canvas snapshots persisted to the filesystem.

### Starter Energy System Layouts

- A curated library of prebuilt energy system layout templates.
- Users can import a starter template into the canvas at any point during editing.
- Templates are static canvas snapshots loaded directly into the active room.
- Covers common patterns: microgrid, residential solar + storage, EV charging hub, industrial cogeneration, and more.


### AI Layout Generation

- AI generates an energy system layout from a user-supplied prompt.
- Output is structured as canvas nodes and edges written into the shared room.
- Generation runs as a durable background task.
- Each node has both a canvas position (for layout on the shared canvas) and geographic coordinates (lat/lng), resolved via a geocoding request. Geographic coordinates are what map the node onto its real-world location in the Twin View.


### Twin View

- Built on Mapbox GL JS; renders live, client-side, from current canvas state.
- Grid connections are routed along real street geometry between the coordinates of connected energy system components.
- If routing data is unavailable for a given connection, the line falls back to a direct path between component coordinates.


## Scope

### In Scope

- Authentication and route protection
- Project creation and ownership
- Collaborator access by project
- Starter energy system layout template library and import
- Real-time shared canvas with nodes, edges, and presence
- AI-powered energy system layout generation from prompts
- Live 2D/3D Twin View rendering from the canvas graph
- Persistent storage for project metadata and generated artifacts


### Out Of Scope

- Billing and subscription systems
- Enterprise permission tiers beyond owner and collaborator
- Versioned spec history and review workflows
- Production object storage migration
- Mobile-native applications

## Success Criteria

1. A signed-in user can create and open a project.
2. Multiple users can collaborate in the same canvas simultaneously.
3. A user can import a prebuilt starter design into the canvas.
4. AI can generate an energy system layout into the shared room from a prompt.
5. The layout renders correctly as a live 2D/3D Twin View. 
6. Project metadata and generated artifacts are stored in the correct layers.
