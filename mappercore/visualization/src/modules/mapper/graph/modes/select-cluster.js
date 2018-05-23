define(function (require) {

  const GraphMode = require('../mode');
  const d3 = require('d3');

  return class SelectClusterMode extends GraphMode {

    constructor() {
      super();
      this.name = 'select-cluster';
      this.label = 'Select Cluster';
    }

    willActivate() {
      super.willActivate();
      this.listenTo(this.graph, 'mouseover:node', (e) => this.eventNodeMouseOver(e));
      this.listenTo(this.graph, 'mouseout:node', (e) => this.eventNodeMouseOut(e));
    }

    didActivate() {
      super.didActivate();
      this.listenTo(this.graph, 'click:node', (e) => {
        let target = d3.select(e.target);
        let targetId = target.datum()['id'];
        let nodesInCluster = this.findClusterNodes(targetId);
        let isSelected = this.graph.isNodeSelected(targetId);

        if (isSelected) {
          this.graph.unselectNodeList(nodesInCluster);
        } else {
          this.graph.selectNodeList(nodesInCluster);
        }
      });
    }

    willDeactivate() {
      super.willDeactivate();
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
      }).classed(this.graph.CLASS_NAME_CANDIDATE, true);
    }

    eventNodeMouseOut(e) {
      this.graph.nodes.classed(this.graph.CLASS_NAME_CANDIDATE, false);
    }

  }
})
;
