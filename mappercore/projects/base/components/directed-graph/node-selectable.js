define(function (require) {
  var d3 = require('d3');
  var Behavior = require('./behavior');

  var NodeSelectable = Behavior.create('node-selectable');

  NodeSelectable.prototype.initialize = function () {
    this.directedGraph.on('render', this.reviewContext.bind(this));
    this.directedGraph.on('nodeClicked', this.onNodeClicked.bind(this));
  };

  NodeSelectable.prototype.onNodeClicked = function (e) {
    var target = d3.select(e.target);
    target.classed('selected', !target.classed('selected'));
    var selection = this.directedGraph.container.selectAll('.node.selected').data();
    this.directedGraph.trigger('nodeSelectionChanged', selection);
  };

  NodeSelectable.prototype.reviewContext = function () {
    this.draggable = this.directedGraph.getBehavior('draggable');

    var updateMode = function (inverse) {
      return function () {
        var triggered = [91, 17].indexOf(d3.event.keyCode) >= 0;

        if (inverse) {
          triggered = !triggered;
        }

        if (this.draggable) {
          if (triggered) {
            this.draggable.pause();
          } else {
            this.draggable.resume();
          }
        }

      }.bind(this);
    }.bind(this);

    d3.select('body')
      .on('keydown', updateMode())
      .on('keyup', updateMode(true));
  };


  return NodeSelectable;
});
