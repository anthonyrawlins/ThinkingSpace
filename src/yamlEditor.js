import yaml from 'js-yaml';

let currentData = null;
let sceneData = null;
let onDataUpdateCallback = null;

export function initYamlEditor(data, scene, onDataUpdate) {
  currentData = data;
  sceneData = scene;
  onDataUpdateCallback = onDataUpdate;
  
  const yamlEditor = document.getElementById('yaml-editor');
  const yamlStatus = document.getElementById('yaml-status');
  const applyBtn = document.getElementById('apply-yaml');
  const refreshBtn = document.getElementById('refresh-yaml');
  const resetBtn = document.getElementById('reset-yaml');
  const toggleBtn = document.getElementById('toggle-editor');
  const editorContainer = document.getElementById('yaml-editor-container');
  
  // Initialize with current data
  refreshYamlFromData();
  
  // Button event listeners
  applyBtn.addEventListener('click', applyYamlChanges);
  refreshBtn.addEventListener('click', refreshYamlFromData);
  resetBtn.addEventListener('click', resetToDefault);
  toggleBtn.addEventListener('click', toggleEditor);
  
  // Auto-refresh YAML when scene data changes
  window.addEventListener('objectSelected', refreshYamlFromData);
  window.addEventListener('objectDeselected', refreshYamlFromData);
  
  // Real-time syntax validation
  yamlEditor.addEventListener('input', validateYaml);
  
  function refreshYamlFromData() {
    try {
      const yamlContent = generateYamlFromData(currentData);
      yamlEditor.value = yamlContent;
      updateStatus('Synced with scene', 'success');
    } catch (error) {
      updateStatus('Error generating YAML', 'error');
      console.error('YAML generation error:', error);
    }
  }
  
  function applyYamlChanges() {
    try {
      const yamlContent = yamlEditor.value;
      const parsedData = parseYamlContent(yamlContent);
      
      // Validate the structure
      if (!parsedData.nodes || !parsedData.connections || !parsedData.groups) {
        throw new Error('YAML must contain nodes, connections, and groups sections');
      }
      
      // Update the data
      currentData.nodes.length = 0;
      currentData.connections.length = 0;
      currentData.groups.length = 0;
      
      currentData.nodes.push(...parsedData.nodes);
      currentData.connections.push(...parsedData.connections);
      currentData.groups.push(...parsedData.groups);
      
      // Trigger scene update
      if (onDataUpdateCallback) {
        onDataUpdateCallback();
      }
      
      updateStatus('Changes applied successfully', 'success');
      
    } catch (error) {
      updateStatus(`Error: ${error.message}`, 'error');
      console.error('YAML apply error:', error);
    }
  }
  
  function validateYaml() {
    try {
      const yamlContent = yamlEditor.value.trim();
      if (!yamlContent) {
        updateStatus('Empty content', 'warning');
        return;
      }
      
      parseYamlContent(yamlContent);
      updateStatus('Valid YAML', 'success');
    } catch (error) {
      updateStatus(`Syntax error: ${error.message}`, 'error');
    }
  }
  
  function resetToDefault() {
    if (confirm('Reset to default YAML data? This will lose all current changes.')) {
      fetch('/data/nodes.yaml')
        .then(r => r.text())
        .then(nodes => fetch('/data/connections.yaml').then(r => r.text()).then(connections => {
          return fetch('/data/groups.yaml').then(r => r.text()).then(groups => {
            const defaultData = {
              nodes: yaml.load(nodes).nodes || [],
              connections: yaml.load(connections).connections || [],
              groups: yaml.load(groups).groups || []
            };
            
            // Update current data
            currentData.nodes.length = 0;
            currentData.connections.length = 0;
            currentData.groups.length = 0;
            
            currentData.nodes.push(...defaultData.nodes);
            currentData.connections.push(...defaultData.connections);
            currentData.groups.push(...defaultData.groups);
            
            refreshYamlFromData();
            
            if (onDataUpdateCallback) {
              onDataUpdateCallback();
            }
            
            updateStatus('Reset to defaults', 'success');
          });
        }))
        .catch(error => {
          updateStatus('Error loading defaults', 'error');
          console.error('Reset error:', error);
        });
    }
  }
  
  function toggleEditor() {
    const isVisible = editorContainer.style.display !== 'none';
    editorContainer.style.display = isVisible ? 'none' : 'flex';
    toggleBtn.textContent = isVisible ? 'Show YAML Editor' : 'Hide YAML Editor';
  }
  
  function updateStatus(message, type) {
    yamlStatus.textContent = message;
    yamlStatus.className = type;
    
    // Clear status after 3 seconds for non-error messages
    if (type !== 'error') {
      setTimeout(() => {
        yamlStatus.textContent = 'Ready';
        yamlStatus.className = '';
      }, 3000);
    }
  }
  
  return {
    refreshYamlFromData,
    applyYamlChanges,
    updateStatus
  };
}

function generateYamlFromData(data) {
  const yamlContent = `# ThinkingSpace 3D System Architecture
# Generated: ${new Date().toISOString()}

# System Nodes
nodes:
${data.nodes.map(node => `  - id: "${node.id}"
    label: "${node.label}"
    position: [${node.position.join(', ')}]
    size: [${node.size.join(', ')}]
    color: "${node.color}"
    group: "${node.group}"`).join('\n')}

# System Connections  
connections:
${data.connections.map(conn => `  - id: "${conn.id}"
    from: "${conn.from}"
    to: "${conn.to}"
    label: "${conn.label}"
    color: "${conn.color}"`).join('\n')}

# Logical Groups
groups:
${data.groups.map(group => `  - id: "${group.id}"
    label: "${group.label}"
    bounds:
      min: [${group.bounds.min.join(', ')}]
      max: [${group.bounds.max.join(', ')}]
    color: "${group.color}"
    wireframe: ${group.wireframe}`).join('\n')}
`;
  
  return yamlContent;
}

function parseYamlContent(yamlContent) {
  const parsed = yaml.load(yamlContent);
  
  // Ensure required structure
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid YAML structure');
  }
  
  return {
    nodes: parsed.nodes || [],
    connections: parsed.connections || [],
    groups: parsed.groups || []
  };
}

// Export for use in other modules
export { generateYamlFromData, parseYamlContent };