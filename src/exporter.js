import yaml from 'js-yaml';

export function initExporter(data) {
  // Auto-save settings
  const autoSaveSettings = {
    enabled: false,
    interval: 30000, // 30 seconds
    intervalId: null
  };
  
  // Add export buttons to the page
  const exportContainer = document.createElement('div');
  exportContainer.style.cssText = `
    position: fixed;
    top: 10px;
    right: 280px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `;
  
  // File input for import
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.yaml,.yml,.json';
  fileInput.style.display = 'none';
  fileInput.addEventListener('change', (e) => handleFileImport(e, data));
  
  const importBtn = document.createElement('button');
  importBtn.textContent = 'Import File';
  importBtn.style.cssText = `
    padding: 10px 15px;
    background: #2ecc71;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `;
  importBtn.addEventListener('click', () => fileInput.click());
  
  const exportYamlBtn = document.createElement('button');
  exportYamlBtn.textContent = 'Export YAML';
  exportYamlBtn.style.cssText = `
    padding: 10px 15px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `;
  
  const exportJsonBtn = document.createElement('button');
  exportJsonBtn.textContent = 'Export JSON';
  exportJsonBtn.style.cssText = `
    padding: 10px 15px;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `;
  
  const autoSaveBtn = document.createElement('button');
  autoSaveBtn.textContent = 'Auto-Save: OFF';
  autoSaveBtn.style.cssText = `
    padding: 10px 15px;
    background: #95a5a6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `;
  
  importBtn.addEventListener('click', () => fileInput.click());
  exportYamlBtn.addEventListener('click', () => exportToYaml(data));
  exportJsonBtn.addEventListener('click', () => exportToJson(data));
  autoSaveBtn.addEventListener('click', () => toggleAutoSave(autoSaveSettings, autoSaveBtn, data));
  
  // Help button
  const helpBtn = document.createElement('button');
  helpBtn.textContent = 'Help';
  helpBtn.style.cssText = `
    padding: 10px 15px;
    background: #9b59b6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  `;
  
  helpBtn.addEventListener('click', showHelp);
  
  document.body.appendChild(fileInput);
  exportContainer.appendChild(importBtn);
  exportContainer.appendChild(exportYamlBtn);
  exportContainer.appendChild(exportJsonBtn);
  exportContainer.appendChild(autoSaveBtn);
  exportContainer.appendChild(helpBtn);
  document.body.appendChild(exportContainer);
  
  // Keyboard shortcut for export
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      exportToYaml(data);
    }
  });
}

function exportToYaml(data) {
  try {
    const yamlContent = `# 3D System Mapper Export\n# Generated on ${new Date().toISOString()}\n\n` +
      `# Nodes\nnodes:\n${yaml.dump(data.nodes, { indent: 2 }).replace(/^/gm, '  ')}\n` +
      `# Connections\nconnections:\n${yaml.dump(data.connections, { indent: 2 }).replace(/^/gm, '  ')}\n` +
      `# Groups\ngroups:\n${yaml.dump(data.groups, { indent: 2 }).replace(/^/gm, '  ')}`;
    
    downloadFile('system-architecture.yaml', yamlContent, 'text/yaml');
    console.log('Exported to YAML successfully');
  } catch (error) {
    console.error('Error exporting to YAML:', error);
    alert('Error exporting to YAML. Check console for details.');
  }
}

function exportToJson(data) {
  try {
    const jsonContent = JSON.stringify({
      metadata: {
        exported: new Date().toISOString(),
        version: '1.0.0',
        tool: '3D System Mapper'
      },
      ...data
    }, null, 2);
    
    downloadFile('system-architecture.json', jsonContent, 'application/json');
    console.log('Exported to JSON successfully');
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    alert('Error exporting to JSON. Check console for details.');
  }
}

function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}

