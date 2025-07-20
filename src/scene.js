import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function initScene(data) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x1a1a1a);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  
  document.body.appendChild(renderer.domElement);
  
  // Setup camera controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  
  // Position camera
  camera.position.set(15, 10, 15);
  controls.target.set(5, 0, 0);
  
  // Add lighting
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);
  
  // Add fog for depth perception
  scene.fog = new THREE.Fog(0x1a1a1a, 50, 200);
  
  // Add visual grid
  const gridHelper = new THREE.GridHelper(40, 40, 0x444444, 0x222222);
  gridHelper.name = 'grid-helper';
  scene.add(gridHelper);
  
  // Create object containers
  const nodeGroup = new THREE.Group();
  const connectionGroup = new THREE.Group();
  const groupBoxGroup = new THREE.Group();
  
  scene.add(nodeGroup);
  scene.add(connectionGroup);
  scene.add(groupBoxGroup);
  
  // Render groups first (wireframes)
  renderGroups(data.groups, groupBoxGroup);
  
  // Render nodes
  renderNodes(data.nodes, nodeGroup);
  
  // Render connections
  renderConnections(data.connections, data.nodes, connectionGroup);
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
  
  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  return {
    scene,
    camera,
    renderer,
    controls,
    nodeGroup,
    connectionGroup,
    groupBoxGroup
  };
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
    const material = new THREE.MeshLambertMaterial({
      color: node.color
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...node.position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    
    mesh.userData = { type: 'node', data: node };
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
    
    // Add connection label at midpoint
    if (connection.label) {
      addLabel(connection.label, midPoint, connectionGroup, 0.6);
    }
  });
}

function addLabel(text, position, parent, scale = 1) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = '48px Arial';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  
  sprite.position.copy(position);
  sprite.position.y += 1;
  sprite.scale.multiplyScalar(scale);
  
  parent.add(sprite);
}
