/**
 * Convert a edge list to graph structure for D3.js
 */
define(function (require) {

  let { d3 } = require('utils');

  return function (edgeList) {
    const nodeSet = new Set([]);

    let graph = {
      links: [],
      nodes: []
    };

    d3.csvParseRows(edgeList).map(function (row) {

      let pair = row[0].split(/\s+/).map(function (value) {
        let nodeId = +value;
        if (!nodeSet.has(nodeId)) {
          nodeSet.add(nodeId);
          graph.nodes.push({id: nodeId});
        }
        return nodeId;
      });

      graph.links.push({ source: pair[0], target: pair[1]});
    });

    return graph;
  };
});
