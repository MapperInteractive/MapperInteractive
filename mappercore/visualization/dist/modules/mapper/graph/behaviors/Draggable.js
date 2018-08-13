"use strict";

/**
 * Enable graph draggable.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require) {
  var _require = require('core/Lib'),
      d3 = _require.d3;

  var GraphBehavior = require('../Behavior');

  var Draggable = function (_GraphBehavior) {
    _inherits(Draggable, _GraphBehavior);

    function Draggable() {
      _classCallCheck(this, Draggable);

      return _possibleConstructorReturn(this, (Draggable.__proto__ || Object.getPrototypeOf(Draggable)).apply(this, arguments));
    }

    _createClass(Draggable, [{
      key: 'initialize',
      value: function initialize() {
        this.name = 'draggable';
      }
    }, {
      key: 'didMount',
      value: function didMount() {
        var _this2 = this;

        _get(Draggable.prototype.__proto__ || Object.getPrototypeOf(Draggable.prototype), 'didMount', this).call(this);

        this.listenTo(this.graph, 'didRender', function () {
          _this2.forceSimulation = _this2.graph.behaviors.get('force-simulation');
          _this2.graph.nodes.call(d3.drag().on("start", function (d) {
            _this2.dragStarted(d);
          }).on("drag", function (d) {
            _this2.dragged(d);
          }).on("end", function (d) {
            _this2.dragEnded(d);
          }));
        });
      }
    }, {
      key: 'dragStarted',
      value: function dragStarted(d) {
        if (this.paused) {
          return false;
        }

        if (this.forceSimulation && !d3.event.active) {
          this.forceSimulation.simulation.alphaTarget(0.3).restart();
        }

        d.fx = d.x;
        d.fy = d.y;
      }
    }, {
      key: 'dragged',
      value: function dragged(d) {
        if (this.paused) {
          return false;
        }
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }
    }, {
      key: 'dragEnded',
      value: function dragEnded(d) {
        if (this.paused) {
          return false;
        }

        if (this.forceSimulation && !d3.event.active) {
          this.forceSimulation.simulation.alphaTarget(0);
        }

        d.fx = null;
        d.fy = null;
      }
    }]);

    return Draggable;
  }(GraphBehavior);

  return Draggable;
});