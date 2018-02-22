define(function (require) {
  const d3 = require('d3');
  const GraphBehavior = require('../behavior');

  class ForceSimulation extends GraphBehavior {

    didMount() {
      super.didMount();

      this.listenTo('graph:willRender', () => {
        this.data = this.graph.model.get('data');
      });

      this.listenTo('graph:didRender', () => {
        console.log('graph:didRender');
        this._graphDidRender();
      });
    }

    _graphDidRender() {
      let clientRect = this.graph.container.node().getBoundingClientRect();

      this.simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
          return d.id;
        }))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(clientRect.width / 2, clientRect.height / 2))
        .force("x", d3.forceX().strength(0.2))
        .force("y", d3.forceY().strength(0.2));

      this.simulation
        .nodes(this.data.nodes)
        .on("tick", () => {
          this._ticked();
        });

      this.simulation
        .force("link")
        .links(this.data.links);
    }

    _ticked() {

      this.graph.links
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

      this.graph.nodes
        .attr("cx", function (d) {
          return d.x;
        })
        .attr("cy", function (d) {
          return d.y;
        });
    }
  }

  return ForceSimulation;
});
