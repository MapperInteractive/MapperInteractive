define(function (require) {

  const GraphMode = require('../mode');
  const d3 = require('d3');
  const _ = require('underscore');
  const CLASS_UNSELECTABLE = 'path-select-not-allowed';
  const CLASS_POTENTIAL_ANCHOR = 'path-select__potential-anchor';
  const CLASS_POTENTIAL_SELECT = 'path-select__potential-select';

  return class SelectPathMode extends GraphMode {

    didMount() {
      this.draggable = this.graph.behaviors.get('Draggable');
    }

    willActivate() {
      if (this.draggable) {
        this.draggable.pause();
      }
      this.anchors = [];
      this.preparing();
    }

    didActivate() {
      super.didActivate();

      this.markInitialCandidates();

      this.listenTo('node:clicked', (e) => this.nodeClicked(e));
      this.listenTo('node:mouseover', (e) => this.nodeMouseover(e));
      this.listenTo('node:mouseout', (e) => this.nodeMouseout(e));
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

    nodeClicked(e) {
      let target = d3.select(e.target);
      if (target.classed(CLASS_UNSELECTABLE)) {
        return false;
      }

      target.classed("path-select-anchor", true);
      let clickedNodeId = target.datum()["id"];

      console.log(['clickedNodeId', clickedNodeId]);

      // for the first anchor, only update the shortest paths
      if (this.anchors.length === 0) {
        this.shortestPaths = this.dijkstra(clickedNodeId);
        this.setCandidates(_.flatten(_.pairs(this.shortestPaths)));
        this.anchors.push(clickedNodeId);
        return;
      }

      // if we have last anchor,
      // select the nodes on the path using previous shortest paths
      let previousAnchorId = this.anchors[this.anchors.length - 1];
      this.selectAlongThePath(previousAnchorId, clickedNodeId);
      this.anchors.push(clickedNodeId);

      // update shortest paths base on latest anchor
      this.shortestPaths = this.dijkstra(clickedNodeId);
    }

    nodeMouseover(e) {
      let nodeId = d3.select(e.target).datum()["id"];
      this.highlightPotentialAnchor(nodeId);

      if (this.anchors.length > 0) {
        this.highlightPotentialPath(nodeId);
      }
    }

    nodeMouseout(e) {
      this.clearPotentialSelection();
    }

    dijkstra(startId) {

      let paths = {};
      let nodeIdList = _.keys(this.nodes);
      let distances = _.object(nodeIdList, nodeIdList.map(() => Number.POSITIVE_INFINITY));

      distances[startId] = 0;

      let unvisited = nodeIdList.slice();

      while (unvisited.length > 0) {

        let currentId = undefined;
        let nearestDistance = Number.POSITIVE_INFINITY;

        unvisited.forEach((id) => {
          if (distances[id] < nearestDistance) {
            currentId = id;
            nearestDistance = distances[id];
          }
        });
        unvisited.splice(unvisited.indexOf(currentId), 1);

        // no unvisited node in current cluster
        if (currentId === undefined) {
          break;
        }

        this.nodes[currentId]["neighbors"].map((neighborId) => {
          if (unvisited.indexOf(neighborId) > -1) {
            if (distances[neighborId] > distances[currentId] + 1) {
              distances[neighborId] = distances[currentId] + 1;
              paths[neighborId] = currentId;
            }
          }
        });
      }

      return paths;
    }

    markInitialCandidates() {
      this.graph.nodes.filter((d) => {
        return this.nodes[d["id"]]["neighbors"].length === 0;
      }).classed(CLASS_UNSELECTABLE, true);
    }

    setCandidates(nodeIdList) {
      this.graph.nodes.filter((d) => {
        return nodeIdList.indexOf(d["id"]) === -1;
      }).classed(CLASS_UNSELECTABLE, true);
    }

    preparing() {
      this.nodes = _.object(this.graph.nodes.data().map((n) => {
        return [n["id"], {"id": n["id"], "neighbors": []}];
      }));

      this.graph.links.data().forEach((link) => {
        this.nodes[link["source"]["id"]]["neighbors"].push(link["target"]["id"]);
        this.nodes[link["target"]["id"]]["neighbors"].push(link["source"]["id"]);
      });

      _.mapObject(this.nodes, (val, key) => {
        this.nodes[key]["neighbors"] = _.uniq(this.nodes[key]["neighbors"]);
      });
    }

    selectAlongThePath(fromId, toId) {
      let currentId = toId;
      while (this.shortestPaths[currentId]) {
        this.selectNode(currentId);
        currentId = this.shortestPaths[currentId];
      }
    }

    selectNode(id) {
      this.findNodeById(id).classed("selected", true);
    }

    highlightPotentialAnchor(id) {
      this.findNodeById(id).classed(CLASS_POTENTIAL_ANCHOR, true);
    }

    highlightPotentialPath(potentialAnchorId) {
      let lastAnchorId = this.anchors[this.anchors.length - 1];
      let currentId = potentialAnchorId;

      while (this.shortestPaths[currentId]) {
        currentId = this.shortestPaths[currentId];
        if (currentId === lastAnchorId) {
          break;
        }
        this.findNodeById(currentId).classed(CLASS_POTENTIAL_SELECT, true)
      }
    }

    clearPotentialSelection() {
      this.graph.nodes
        .classed(CLASS_POTENTIAL_ANCHOR, false)
        .classed(CLASS_POTENTIAL_SELECT, false);
    }

    findNodeById(id) {
      return this.graph.nodes.filter((d) => d["id"] === id);
    }
  }


})
;
