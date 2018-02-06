define(function (require) {
  var Behavior = require('./behavior');

  var MarkerEnd = Behavior.create('marker-end');

  MarkerEnd.prototype.initialize = function () {
    this.directedGraph.on('render', this.onRender.bind(this));
  };

  MarkerEnd.prototype.onRender = function () {
    this.defs = this.directedGraph.container.append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 19)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#777')
      .attr('stroke', '#777');

    this.directedGraph.links.attr('marker-end', 'url(#arrowhead)');
  };

  return MarkerEnd;
});
