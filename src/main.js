import { initScene } from './scene.js';
import { loadData } from './loader.js';
import { enableEditor } from './editor.js';
import { initGUI } from './gui.js';
import { initExporter } from './exporter.js';
import { initYamlEditor } from './yamlEditor.js';
import * as THREE from 'three';

let currentData = null;
let currentScene = null;
let currentEditor = null;

loadData().then(data => {
  currentData = data;
  currentScene = initScene(data);
  currentEditor = enableEditor(currentScene, data);
  initGUI(currentScene, data, currentEditor);
  initExporter(data);
  
  // Initialize YAML editor with scene refresh callback
  initYamlEditor(data, currentScene, refreshScene);
});

function refreshScene() {
  // Clear existing scene objects
  clearScene();
  
  // Re-render with updated data
  renderSceneData();
  
  console.log('Scene refreshed from YAML changes');
}

function clearScene() {
  // Clear all object groups
  currentScene.nodeGroup.clear();
  currentScene.connectionGroup.clear();
  currentScene.groupBoxGroup.clear();
}

function renderSceneData() {
  // Re-render all elements
  renderGroups(currentData.groups, currentScene.groupBoxGroup);
  renderNodes(currentData.nodes, currentScene.nodeGroup);
  renderConnections(currentData.connections, currentData.nodes, currentScene.connectionGroup);
}

function renderGroups(groups, groupBoxGroup) {
  groups.forEach(group => {
    const { min, max } = group.bounds;
    const width = max[0] - min[0];
    const height = max[1] - min[1];
    const depth = max[2] - min[2];
    
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({
      color: group.color,
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
    
    box.userData = { type: 'group', data: group };
    groupBoxGroup.add(box);
    
    // Add label
    addLabel(group.label, box.position, groupBoxGroup, 0.8);
  });
}

function renderNodes(nodes, nodeGroup) {
  nodes.forEach(node => {
    const [width, height, depth] = node.size;
    const geometry = new THREE.BoxGeometry(width, height, depth);
    
    // Create transparent fill material
    const fillMaterial = new THREE.MeshLambertMaterial({
      color: node.color,
      transparent: true,
      opacity: 0.05 // 95% transparent
    });
    
    // Create the main mesh with transparent fill
    const mesh = new THREE.Mesh(geometry, fillMaterial);
    mesh.position.set(...node.position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { type: 'node', data: node };
    
    // Create edges/wireframe with 100% opacity
    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({
      color: node.color,
      linewidth: 2,
      transparent: false // Fully opaque borders
    });
    const wireframe = new THREE.LineSegments(edges, edgeMaterial);
    wireframe.name = 'node-edges';
    
    // Add both fill and edges to mesh
    mesh.add(wireframe);
    nodeGroup.add(mesh);
    
    // Add label
    addLabel(node.label, mesh.position, nodeGroup);
  });
}

function renderConnections(connections, nodes, connectionGroup) {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  
  connections.forEach(connection => {
    const fromNode = nodeMap.get(connection.from);
    const toNode = nodeMap.get(connection.to);
    
    if (!fromNode || !toNode) return;
    
    const start = new THREE.Vector3(...fromNode.position);
    const end = new THREE.Vector3(...toNode.position);
    
    // Create Bezier curve
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    midPoint.y += Math.abs(end.x - start.x) * 0.3; // Arc height based on distance
    
    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
    const points = curve.getPoints(20);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({
      color: connection.color,
      linewidth: 2
    });
    
    const line = new THREE.Line(geometry, material);
    line.userData = { type: 'connection', data: connection };
    connectionGroup.add(line);
    
    // Add connection label at midpoint with matching color
    if (connection.label) {
      addConnectionLabel(connection.label, midPoint, connectionGroup, connection.color, 0.6);
    }
  });
}

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
