"use strict";

/**
 * A mode to select a path in a graph.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require) {
  var _window = window,
      d3 = _window.d3,
      _ = _window._,
      Model = _window.b.Model;

  var GraphMode = require('../Mode');

  return function (_GraphMode) {
    _inherits(SelectPathMode, _GraphMode);

    function SelectPathMode() {
      _classCallCheck(this, SelectPathMode);

      var _this = _possibleConstructorReturn(this, (SelectPathMode.__proto__ || Object.getPrototypeOf(SelectPathMode)).call(this));

      _this.name = 'select-path';
      _this.label = 'Select Path';
      _this.CLASS_NAME_ANCHOR = '--anchor';

      _this.model = new Model({
        'selection': []
      });
      return _this;
    }

    _createClass(SelectPathMode, [{
      key: 'willActivate',
      value: function willActivate() {
        _get(SelectPathMode.prototype.__proto__ || Object.getPrototypeOf(SelectPathMode.prototype), 'willActivate', this).call(this);
        this.anchors = [];
        this.clear();
        this.clearSelection();
        this.preparing();
      }
    }, {
      key: 'didActivate',
      value: function didActivate() {
        var _this2 = this;

        _get(SelectPathMode.prototype.__proto__ || Object.getPrototypeOf(SelectPathMode.prototype), 'didActivate', this).call(this);
        this.markInitialCandidates();
        this.listenTo(this.graph, this.graph.EVENT_DID_RENDER, function (e) {
          return _this2.graphDidRender(e);
        });
        this.listenTo(this.graph, this.graph.EVENT_CLICK_NODE, function (e) {
          return _this2.nodeClick(e);
        });
        this.listenTo(this.graph, this.graph.EVENT_MOUSEOVER_NODE, function (e) {
          return _this2.nodeMouseover(e);
        });
        this.listenTo(this.graph, this.graph.EVENT_MOUSEOUT_NODE, function (e) {
          return _this2.nodeMouseout(e);
        });
      }
    }, {
      key: 'willDeactivate',
      value: function willDeactivate() {
        _get(SelectPathMode.prototype.__proto__ || Object.getPrototypeOf(SelectPathMode.prototype), 'willDeactivate', this).call(this);
        this.clear();
        this.clearSelection();
        this.stopListening();
      }
    }, {
      key: 'didDeactivate',
      value: function didDeactivate() {
        _get(SelectPathMode.prototype.__proto__ || Object.getPrototypeOf(SelectPathMode.prototype), 'didDeactivate', this).call(this);
        this.stopListening();
      }
    }, {
      key: 'graphDidRender',
      value: function graphDidRender(e) {
        this.clear();
        this.anchors = [];
        this.preparing();
        this.markInitialCandidates();
      }
    }, {
      key: 'nodeClick',
      value: function nodeClick(e) {
        var target = d3.select(e.target);
        var clickedNodeId = target.datum()["id"];

        if (target.classed(this.graph.CLASS_NAME_UNAVAILABLE)) {
          return false;
        }

        this.selectNode(clickedNodeId);

        target.classed(this.CLASS_NAME_ANCHOR, true);

        // for the first anchor, only update the shortest paths
        if (this.anchors.length === 0) {
          this.shortestPaths = this.dijkstra(clickedNodeId);
          this.setCandidates(_.flatten(_.pairs(this.shortestPaths)));
          this.anchors.push(clickedNodeId);
          this.findNodeById(clickedNodeId).classed(this.CLASS_NAME_ANCHOR, true);

          var selection = [clickedNodeId];
          this.model.set('selection', selection);
        } else {
          // make a copy in order to trigger event on model
          // if not, the selection will shadow updated without using `set` on model
          var _selection = this.model.get('selection').slice();

          // if we have last anchor,
          // select the nodes on the path using previous shortest paths
          var previousAnchorId = this.anchors[this.anchors.length - 1];

          // path selection is from end to begin
          // so we need to reverse before merge it to graph selection
          var pathSelection = [];
          this.selectAlongThePath(previousAnchorId, clickedNodeId, pathSelection);
          _selection = _selection.concat(pathSelection.reverse());

          this.anchors.push(clickedNodeId);
          this.findNodeById(clickedNodeId).classed(this.CLASS_NAME_ANCHOR, true);

          // update shortest paths base on latest anchor
          this.shortestPaths = this.dijkstra(clickedNodeId);

          this.model.set('selection', _selection);
        }
      }
    }, {
      key: 'nodeMouseover',
      value: function nodeMouseover(e) {
        var target = d3.select(e.target);

        if (target.classed(this.graph.CLASS_NAME_UNAVAILABLE)) {
          return;
        }

        var nodeId = target.datum()["id"];
        this.highlightPotentialAnchor(nodeId);

        if (this.anchors.length > 0) {
          this.highlightPotentialPath(nodeId);
        }
      }
    }, {
      key: 'nodeMouseout',
      value: function nodeMouseout(e) {
        this.clearPotentialSelection();
      }
    }, {
      key: 'dijkstra',
      value: function dijkstra(startId) {
        var _this3 = this;

        var paths = {};
        var nodeIdList = _.keys(this.nodes);
        var distances = _.object(nodeIdList, nodeIdList.map(function () {
          return Number.POSITIVE_INFINITY;
        }));

        distances[startId] = 0;

        var unvisited = nodeIdList.slice();

        var _loop = function _loop() {

          var currentId = undefined;
          var nearestDistance = Number.POSITIVE_INFINITY;

          unvisited.forEach(function (id) {
            if (distances[id] < nearestDistance) {
              currentId = id;
              nearestDistance = distances[id];
            }
          });
          unvisited.splice(unvisited.indexOf(currentId), 1);

          // no unvisited node in current cluster
          if (currentId === undefined) {
            return 'break';
          }

          _this3.nodes[currentId]["neighbors"].map(function (neighborId) {
            if (unvisited.indexOf(neighborId) > -1) {
              if (distances[neighborId] > distances[currentId] + 1) {
                distances[neighborId] = distances[currentId] + 1;
                paths[neighborId] = currentId;
              }
            }
          });
        };

        while (unvisited.length > 0) {
          var _ret = _loop();

          if (_ret === 'break') break;
        }

        return paths;
      }
    }, {
      key: 'markInitialCandidates',
      value: function markInitialCandidates() {
        var _this4 = this;

        this.graph.nodes.filter(function (d) {
          return _this4.nodes[d["id"]]["neighbors"].length === 0;
        }).classed(this.graph.CLASS_NAME_UNAVAILABLE, true);
      }
    }, {
      key: 'setCandidates',
      value: function setCandidates(nodeIdList) {
        this.graph.nodes.filter(function (d) {
          return nodeIdList.indexOf(d["id"]) === -1;
        }).classed(this.graph.CLASS_NAME_UNAVAILABLE, true);

        this.graph.links.filter(function (d) {
          return nodeIdList.indexOf(d['source']['id']) === -1 && nodeIdList.indexOf(d['target']['id']) === -1;
        }).classed(this.graph.CLASS_NAME_UNAVAILABLE, true);
      }
    }, {
      key: 'preparing',
      value: function preparing() {
        var _this5 = this;

        this.nodes = _.object(this.graph.nodes.data().map(function (n) {
          return [n["id"], { "id": n["id"], "neighbors": [] }];
        }));

        this.graph.links.data().forEach(function (link) {
          _this5.nodes[link["source"]["id"]]["neighbors"].push(link["target"]["id"]);
          _this5.nodes[link["target"]["id"]]["neighbors"].push(link["source"]["id"]);
        });

        _.mapObject(this.nodes, function (val, key) {
          _this5.nodes[key]["neighbors"] = _.uniq(_this5.nodes[key]["neighbors"]);
        });
      }
    }, {
      key: 'selectAlongThePath',
      value: function selectAlongThePath(fromId, toId, selection) {
        var currentId = toId;
        while (this.shortestPaths[currentId]) {
          this.selectNode(currentId);
          selection.push(currentId);

          var nextId = this.shortestPaths[currentId];

          var endpoints = [currentId, nextId];
          this.graph.selectLink(endpoints);

          currentId = nextId;
        }
      }
    }, {
      key: 'selectNode',
      value: function selectNode(id) {
        this.graph.selectNode(id);
      }
    }, {
      key: 'highlightPotentialAnchor',
      value: function highlightPotentialAnchor(id) {
        this.findNodeById(id).classed(this.graph.CLASS_NAME_CANDIDATE, true);
      }
    }, {
      key: 'highlightPotentialPath',
      value: function highlightPotentialPath(potentialAnchorId) {
        var lastAnchorId = this.anchors[this.anchors.length - 1];
        var currentId = potentialAnchorId;

        while (this.shortestPaths[currentId]) {
          currentId = this.shortestPaths[currentId];
          if (currentId === lastAnchorId) {
            break;
          }
          this.findNodeById(currentId).classed(this.graph.CLASS_NAME_CANDIDATE, true);
        }
      }
    }, {
      key: 'clearPotentialSelection',
      value: function clearPotentialSelection() {
        this.graph.nodes.classed(this.graph.CLASS_NAME_CANDIDATE, false);
      }
    }, {
      key: 'findNodeById',
      value: function findNodeById(id) {
        return this.graph.nodes.filter(function (d) {
          return d["id"] === id;
        });
      }
    }, {
      key: 'clear',
      value: function clear() {
        this.clearPotentialSelection();
        this.graph.nodes.classed(this.graph.CLASS_NAME_UNAVAILABLE, false);
        this.graph.nodes.classed(this.graph.CLASS_NAME_SELECTED, false);
        this.graph.nodes.classed(this.CLASS_NAME_ANCHOR, false);
        this.graph.links.classed(this.graph.CLASS_NAME_SELECTED, false);
        this.graph.trigger('change:selection', []);
      }
    }, {
      key: 'clearSelection',
      value: function clearSelection() {
        this.graph.clearSelection();
      }
    }]);

    return SelectPathMode;
  }(GraphMode);
});