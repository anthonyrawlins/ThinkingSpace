import { GUI } from 'dat.gui';

export function initGUI(sceneData, data, editor) {
  const gui = new GUI();
  
  // Editor controls folder
  const editorFolder = gui.addFolder('Editor Controls');
  const editorSettings = {
    transformMode: 'translate',
    gridSnapping: true,
    gridSize: 1.0,
    addNode: () => addNewNode(sceneData, data),
    addConnection: () => addNewConnection(data),
    addGroup: () => addNewGroup(sceneData, data)
  };
  
  editorFolder.add(editorSettings, 'transformMode', ['translate', 'rotate', 'scale']).onChange((mode) => {
    if (editor.transformControls.object) {
      editor.transformControls.setMode(mode);
    }
  });
  
  editorFolder.add(editorSettings, 'gridSnapping').onChange((value) => {
    editor.snapSettings.enabled = value;
  });
  
  editorFolder.add(editorSettings, 'gridSize', 0.1, 5.0).onChange((value) => {
    editor.snapSettings.size = value;
  });
  
  editorFolder.add(editorSettings, 'addNode').name('Add New Node');
  editorFolder.add(editorSettings, 'addConnection').name('Add Connection');
  editorFolder.add(editorSettings, 'addGroup').name('Add Group');
  
  editorFolder.open();
  
  // Scene controls
  const sceneFolder = gui.addFolder('Scene');
  const sceneSettings = {
    fogDensity: 0.01,
    backgroundColor: '#1a1a1a',
    showGroups: true,
    showConnections: true
  };
  
  sceneFolder.add(sceneSettings, 'showGroups').onChange((value) => {
    sceneData.groupBoxGroup.visible = value;
  });
  
  sceneFolder.add(sceneSettings, 'showConnections').onChange((value) => {
    sceneData.connectionGroup.visible = value;
  });
  
  sceneSettings.showGrid = true;
  sceneFolder.add(sceneSettings, 'showGrid').onChange((value) => {
    const grid = sceneData.scene.getObjectByName('grid-helper');
    if (grid) grid.visible = value;
  });
  
  sceneFolder.addColor(sceneSettings, 'backgroundColor').onChange((value) => {
    sceneData.renderer.setClearColor(value);
  });
  
  sceneFolder.open();
  
  // Object properties folder (will be populated when object is selected)
  const objectFolder = gui.addFolder('Selected Object');
  let objectControls = {};
  
  // Listen for object selection events
  window.addEventListener('objectSelected', (event) => {
    updateObjectGUI(event.detail, objectFolder, objectControls, data, sceneData);
  });
  
  window.addEventListener('objectDeselected', () => {
    clearObjectGUI(objectFolder, objectControls);
  });
  
  // Stats
  const statsFolder = gui.addFolder('Statistics');
  const stats = {
    nodes: data.nodes.length,
    connections: data.connections.length,
    groups: data.groups.length
  };
  
  const nodesStat = statsFolder.add(stats, 'nodes').listen();
  const connectionsStat = statsFolder.add(stats, 'connections').listen();
  const groupsStat = statsFolder.add(stats, 'groups').listen();
  
  // Update stats periodically
  setInterval(() => {
    stats.nodes = data.nodes.length;
    stats.connections = data.connections.length;
    stats.groups = data.groups.length;
  }, 1000);
  
  statsFolder.open();
  
  return gui;
}

function updateObjectGUI(selection, folder, controls, data, sceneData) {
  clearObjectGUI(folder, controls);
  
  const { object, type, data: objectData } = selection;
  
  if (type === 'node') {
    controls.label = folder.add(objectData, 'label').onChange((value) => {
      updateNodeLabel(object, value);
    });
    
    controls.color = folder.addColor(objectData, 'color').onChange((value) => {
      object.material.color.setHex(value.replace('#', '0x'));
    });
    
    const position = {
      x: objectData.position[0],
      y: objectData.position[1],
      z: objectData.position[2]
    };
    
    controls.positionX = folder.add(position, 'x', -20, 20).onChange((value) => {
      objectData.position[0] = value;
      object.position.x = value;
    });
    
    controls.positionY = folder.add(position, 'y', -20, 20).onChange((value) => {
      objectData.position[1] = value;
      object.position.y = value;
    });
    
    controls.positionZ = folder.add(position, 'z', -20, 20).onChange((value) => {
      objectData.position[2] = value;
      object.position.z = value;
    });
    
    const size = {
      width: objectData.size[0],
      height: objectData.size[1],
      depth: objectData.size[2]
    };
    
    controls.sizeWidth = folder.add(size, 'width', 0.5, 5).onChange((value) => {
      objectData.size[0] = value;
      updateNodeGeometry(object, objectData.size);
    });
    
    controls.sizeHeight = folder.add(size, 'height', 0.5, 5).onChange((value) => {
      objectData.size[1] = value;
      updateNodeGeometry(object, objectData.size);
    });
    
    controls.sizeDepth = folder.add(size, 'depth', 0.5, 5).onChange((value) => {
      objectData.size[2] = value;
      updateNodeGeometry(object, objectData.size);
    });
  }
  
  folder.open();
}

