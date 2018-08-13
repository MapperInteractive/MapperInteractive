"use strict";

/**
 * Enable graph using force layout.
 */
define(function (require) {
  const { d3 } = require('core/Lib');
  const GraphBehavior = require('../Behavior');

  return class ForceSimulation extends GraphBehavior {

    initialize() {
      this.name = 'force-simulation';
    }

    didMount() {
      super.didMount();

      this.events.listenTo(this.graph, 'didRender', () => {
        this._graphDidRender();
      });
    }

    _graphDidRender() {
      let clientRect = this.graph.svg.node().getBoundingClientRect();

      this.simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {
          return d.id;
        }))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(clientRect.width / 2, clientRect.height / 2))
        .force("x", d3.forceX().strength(0.2))
        .force("y", d3.forceY().strength(0.2));

      let { nodes, links } = this.graph.model.get('data');

      this.simulation
        .nodes(nodes)
        .on("tick", () => {
          this._ticked();
        });

      this.simulation
        .force("link")
        .links(links);
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

      this.graph.trigger('didLayout');
    }
  }

});
