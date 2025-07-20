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
  
  exportContainer.appendChild(exportYamlBtn);
  exportContainer.appendChild(exportJsonBtn);
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
