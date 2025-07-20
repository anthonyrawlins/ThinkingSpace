**Project Title:** 3D System Mapper & Interactive Editor

---

## 📅 Phase 1: Core Viewer MVP

### Goals:

- Render 3D nodes from YAML/JSON
- Show labels (sprites)
- Draw connections (Bezier curves)
- Add encapsulating bounding boxes
- Support basic camera controls and fog/depth cues

### Deliverables:

- Three.js app scaffold
- YAML/JSON loader (with example files)
- Interactive OrbitControls camera
- Node renderer with size/label/color metadata
- Connection renderer (Bezier)
- Group renderer with wireframe boxes
- Fog + background scene effects
- Working build + docs

---

## 🔧 Phase 2: User Interaction Layer

### Goals:

- Select/move nodes in 3D (with grid snapping)
- Add/delete nodes and connections from UI
- Edit node properties (rename, resize, re-color)
- Connect nodes by dragging between I/O faces
- Draw bounding boxes interactively

### Deliverables:

- Raycaster-based selection system
- TransformControls for dragging/moving objects
- Snapping mechanism to grid and fixed planes
- GUI panel (dat.GUI or custom overlay) to edit node/group/connection properties
- Drag-to-connect interface (anchor to face center)
- Right-click / toolbar to delete elements
- Real-time updates to in-memory data model

---

## ⚖️ Phase 3: Bi-Directional YAML/JSON Editing

### Goals:

- Load from YAML
- Reflect all 3D edits back to YAML
- Export current scene state (nodes/groups/connections) to YAML
- Optional live syncing or file watching

### Deliverables:

- Parser/writer module
- Save button / keyboard shortcut to export YAML
- Bi-directional binding layer between scene objects and YAML structure
- Option to save/download/export file to disk or browser storage

---

## 🪧 Tech Stack

- **Three.js**: 3D rendering
- **OrbitControls / TransformControls**: Navigation + movement
- **js-yaml**: YAML parsing/stringifying
- **dat.GUI or Leva**: Editor overlay
- **Vite or Webpack**: Build system
- **TypeScript** (optional): Safer state handling

---

## 💼 Repo Structure

```bash
3d-system-mapper/
├── public/
│   └── index.html
├── src/
│   ├── main.js              # App entry
│   ├── scene.js             # 3D scene setup
│   ├── loader.js            # YAML/JSON loading
│   ├── editor.js            # Selection + transform logic
│   ├── gui.js               # Properties panel
│   └── exporter.js          # YAML writer
├── data/
│   ├── nodes.yaml
│   ├── connections.yaml
│   └── groups.yaml
├── package.json
├── vite.config.js
└── README.md
```

---

## ✅ Developer Tasks

### Frontend Dev

- Implement object rendering
- Hook up camera + controls
- Wire in label sprites and group boxes

### UX Dev

- Implement GUI overlay
- Selection and manipulation layer
- Drag-to-connect logic

### Backend / Infra

- YAML I/O integration
- Export pipeline
- Save/load tooling

---

## ⌛ Timeline (3-4 devs)

| Phase         | Time Estimate |
| ------------- | ------------- |
| Phase 1       | 1.5 weeks     |
| Phase 2       | 2 weeks       |
| Phase 3       | 1 week        |
| Polish / Docs | 3-5 days      |

---

## 🌐 GitHub-Ready Boilerplate
Expand the ./3d-system-mapper.zip file to create the local working folder.

Project repo will need to be setup at... https://github.com/anthonyrawlins/ThinkingSpace.git
