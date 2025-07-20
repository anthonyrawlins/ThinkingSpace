import yaml from 'js-yaml';
import { loadAutoSave } from './exporter.js';

export async function loadData() {
  // Check for auto-save data first
  const autoSaveData = loadAutoSave();
  if (autoSaveData && (autoSaveData.nodes.length > 0 || autoSaveData.connections.length > 0 || autoSaveData.groups.length > 0)) {
    const useAutoSave = confirm('Found auto-saved data. Load it instead of default data?');
    if (useAutoSave) {
      console.log('Loading auto-saved data');
      return autoSaveData;
    }
  }
  try {
    const [nodesResponse, connectionsResponse, groupsResponse] = await Promise.all([
      fetch('/data/nodes.yaml'),
      fetch('/data/connections.yaml'),
      fetch('/data/groups.yaml')
    ]);

    const [nodesText, connectionsText, groupsText] = await Promise.all([
      nodesResponse.text(),
      connectionsResponse.text(),
      groupsResponse.text()
    ]);

    const nodes = yaml.load(nodesText).nodes || [];
    const connections = yaml.load(connectionsText).connections || [];
    const groups = yaml.load(groupsText).groups || [];

    console.log('Loaded data:', { nodes, connections, groups });

    return {
      nodes,
      connections,
      groups
    };
  } catch (error) {
    console.error('Error loading data:', error);
    return {
      nodes: [],
      connections: [],
      groups: []
    };
  }
}