function clearObjectGUI(folder, controls) {
  Object.keys(controls).forEach(key => {
    folder.remove(controls[key]);
    delete controls[key];
  });
}

function updateNodeLabel(object, newLabel) {
  // Find and update the label sprite
  object.parent.children.forEach(child => {
    if (child.isSprite && child.position.y === object.position.y + 1) {
      // Update the sprite texture with new label
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = 256;
      canvas.height = 64;
      context.font = '48px Arial';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.fillText(newLabel, canvas.width / 2, canvas.height / 2 + 16);
      
      child.material.map.dispose();
      child.material.map = new THREE.CanvasTexture(canvas);
      child.material.needsUpdate = true;
    }
  });
}

function updateNodeGeometry(object, size) {
  // Dispose old geometry
  object.geometry.dispose();
  
  // Create new geometry
  const newGeometry = new THREE.BoxGeometry(...size);
  object.geometry = newGeometry;
  
  // Update the wireframe edges
  const wireframe = object.getObjectByName('node-edges');
  if (wireframe) {
    wireframe.geometry.dispose();
    wireframe.geometry = new THREE.EdgesGeometry(newGeometry);
  }
}

// Add new node function
function addNewNode(sceneData, data) {
  const nodeId = `node-${Date.now()}`;
  const newNode = {
    id: nodeId,
    label: 'New Node',
    position: [0, 0, 0],
    size: [2, 1, 1],
    color: '#3498db',
    group: 'default'
  };
  
  // Add to data model
  data.nodes.push(newNode);
  
  // Create 3D object with transparent fill and opaque edges
  const geometry = new THREE.BoxGeometry(...newNode.size);
  
  // Create transparent fill material
  const fillMaterial = new THREE.MeshLambertMaterial({
    color: newNode.color,
    transparent: true,
    opacity: 0.05 // 95% transparent
  });
  
  // Create the main mesh with transparent fill
  const mesh = new THREE.Mesh(geometry, fillMaterial);
  mesh.position.set(...newNode.position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { type: 'node', data: newNode };
  
  // Create edges/wireframe with 100% opacity
  const edges = new THREE.EdgesGeometry(geometry);
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: newNode.color,
    linewidth: 2,
    transparent: false
  });
  const wireframe = new THREE.LineSegments(edges, edgeMaterial);
  wireframe.name = 'node-edges';
  
  // Add both fill and edges to mesh
  mesh.add(wireframe);
  sceneData.nodeGroup.add(mesh);
  
  // Add label
  addLabel(newNode.label, mesh.position, sceneData.nodeGroup);
  
  console.log('Added new node:', nodeId);
}

// Add new connection function
function addNewConnection(data) {
  if (data.nodes.length < 2) {
    alert('Need at least 2 nodes to create a connection');
    return;
  }
  
  const connectionId = `connection-${Date.now()}`;
  const newConnection = {
    id: connectionId,
    from: data.nodes[0].id,
    to: data.nodes[1].id,
    label: 'New Connection',
    color: '#2ecc71'
  };
  
  data.connections.push(newConnection);
  console.log('Added new connection:', connectionId);
  
  // Note: Would need to re-render connections or add incremental rendering
  alert('Connection added to data. Refresh scene to see visualization.');
}

// Add new group function
function addNewGroup(sceneData, data) {
  const groupId = `group-${Date.now()}`;
  const newGroup = {
    id: groupId,
    label: 'New Group',
    bounds: {
      min: [-2, -2, -2],
      max: [2, 2, 2]
    },
    color: '#f39c12',
    wireframe: true
  };
  
  // Add to data model
  data.groups.push(newGroup);
  
  // Create 3D wireframe box
  const { min, max } = newGroup.bounds;
  const width = max[0] - min[0];
  const height = max[1] - min[1];
  const depth = max[2] - min[2];
  
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshBasicMaterial({
    color: newGroup.color,
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });
  
  const box = new THREE.Mesh(geometry, material);
  box.position.set(
    min[0] + width / 2,
    min[1] + height / 2,
    min[2] + depth / 2
  );
  
  box.userData = { type: 'group', data: newGroup };
  sceneData.groupBoxGroup.add(box);
  
  // Add label
  addLabel(newGroup.label, box.position, sceneData.groupBoxGroup, 0.8);
  
  console.log('Added new group:', groupId);
}

// Helper function to add label (duplicated from scene.js for convenience)
function addLabel(text, position, parent, scale = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  context.font = '48px Arial';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 16);
  
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  
  sprite.position.copy(position);
  sprite.position.y += 1;
  sprite.scale.multiplyScalar(scale);
  
  parent.add(sprite);
}