function showHelp() {
  const helpContent = `
<h2>🎮 ThinkingSpace Controls</h2>

<h3>🖱️ Mouse Controls:</h3>
<ul>
  <li><strong>Left Click:</strong> Select objects</li>
  <li><strong>Shift+Click Node:</strong> Start connection mode</li>
  <li><strong>Mouse Drag:</strong> Rotate camera view</li>
  <li><strong>Mouse Wheel:</strong> Zoom in/out</li>
</ul>

<h3>⌨️ Keyboard Shortcuts:</h3>
<ul>
  <li><strong>G:</strong> Switch to translate/move mode</li>
  <li><strong>R:</strong> Switch to rotate mode</li>
  <li><strong>S:</strong> Switch to scale mode</li>
  <li><strong>X/Y/Z:</strong> Toggle axis constraints</li>
  <li><strong>Tab:</strong> Toggle grid snapping</li>
  <li><strong>Delete/Backspace:</strong> Delete selected object</li>
  <li><strong>Escape:</strong> Deselect/Cancel</li>
  <li><strong>Ctrl+S:</strong> Export to YAML</li>
</ul>

<h3>🔗 Creating Connections:</h3>
<ol>
  <li>Hold <strong>Shift</strong> and click a node (cyan outline appears)</li>
  <li>Click the target node to complete connection</li>
  <li>Click empty space to cancel</li>
</ol>

<h3>📦 Adding Objects:</h3>
<p>Use the <strong>Editor Controls</strong> panel to add new nodes, connections, and groups.</p>

<h3>🎯 Transform Controls:</h3>
<p>Select a node to see 3D gizmo controls. Drag the colored arrows/planes to move, rotate, or scale objects.</p>
  `;
  
  // Create modal overlay
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background: #2c3e50;
    color: white;
    padding: 30px;
    border-radius: 10px;
    max-width: 600px;
    max-height: 80%;
    overflow-y: auto;
    font-family: Arial, sans-serif;
  `;
  
  content.innerHTML = helpContent + `
    <button id="closeHelp" style="
      background: #e74c3c;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 20px;
      font-size: 16px;
    ">Close</button>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  // Close handlers
  const closeBtn = content.querySelector('#closeHelp');
  closeBtn.addEventListener('click', () => document.body.removeChild(modal));
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  });
  
  document.addEventListener('keydown', function escapeHandler(e) {
    if (e.key === 'Escape') {
      document.body.removeChild(modal);
      document.removeEventListener('keydown', escapeHandler);
    }
  });
}

// File import functionality
function handleFileImport(event, data) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      let importedData;
      const content = e.target.result;
      
      if (file.name.endsWith('.json')) {
        importedData = JSON.parse(content);
      } else if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) {
        importedData = yaml.load(content);
      } else {
        alert('Unsupported file type. Please use .yaml, .yml, or .json files.');
        return;
      }
      
      // Validate and merge data
      if (importedData.nodes) {
        data.nodes.length = 0;
        data.nodes.push(...importedData.nodes);
      }
      if (importedData.connections) {
        data.connections.length = 0;
        data.connections.push(...importedData.connections);
      }
      if (importedData.groups) {
        data.groups.length = 0;
        data.groups.push(...importedData.groups);
      }
      
      console.log('Imported data:', importedData);
      alert(`Successfully imported ${file.name}. Refresh page to see changes in 3D scene.`);
      
    } catch (error) {
      console.error('Error importing file:', error);
      alert('Error importing file. Please check the file format and try again.');
    }
  };
  
  reader.readAsText(file);
  event.target.value = ''; // Reset file input
}

// Auto-save functionality
function toggleAutoSave(settings, button, data) {
  settings.enabled = !settings.enabled;
  
  if (settings.enabled) {
    button.textContent = 'Auto-Save: ON';
    button.style.background = '#27ae60';
    
    settings.intervalId = setInterval(() => {
      autoSaveToLocalStorage(data);
    }, settings.interval);
    
    console.log(`Auto-save enabled (${settings.interval/1000}s intervals)`);
  } else {
    button.textContent = 'Auto-Save: OFF';
    button.style.background = '#95a5a6';
    
    if (settings.intervalId) {
      clearInterval(settings.intervalId);
      settings.intervalId = null;
    }
    
    console.log('Auto-save disabled');
  }
}

// Save to local storage
function autoSaveToLocalStorage(data) {
  try {
    const saveData = {
      timestamp: new Date().toISOString(),
      ...data
    };
    localStorage.setItem('thinkingspace-autosave', JSON.stringify(saveData));
    console.log('Auto-saved to local storage at', saveData.timestamp);
  } catch (error) {
    console.error('Auto-save failed:', error);
  }
}

// Load from local storage on startup
export function loadAutoSave() {
  try {
    const saved = localStorage.getItem('thinkingspace-autosave');
    if (saved) {
      const data = JSON.parse(saved);
      console.log('Found auto-save data from:', data.timestamp);
      return {
        nodes: data.nodes || [],
        connections: data.connections || [],
        groups: data.groups || []
      };
    }
  } catch (error) {
    console.error('Failed to load auto-save:', error);
  }
  return null;
}
