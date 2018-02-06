define(function () {

  function BaseBehavior(config) {
    this.config = config;
    this.paused = false;
    this.namespace = 'base/directed-graph';
  }

  BaseBehavior.prototype.setDirectedGraph = function (directedGraph) {
    this.directedGraph = directedGraph;
  };

  BaseBehavior.prototype.initialize = function () {
  };

  BaseBehavior.create = function (name) {

    function Behavior(directedGraph) {
      BaseBehavior.call(this, directedGraph);
      this.name = name;
    }

    Behavior.prototype = Object.create(BaseBehavior.prototype);

    return Behavior;
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
