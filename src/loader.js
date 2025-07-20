import yaml from 'js-yaml';

export async function loadData() {
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
