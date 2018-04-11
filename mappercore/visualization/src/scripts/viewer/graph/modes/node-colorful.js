define(function (require) {

  const GraphMode = require('../mode');

  return class NodeColorful extends GraphMode {

    didMount() {
      this.listenTo('graph:didRender', () => {
        this.graphDidRender();
      })
    }

    graphDidRender() {
      this.graph.nodes.attr("fill", this.config.filter.bind(this));
    }

  };
});
