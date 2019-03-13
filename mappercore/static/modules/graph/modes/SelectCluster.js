"use strict";

/**
 * A mode to select a cluster in a graph.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require) {

  var GraphMode = require('../Mode');
  var d3 = require('d3');

  return function (_GraphMode) {
    _inherits(SelectClusterMode, _GraphMode);

    function SelectClusterMode() {
      _classCallCheck(this, SelectClusterMode);

      var _this = _possibleConstructorReturn(this, (SelectClusterMode.__proto__ || Object.getPrototypeOf(SelectClusterMode)).call(this));

      _this.name = 'select-cluster';
      _this.label = 'Select Cluster';
      return _this;
    }

    _createClass(SelectClusterMode, [{
      key: 'willActivate',
      value: function willActivate() {
        var _this2 = this;

        _get(SelectClusterMode.prototype.__proto__ || Object.getPrototypeOf(SelectClusterMode.prototype), 'willActivate', this).call(this);
        this.listenTo(this.graph, 'mouseover:node', function (e) {
          return _this2.eventNodeMouseOver(e);
        });
        this.listenTo(this.graph, 'mouseout:node', function (e) {
          return _this2.eventNodeMouseOut(e);
        });
      }
    }, {
      key: 'didActivate',
      value: function didActivate() {
        var _this3 = this;

        _get(SelectClusterMode.prototype.__proto__ || Object.getPrototypeOf(SelectClusterMode.prototype), 'didActivate', this).call(this);
        this.listenTo(this.graph, 'click:node', function (e) {
          var target = d3.select(e.target);
          var targetId = target.datum()['id'];
          var nodesInCluster = _this3.findClusterNodes(targetId);
          var isSelected = _this3.graph.isNodeSelected(targetId);

          if (isSelected) {
            _this3.graph.unselectNodeList(nodesInCluster);
          } else {
            _this3.graph.selectNodeList(nodesInCluster);
          }
        });
      }
    }, {
      key: 'willDeactivate',
      value: function willDeactivate() {
        _get(SelectClusterMode.prototype.__proto__ || Object.getPrototypeOf(SelectClusterMode.prototype), 'willDeactivate', this).call(this);
        this.stopListening();
      }
    }, {
      key: 'didDeactivate',
      value: function didDeactivate() {
        _get(SelectClusterMode.prototype.__proto__ || Object.getPrototypeOf(SelectClusterMode.prototype), 'didDeactivate', this).call(this);
        this.stopListening();
      }
    }, {
      key: 'findClusterNodes',
      value: function findClusterNodes(nodeId) {
        var links = this.graph.model.get('data').links;
        var cluster = [];

        var finder = function finder(startId) {
          cluster.push(startId);

          links.map(function (link) {
            var found = null;

            if (link['source']['id'] === startId) {
              found = link['target']['id'];
            } else if (link['target']['id'] === startId) {
              found = link['source']['id'];
            }

            if (found && cluster.indexOf(found) === -1) {
              finder(found);
            }
          });
        };

        finder(nodeId);

        return cluster;
      }
    }, {
      key: 'eventNodeMouseOver',
      value: function eventNodeMouseOver(e) {
        var cluster = this.findClusterNodes(d3.select(e.target).datum()['id']);
        this.graph.nodes.filter(function (d) {
          return cluster.indexOf(d['id']) > -1;
        }).classed(this.graph.CLASS_NAME_CANDIDATE, true);
      }
    }, {
      key: 'eventNodeMouseOut',
      value: function eventNodeMouseOut(e) {
        this.graph.nodes.classed(this.graph.CLASS_NAME_CANDIDATE, false);
      }
    }]);

    return SelectClusterMode;
  }(GraphMode);
});