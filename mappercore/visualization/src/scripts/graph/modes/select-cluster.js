define(function (require) {

  const GraphMode = require('../mode');
  const d3 = require('d3');

  return class SelectClusterMode extends GraphMode {

    constructor() {
      super();
      this.name = 'select-cluster';
      this.label = 'click a cluster to select';
    }

    willMount() {
      super.willMount()
    }

    didMount() {
      this.draggable = this.graph.behaviors.get('Draggable');
    }

    willActivate() {
      if (this.draggable) {
        this.draggable.pause();
      }
    }

    didActivate() {
      super.didActivate();
      this.listenTo('node:clicked', (e) => {
        let target = d3.select(e.target);
        let targetId = target.datum()['id'];
        let cluster = this.findClusterNodes(targetId);

        this.graph.nodes.filter((d) => {
          return cluster.indexOf(d['id']) > -1;
        }).classed('selected', true);

        let selection = this.graph.container.selectAll('.selected').data();
        this.graph.trigger('node:selected', selection);
      });
    }

    willDeactivate() {
      if (this.draggable) {
        this.draggable.resume();
      }
    }

    didDeactivate() {
      super.didDeactivate();
      this.stopListening();
    }

    findClusterNodes(nodeId) {
      let links = this.graph.model.get('data').links;
      let cluster = [];

      let finder = (startId) => {
        cluster.push(startId);

        links.map((link) => {
          let found = null;

          if (link['source']['id'] === startId) {
            found = link['target']['id'];
          } else if (link['target']['id'] === startId) {
            found = link['source']['id'];
          }

          if (found && cluster.indexOf(found) === -1) {
            finder(found);
          }
        })
      };

      finder(nodeId);

      return cluster;
    }

  }
})
;
