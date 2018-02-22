define(function () {


  function BaseBehavior(config) {
    this.config = config;
    this.paused = false;
    this.namespace = 'base/directed-graph';
  }

  BaseBehavior.prototype.setGraph = function (graph) {
    this.graph = graph;
  };

  BaseBehavior.prototype.initialize = function () {
  };

  BaseBehavior.create = function (name) {

    function ExtendedBehavior(graph) {
      BaseBehavior.call(this, graph);
      this.name = name;
    }

    ExtendedBehavior.prototype = Object.create(BaseBehavior.prototype);
    ExtendedBehavior.prototype.constructor = ExtendedBehavior;

    return ExtendedBehavior;
  };

  BaseBehavior.prototype.do = function (fn) {
    fn(this);
  };


  BaseBehavior.prototype.pause = function () {
    this.paused = true;
    console.log('[' + this.namespace + '/' + this.name + '] paused');
  };

  BaseBehavior.prototype.resume = function () {
    this.paused = false;
    console.log('[' + this.namespace + '/' + this.name + '] resume');
  };

  return BaseBehavior;
});
