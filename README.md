# ThinkingSpace - 3D System Mapper

An interactive 3D system architecture visualizer and editor built with Three.js.

## 🚀 Phase 1 MVP - COMPLETE ✅

### Features Implemented:
- ✅ **3D Scene Rendering**: Full Three.js scene with lighting, fog, and camera controls
- ✅ **YAML Data Loading**: Loads nodes, connections, and groups from YAML files
- ✅ **Node Visualization**: 3D boxes with labels, colors, and size metadata
- ✅ **Connection Rendering**: Bezier curve connections between nodes
- ✅ **Group Bounding Boxes**: Wireframe containers for logical grouping
- ✅ **Object Selection**: Click to select nodes with visual feedback
- ✅ **GUI Controls**: dat.GUI interface for scene and object property editing
- ✅ **Export System**: Export current scene to YAML/JSON files
- ✅ **Interactive Camera**: OrbitControls for 3D navigation

### Demo Architecture:
The example data includes a microservices architecture with:
- **Frontend Layer**: API Gateway
- **Service Layer**: User Service, Auth Service  
- **Data Layer**: PostgreSQL Database, Redis Cache
- **Connections**: REST API calls, SQL queries, session data flows

## 🛠️ Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

## 🎮 Controls

- **Mouse**: Click to select objects
- **Mouse Drag**: Rotate camera view
- **Mouse Wheel**: Zoom in/out
- **Delete/Backspace**: Delete selected object
- **Escape**: Deselect object
- **Ctrl+S**: Export to YAML

## 📁 Project Structure

```
src/
├── main.js      - Application entry point
├── scene.js     - Three.js scene setup and rendering
├── loader.js    - YAML/JSON data loading
├── editor.js    - Object selection and interaction
├── gui.js       - dat.GUI interface controls
└── exporter.js  - Data export functionality

data/
├── nodes.yaml       - Node definitions
├── connections.yaml - Connection definitions
└── groups.yaml      - Group/boundary definitions
```

## 🚀 Phase 2: User Interaction Layer - COMPLETE ✅

### New Features Added:
- ✅ **Transform Controls**: Move, rotate, and scale nodes with 3D gizmo controls
- ✅ **Grid Snapping**: Automatic snapping to grid for precise positioning
- ✅ **Add/Delete Nodes**: Create new nodes, connections, and groups from GUI
- ✅ **Drag-to-Connect**: Shift+Click to start connection, click target to complete
- ✅ **Real-time Updates**: All changes immediately update the data model
- ✅ **Advanced Keyboard Shortcuts**: G/R/S for transform modes, Tab for snapping

### 🎮 Enhanced Controls:

**Transform Modes:**
- **G**: Switch to translate/move mode
- **R**: Switch to rotate mode  
- **S**: Switch to scale mode
- **X/Y/Z**: Toggle individual axis constraints

**Connection Creation:**
- **Shift+Click** node: Start connection mode (cyan outline)
- **Click** target node: Complete connection with Bezier curve
- **Click** empty space: Cancel connection mode

**Object Creation:**
- Use **Editor Controls** panel to add new nodes, connections, groups
- **Delete/Backspace**: Remove selected objects
- **Tab**: Toggle grid snapping on/off

## 🔄 Next Steps (Phase 3)

- [ ] Bi-directional YAML/JSON editing
- [ ] Live file watching and auto-reload
- [ ] Advanced group editing with resize handles
- [ ] Connection label editing
- [ ] Undo/redo system
