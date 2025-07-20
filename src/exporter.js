import yaml from 'js-yaml';

export function initExporter(data) {
  // Add export buttons to the page
  const exportContainer = document.createElement('div');
  exportContainer.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
  `;
  
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
  
  exportYamlBtn.addEventListener('click', () => exportToYaml(data));
  exportJsonBtn.addEventListener('click', () => exportToJson(data));
  
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
  
  exportContainer.appendChild(exportYamlBtn);
  exportContainer.appendChild(exportJsonBtn);
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
