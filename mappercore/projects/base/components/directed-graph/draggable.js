define(function (require) {
  var d3 = require('d3');
  var Behavior = require('./behavior');
  var Draggable = Behavior.create('draggable');

  Draggable.prototype.initialize = function () {
    this.directedGraph.on('render', function () {
      this.forceSimulation = this.directedGraph.getBehavior('force-simulation');
      this.directedGraph.nodes.call(d3.drag()
        .on("start", this.dragStarted.bind(this))
        .on("drag", this.dragged.bind(this))
        .on("end", this.dragEnded.bind(this)));
    }.bind(this));
  };

  Draggable.prototype.dragStarted = function (d) {
    if (this.paused) {
      return false;
    }
    if (this.forceSimulation && !d3.event.active) {
      this.forceSimulation.do(function (br) {
        br.simulation.alphaTarget(0.3).restart();
      });
    }

    d.fx = d.x;
    d.fy = d.y;
  };

  Draggable.prototype.dragged = function (d) {
    if (this.paused) {
      return false;
    }
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  };

  Draggable.prototype.dragEnded = function (d) {
    if (this.paused) {
      return false;
    }
    if (this.forceSimulation && !d3.event.active) {
      this.forceSimulation.do(function (br) {
        br.simulation.alphaTarget(0);
      });
    }
    d.fx = null;
    d.fy = null;
  };

  return Draggable;

});
