define(function (require) {
  var Behavior = require('./behavior');

  var NodeColor = Behavior.create('node-color');

  NodeColor.prototype.initialize = function () {
    this.graph.on('render', this.updateColor.bind(this));
  };

  NodeColor.prototype.updateFilter = function (fn) {
    this.config.filter = fn;
    this.updateColor();
  };

  NodeColor.prototype.updateColor = function () {
    this.graph.nodes.attr("fill", this.config.filter.bind(this));
  };

  return NodeColor;
});
