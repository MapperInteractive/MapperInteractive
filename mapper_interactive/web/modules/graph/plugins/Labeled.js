"use strict";

/**
 * Enable graph show labels on nodes.
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

define(function (require) {

  var GraphBehavior = require('../Plugin');

  return function (_GraphBehavior) {
    _inherits(Labeled, _GraphBehavior);

    function Labeled() {
      _classCallCheck(this, Labeled);

      return _possibleConstructorReturn(this, (Labeled.__proto__ || Object.getPrototypeOf(Labeled)).apply(this, arguments));
    }

    _createClass(Labeled, [{
      key: 'initialize',
      value: function initialize() {
        this.name = 'labeled';
        this.labels = null;
      }
    }, {
      key: 'didMount',
      value: function didMount() {
        var _this2 = this;

        _get(Labeled.prototype.__proto__ || Object.getPrototypeOf(Labeled.prototype), 'didMount', this).call(this);

        this.events.listenTo(this.graph, 'didRender', function () {
          return _this2._graphDidRender();
        });

        this.events.listenTo(this.graph, 'didLayout', function () {
          _this2.graph.svg.selectAll('.viewer-graph__label').data(_this2.graph.getNodes().data()).attr('dx', function (d) {
            return d.x;
          }).attr('dy', function (d) {
            return d.y + 1;
          }).attr('text-anchor', 'middle').attr('alignment-baseline', 'middle');
        });
      }
    }, {
      key: '_graphDidRender',
      value: function _graphDidRender() {
        this.labels = this.graph.svg.append("g").selectAll("text").data(this.graph.getNodes().data()).enter().append("text").attr("dx", 12).attr("dy", ".35em").text(function (d) {
          return d.id;
        }).classed('viewer-graph__label', true);
      }
    }]);

    return Labeled;
  }(GraphBehavior);
});