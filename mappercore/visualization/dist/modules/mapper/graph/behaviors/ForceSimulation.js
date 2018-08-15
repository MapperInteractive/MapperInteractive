"use strict";

/**
 * Enable graph using force layout.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require) {
  var d3 = require('d3');
  var GraphBehavior = require('../Behavior');

  return function (_GraphBehavior) {
    _inherits(ForceSimulation, _GraphBehavior);

    function ForceSimulation() {
      _classCallCheck(this, ForceSimulation);

      return _possibleConstructorReturn(this, (ForceSimulation.__proto__ || Object.getPrototypeOf(ForceSimulation)).apply(this, arguments));
    }

    _createClass(ForceSimulation, [{
      key: 'initialize',
      value: function initialize() {
        this.name = 'force-simulation';
      }
    }, {
      key: 'didMount',
      value: function didMount() {
        var _this2 = this;

        _get(ForceSimulation.prototype.__proto__ || Object.getPrototypeOf(ForceSimulation.prototype), 'didMount', this).call(this);

        this.events.listenTo(this.graph, 'didRender', function () {
          _this2._graphDidRender();
        });
      }
    }, {
      key: '_graphDidRender',
      value: function _graphDidRender() {
        var _this3 = this;

        var clientRect = this.graph.svg.node().getBoundingClientRect();

        this.simulation = d3.forceSimulation().force("link", d3.forceLink().id(function (d) {
          return d.id;
        })).force("charge", d3.forceManyBody().strength(-200)).force("center", d3.forceCenter(clientRect.width / 2, clientRect.height / 2)).force("x", d3.forceX().strength(0.2)).force("y", d3.forceY().strength(0.2));

        var _graph$model$get = this.graph.model.get('data'),
            nodes = _graph$model$get.nodes,
            links = _graph$model$get.links;

        this.simulation.nodes(nodes).on("tick", function () {
          _this3._ticked();
        });

        this.simulation.force("link").links(links);
      }
    }, {
      key: '_ticked',
      value: function _ticked() {

        this.graph.links.attr("x1", function (d) {
          return d.source.x;
        }).attr("y1", function (d) {
          return d.source.y;
        }).attr("x2", function (d) {
          return d.target.x;
        }).attr("y2", function (d) {
          return d.target.y;
        });

        this.graph.nodes.attr("cx", function (d) {
          return d.x;
        }).attr("cy", function (d) {
          return d.y;
        });

        this.graph.trigger('didLayout');
      }
    }]);

    return ForceSimulation;
  }(GraphBehavior);
});