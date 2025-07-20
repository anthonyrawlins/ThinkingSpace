import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

export function enableEditor(sceneData, data) {
  const { scene, camera, renderer, controls } = sceneData;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let selectedObject = null;
  
  // Transform controls setup
  const transformControls = new TransformControls(camera, renderer.domElement);
  transformControls.addEventListener('change', () => {
    if (selectedObject && transformControls.object) {
      updateObjectData(selectedObject, transformControls.object);
    }
  });
  
  transformControls.addEventListener('dragging-changed', (event) => {
    controls.enabled = !event.value;
  });
  
  scene.add(transformControls);
  
  // Grid snapping settings
  const snapSettings = {
    enabled: true,
    size: 1.0
  };
  
  // Connection mode state
  const connectionMode = {
    active: false,
    startNode: null,
    tempLine: null
  };
  
  // Mouse event handlers
  function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      const intersectedObject = intersects[0].object;
      
      // Find the parent object with userData
      let targetObject = intersectedObject;
      while (targetObject.parent && !targetObject.userData.type) {
        targetObject = targetObject.parent;
      }
      
      if (targetObject.userData.type === 'node') {
        handleNodeClick(targetObject, event);
      } else if (targetObject.userData.type === 'connection') {
        if (!connectionMode.active) {
          selectObject(targetObject);
        }
      } else {
        if (!connectionMode.active) {
          selectObject(targetObject);
        }
      }
    } else {
      if (connectionMode.active) {
        cancelConnectionMode();
      } else {
        deselectObject();
      }
    }
  }
  
  function handleNodeClick(nodeObject, event) {
    if (connectionMode.active) {
      // Complete connection
      if (connectionMode.startNode && connectionMode.startNode !== nodeObject) {
        createConnection(connectionMode.startNode, nodeObject);
        cancelConnectionMode();
      } else {
        cancelConnectionMode();
      }
    } else if (event.shiftKey) {
      // Start connection mode
      startConnectionMode(nodeObject);
    } else {
      // Normal selection
      selectObject(nodeObject);
    }
  }
  
  function selectObject(object) {
    deselectObject(); // Clear previous selection
    
    selectedObject = object;
    
    // Add selection outline
    if (object.userData.type === 'node') {
      const edges = new THREE.EdgesGeometry(object.geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 3 });
      const outline = new THREE.LineSegments(edges, lineMaterial);
      outline.name = 'selection-outline';
      object.add(outline);
      
      // Attach transform controls
      transformControls.attach(object);
      transformControls.setMode('translate');
    } else if (object.userData.type === 'connection') {
      // Change connection color to indicate selection
      object.material.color.setHex(0x00ff00);
      object.material.needsUpdate = true;
    }
    
    console.log('Selected:', object.userData.type, object.userData.data);
    
    // Dispatch custom event for GUI updates
    window.dispatchEvent(new CustomEvent('objectSelected', {
      detail: { object, type: object.userData.type, data: object.userData.data }
    }));
  }
  
  function deselectObject() {
    if (selectedObject) {
      if (selectedObject.userData.type === 'node') {
        // Remove selection outline
        const outline = selectedObject.getObjectByName('selection-outline');
        if (outline) {
          selectedObject.remove(outline);
        }
        
        // Detach transform controls
        transformControls.detach();
      } else if (selectedObject.userData.type === 'connection') {
        // Restore original connection color
        selectedObject.material.color.setHex(selectedObject.userData.data.color.replace('#', '0x'));
        selectedObject.material.needsUpdate = true;
      }
      
      selectedObject = null;
      
      // Dispatch deselection event
      window.dispatchEvent(new CustomEvent('objectDeselected'));
    }
  }
  
  // Add event listeners
  renderer.domElement.addEventListener('click', onMouseClick);
  
  // Keyboard shortcuts
  function onKeyDown(event) {
    switch (event.key) {
      case 'Delete':
      case 'Backspace':
        if (selectedObject) {
          deleteObject(selectedObject);
        }
        break;
      case 'Escape':
        deselectObject();
        break;
      case 'g':
      case 'G':
        if (selectedObject && transformControls.object) {
          transformControls.setMode('translate');
        }
        break;
      case 'r':
      case 'R':
        if (selectedObject && transformControls.object) {
          transformControls.setMode('rotate');
        }
        break;
      case 's':
      case 'S':
        if (selectedObject && transformControls.object) {
          transformControls.setMode('scale');
        }
        break;
      case 'x':
      case 'X':
        if (selectedObject && transformControls.object) {
          transformControls.showX = !transformControls.showX;
        }
        break;
      case 'y':
      case 'Y':
        if (selectedObject && transformControls.object) {
          transformControls.showY = !transformControls.showY;
        }
        break;
      case 'z':
      case 'Z':
        if (selectedObject && transformControls.object) {
          transformControls.showZ = !transformControls.showZ;
        }
        break;
      case 'Tab':
        event.preventDefault();
        snapSettings.enabled = !snapSettings.enabled;
        console.log('Grid snapping:', snapSettings.enabled ? 'enabled' : 'disabled');
        break;
    }
  }
  
  function deleteObject(object) {
    if (confirm(`Delete ${object.userData.type}: ${object.userData.data.label || object.userData.data.id}?`)) {
      // Remove from scene
      object.parent.remove(object);
      
      // Remove from data
      const { type, data: objectData } = object.userData;
      if (type === 'node') {
        const index = data.nodes.findIndex(node => node.id === objectData.id);
        if (index !== -1) data.nodes.splice(index, 1);
        
        // Also remove connections that reference this node
        data.connections = data.connections.filter(conn => 
          conn.from !== objectData.id && conn.to !== objectData.id
        );
        
        // Remove visual connections from scene
        sceneData.connectionGroup.children.forEach((child, i) => {
          if (child.userData.type === 'connection') {
            const connData = child.userData.data;
            if (connData.from === objectData.id || connData.to === objectData.id) {
              sceneData.connectionGroup.remove(child);
            }
          }
        });
        
      } else if (type === 'connection') {
        const index = data.connections.findIndex(conn => conn.id === objectData.id);
        if (index !== -1) data.connections.splice(index, 1);
        
      } else if (type === 'group') {
        const index = data.groups.findIndex(group => group.id === objectData.id);
        if (index !== -1) data.groups.splice(index, 1);
      }
      
      deselectObject();
      console.log('Deleted:', type, objectData.id);
    }
  }
  
  document.addEventListener('keydown', onKeyDown);
  
  // Grid snapping function
  function snapToGrid(value, gridSize) {
    if (!snapSettings.enabled) return value;
    return Math.round(value / gridSize) * gridSize;
  }
  
  // Update object data when transform controls change
  function updateObjectData(selectedObj, transformedObj) {
    if (selectedObj.userData.type === 'node') {
      const nodeData = selectedObj.userData.data;
      
      // Apply grid snapping to position
      const newPosition = [
        snapToGrid(transformedObj.position.x, snapSettings.size),
        snapToGrid(transformedObj.position.y, snapSettings.size),
        snapToGrid(transformedObj.position.z, snapSettings.size)
      ];
      
      // Update data model
      nodeData.position = newPosition;
      
      // Apply snapped position back to object
      transformedObj.position.set(...newPosition);
      
      // Update scale if changed
      if (transformControls.getMode() === 'scale') {
        nodeData.size = [
          nodeData.size[0] * transformedObj.scale.x,
          nodeData.size[1] * transformedObj.scale.y,
          nodeData.size[2] * transformedObj.scale.z
        ];
        
        // Reset scale and update geometry
        transformedObj.scale.set(1, 1, 1);
        updateNodeGeometry(transformedObj, nodeData.size);
      }
      
      console.log('Updated node position:', newPosition);
    }
  }
  
  // Update node geometry (from gui.js functionality)
  function updateNodeGeometry(object, size) {
    object.geometry.dispose();
    object.geometry = new THREE.BoxGeometry(...size);
  }
  
  // Connection mode functions
  function startConnectionMode(startNode) {
    connectionMode.active = true;
    connectionMode.startNode = startNode;
    
    // Visual feedback for start node
    if (startNode.userData.type === 'node') {
      const edges = new THREE.EdgesGeometry(startNode.geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 3 });
      const outline = new THREE.LineSegments(edges, lineMaterial);
      outline.name = 'connection-start-outline';
      startNode.add(outline);
    }
    
    console.log('Connection mode started from:', startNode.userData.data.label);
    
    // Add mouse move listener for preview line
    renderer.domElement.addEventListener('mousemove', onConnectionMouseMove);
  }
  
  function cancelConnectionMode() {
    if (connectionMode.startNode) {
      // Remove visual feedback
      const outline = connectionMode.startNode.getObjectByName('connection-start-outline');
      if (outline) {
        connectionMode.startNode.remove(outline);
      }
    }
    
    // Remove temp line
    if (connectionMode.tempLine) {
      scene.remove(connectionMode.tempLine);
      connectionMode.tempLine = null;
    }
    
    connectionMode.active = false;
    connectionMode.startNode = null;
    
    renderer.domElement.removeEventListener('mousemove', onConnectionMouseMove);
    console.log('Connection mode cancelled');
  }
  
  function onConnectionMouseMove(event) {
    if (!connectionMode.active || !connectionMode.startNode) return;
    
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Get mouse position in 3D space
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const mousePos = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, mousePos);
    
    // Remove previous temp line
    if (connectionMode.tempLine) {
      scene.remove(connectionMode.tempLine);
    }
    
    // Create temp preview line
    const start = connectionMode.startNode.position.clone();
    const end = mousePos;
    
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    midPoint.y += Math.abs(end.x - start.x) * 0.3;
    
    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
    const points = curve.getPoints(20);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      linewidth: 2,
      transparent: true,
      opacity: 0.6
    });
    
    connectionMode.tempLine = new THREE.Line(geometry, material);
    scene.add(connectionMode.tempLine);
  }
  
  function createConnection(startNode, endNode) {
    const connectionId = `connection-${Date.now()}`;
    const newConnection = {
      id: connectionId,
      from: startNode.userData.data.id,
      to: endNode.userData.data.id,
      label: `${startNode.userData.data.label} → ${endNode.userData.data.label}`,
      color: '#2ecc71'
    };
    
    // Add to data model
    data.connections.push(newConnection);
    
    // Create visual connection
    const start = new THREE.Vector3(...startNode.userData.data.position);
    const end = new THREE.Vector3(...endNode.userData.data.position);
    
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    midPoint.y += Math.abs(end.x - start.x) * 0.3;
    
    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
    const points = curve.getPoints(20);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({
      color: newConnection.color,
      linewidth: 2
    });
    
    const line = new THREE.Line(geometry, material);
    line.userData = { type: 'connection', data: newConnection };
    sceneData.connectionGroup.add(line);
    
    // Add connection label with matching color
    if (newConnection.label) {
      addConnectionLabel(newConnection.label, midPoint, sceneData.connectionGroup, newConnection.color, 0.6);
    }
    
    console.log('Created connection:', newConnection.label);
  }
  
  // Helper function for connection labels (duplicated from scene.js)
  function addConnectionLabel(text, position, parent, color, scale = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    
    // Use connection color for text
    context.font = 'bold 36px Arial';
    context.fillStyle = color;
    context.textAlign = 'center';
    context.strokeStyle = 'rgba(0,0,0,0.8)';
    context.lineWidth = 3;
    
    // Add text outline for better visibility
    context.strokeText(text, canvas.width / 2, canvas.height / 2 + 12);
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 12);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true
    });
    const sprite = new THREE.Sprite(material);
    
    // Position closer to the curve (reduce Y offset)
    sprite.position.copy(position);
    sprite.position.y += 0.3; // Much closer to the curve
    sprite.scale.multiplyScalar(scale * 0.8); // Slightly smaller
    
    parent.add(sprite);
  }
  
  return {
    getSelectedObject: () => selectedObject,
    selectObject,
    deselectObject,
    deleteObject,
    transformControls,
    snapSettings,
    connectionMode
  };
}
