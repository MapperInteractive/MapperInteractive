'use strict';

/**
 * Convert a edge list to graph structure for D3.js
 */
define(function (require) {
  var _require = require('utils'),
      d3 = _require.d3;

  return function (edgeList) {
    var nodeSet = new Set([]);

    var graph = {
      links: [],
      nodes: []
    };

    d3.csvParseRows(edgeList).map(function (row) {

      var pair = row[0].split(/\s+/).map(function (value) {
        var nodeId = +value;
        if (!nodeSet.has(nodeId)) {
          nodeSet.add(nodeId);
          graph.nodes.push({ id: nodeId });
        }
        return nodeId;
      });

      graph.links.push({ source: pair[0], target: pair[1] });
    });

    return graph;
  };
});