define(function (require) {

  const GraphMode = require('../mode');

  return class MarkerEnd extends GraphMode {

    didMount() {
      this.listenTo('graph:didRender', () => {
        this.graphDidRender();
      })
    }

    graphDidRender() {
      this.defs = this.graph.container.append('defs')
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

      this.graph.links.attr('marker-end', 'url(#arrowhead)');
    }
  };
});
