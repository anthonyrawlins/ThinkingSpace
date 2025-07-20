import * as THREE from 'three';

export function enableEditor(sceneData, data) {
  const { scene, camera, renderer } = sceneData;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let selectedObject = null;
  
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
      
      if (targetObject.userData.type) {
        selectObject(targetObject);
      }
    } else {
      deselectObject();
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
    }
    
    console.log('Selected:', object.userData.type, object.userData.data);
    
    // Dispatch custom event for GUI updates
    window.dispatchEvent(new CustomEvent('objectSelected', {
      detail: { object, type: object.userData.type, data: object.userData.data }
    }));
  }
  
  function deselectObject() {
    if (selectedObject) {
      // Remove selection outline
      const outline = selectedObject.getObjectByName('selection-outline');
      if (outline) {
        selectedObject.remove(outline);
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
      } else if (type === 'group') {
        const index = data.groups.findIndex(group => group.id === objectData.id);
        if (index !== -1) data.groups.splice(index, 1);
      }
      
      deselectObject();
      console.log('Deleted:', type, objectData.id);
    }
  }
  
  document.addEventListener('keydown', onKeyDown);
  
  return {
    getSelectedObject: () => selectedObject,
    selectObject,
    deselectObject,
    deleteObject
  };
}
