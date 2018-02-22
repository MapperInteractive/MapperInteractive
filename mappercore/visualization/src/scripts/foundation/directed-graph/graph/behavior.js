define(function () {
  class GraphBehavior {

    constructor(config) {
      this.config = config;
      this.enabled = true;
      this.graph = null;
    }

    setGraph(graph) {
      this.graph = graph;
    }

  }

  return GraphBehavior;
});
