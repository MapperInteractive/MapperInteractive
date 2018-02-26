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
      this.draggable = this.graph.behaviors.get('draggable');
    }

    willActivate() {
      if (this.draggable) {
        this.draggable.pause();
      }
      this.listenTo('node:mouseover', (e) => this.eventNodeMouseOver(e));
      this.listenTo('node:mouseout', (e) => this.eventNodeMouseOut(e));
    }

    didActivate() {
      super.didActivate();
      this.listenTo('node:click', (e) => {
        let target = d3.select(e.target);
        let targetId = target.datum()['id'];
        let cluster = this.findClusterNodes(targetId);

        let isSelected = target.classed('selected');

        this.graph.nodes.filter((d) => {
          return cluster.indexOf(d['id']) > -1;
        }).classed('selected', !isSelected);

        let selection = this.graph.container.selectAll('.selected').data();
        this.graph.trigger('nodes:select', selection);
      });
    }

    willDeactivate() {
      if (this.draggable) {
        this.draggable.resume();
      }
      this.stopListening();
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

    eventNodeMouseOver(e) {
      let cluster = this.findClusterNodes(d3.select(e.target).datum()['id']);
      this.graph.nodes.filter((d) => {
        return cluster.indexOf(d['id']) > -1;
      }).classed('graph-node--potential', true);
    }

    eventNodeMouseOut(e) {
      this.graph.nodes.classed('graph-node--potential', false);
    }

  }
})
;
