define(function (require) {
  var d3 = require('d3');
  var Behavior = require('./behavior');

  var ForceSimulation = Behavior.create('force-simulation');

  ForceSimulation.prototype.initialize = function () {
    this.directedGraph.on('render', this.onRender.bind(this));
  };

  ForceSimulation.prototype.onRender = function () {
    var clientRect = this.directedGraph.container.node().getBoundingClientRect();

    this.simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function (d) {
        return d.id;
      }))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(clientRect.width / 2, clientRect.height / 2))
      .force("x", d3.forceX().strength(0.2))
      .force("y", d3.forceY().strength(0.2));

    this.graphData = this.directedGraph.model.get('graph');

    this.simulation
      .nodes(this.graphData.nodes)
      .on("tick", this.ticked.bind(this));

    this.simulation
      .force("link")
      .links(this.graphData.links);
  };

  ForceSimulation.prototype.ticked = function () {

    this.directedGraph.links
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    this.directedGraph.nodes
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });
  };

  return ForceSimulation;
});
