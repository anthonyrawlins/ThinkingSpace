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

## 🔄 Next Steps (Phase 2)

- [ ] Transform controls for moving objects
- [ ] Grid snapping system
- [ ] Add/delete nodes from UI
- [ ] Drag-to-connect interface
- [ ] Real-time data model updates
