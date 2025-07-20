import { GUI } from 'dat.gui';

export function initGUI(sceneData, data, editor) {
  const gui = new GUI();
  
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
  object.geometry.dispose();
  object.geometry = new THREE.BoxGeometry(...size);
}
