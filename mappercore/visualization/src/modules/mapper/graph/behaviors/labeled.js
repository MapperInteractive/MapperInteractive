define(function (require) {
  const GraphBehavior = require('../behavior');

  return class Labeled extends GraphBehavior {

    initialize() {
      this.name = 'labeled';
      this.labels = null;
    }

    didMount() {
      super.didMount();

      this.events.listenTo(this.graph, 'didRender', () => this._graphDidRender());

      this.events.listenTo(this.graph, 'didLayout', () => {
        this.graph.svg
          .selectAll('.viewer-graph__label')
          .data(this.graph.nodes.data())
          .attr('dx', (d) => d.x)
          .attr('dy', (d) => d.y + 1)
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle');
      })
    }

    _graphDidRender() {
      this.labels = this.graph.svg.append("g")
        .selectAll("text")
        .data(this.graph.nodes.data())
        .enter().append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function (d) {
          return d.id
        })
        .classed('viewer-graph__label', true);
    }
  }
});
